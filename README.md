# Gana Energía — Área Cliente Dashboard

Dashboard del área de cliente de una comercializadora eléctrica: desplegable
de contratos/suministros, tarjeta de tarifa contratada y gráfica del
historial de facturación.

## Demo

https://gana-energia-dashboard.vercel.app/

## Cómo ejecutar en local

```bash
npm install
npm run dev
```

La app arranca en `http://localhost:5173` (o el siguiente puerto libre). El
proxy configurado en `vite.config.ts` redirige `/api/*` a la API real
(`https://gana-front.vercel.app`) para evitar problemas de CORS en
desarrollo — no requiere ninguna variable de entorno adicional.

En producción no existe ningún servidor de desarrollo que pueda hacer de
proxy, así que el mismo problema de CORS se resuelve con un `rewrite` en
`vercel.json`, que redirige `/api/*` hacia la API real de forma transparente
para el navegador (el propio Vercel reenvía la petición server-to-server).
Así, tanto en local como en el
[deploy](https://gana-energia-dashboard.vercel.app/), el código de
`src/api/services.ts` usa siempre rutas relativas sin necesitar ningún
cambio entre entornos.

Otros comandos disponibles:

```bash
npm run build       # typecheck (tsc -b) + build de producción
npm run lint        # ESLint
npm run format      # Prettier --write
npm run storybook   # catálogo de componentes aislados en :6006
```

## Decisiones técnicas

### Stack

- **React 18 + TypeScript + Vite**: Vite da un arranque y HMR instantáneos
  frente a un setup de Webpack/CRA, y TypeScript en modo estricto (sin
  `any`) atrapa en tiempo de compilación errores de forma de los datos de la
  API, que es justo donde más falla este tipo de dashboards.
- **CSS Modules**: estilos con scope por componente sin necesidad de una
  capa de utilidades (Tailwind) ni de runtime CSS-in-JS (styled-components).
  Para un dashboard de tamaño acotado con un puñado de componentes, es la
  opción con menos dependencias y curva de aprendizaje más baja, manteniendo
  el CSS legible y colocado junto al componente que lo usa. Cada componente
  define sus propios breakpoints en su `.module.css` (en vez de un único
  breakpoint global) para el layout responsive; el caso especial es
  `BillingChart`, donde el hook `useMediaQuery`
  (`src/hooks/useMediaQuery.ts`) ajusta en JS la altura y el tamaño de
  barra de la gráfica de Recharts en móvil, algo que no se puede resolver
  solo con CSS.
- **Recharts**: gráfica de barras declarativa sobre SVG, con soporte nativo
  de tooltip y ejes personalizables. Evita escribir en canvas o D3 a mano
  para un único gráfico de barras con paginación.
- **`fetch` nativo, sin axios**: la API solo expone dos endpoints GET
  simples; añadir axios como dependencia no aporta nada que `fetch` no
  resuelva ya (ver `src/api/services.ts`).
- **Storybook**: catálogo de componentes aislados, usado durante el
  desarrollo para verificar los estados de carga, error y vacío de cada
  componente sin necesidad de manipular la API real.

### Estructura de carpetas

```
src/
├── api/          servicios de API (fetch a la API externa)
├── components/   componentes de UI, cada uno en su carpeta:
│   │             Componente.tsx + Componente.module.css
│   │             (+ Componente.stories.tsx, catálogo de Storybook)
│   └── ui/       componentes genéricos reutilizables (Spinner, ErrorMessage,
│                 ErrorBoundary, GanarIcon) sin lógica de dominio
├── context/      ContractContext (estado compartido vía Context+useReducer)
├── hooks/        custom hooks (useContracts, useConsumption, useClickOutside)
├── styles/       variables.css (design tokens) y global.css (reset)
└── types/        tipos TypeScript compartidos (Contract, ConsumptionRecord…)
```

La separación por carpeta y no por tipo de archivo (`components/`,
`styles/`, `hooks/` a nivel de proyecto, en vez de un `hooks.ts` gigante)
hace que cada componente sea autocontenido: para tocar el `TariffCard` solo
hay que abrir su carpeta, no rastrear estilos o stories dispersos por el
repo. La subcarpeta `ui/` distingue explícitamente los componentes "tontos"
y reutilizables (no saben nada de contratos ni consumo) de los componentes
de dominio (`TariffCard`, `BillingChart`…), que si conocen la forma de los
datos de la API.

### Gestión de estado

El estado que de verdad se comparte entre componentes es mínimo: **qué
contrato está seleccionado** y **en qué unidad se muestra la gráfica** (€ o
kWh). Todo lo demás (loading, error, datos) vive local a cada custom hook
que hace el fetch. Con esa superficie tan pequeña, Redux o Zustand habrían
sido una capa de indirección sin beneficio real; `Context + useReducer` da
exactamente lo necesario: un estado tipado con acciones explícitas, sin
dependencias externas ni boilerplate de store/slices.

### Cómo funciona la gestión de estado compartido

- `ContractProvider` (`src/context/ContractContext.tsx`) envuelve toda la
  app y mantiene `{ selectedContractId, viewMode }` en un `useReducer` con
  dos acciones: `SELECT_CONTRACT` y `SET_VIEW_MODE`.
- El `ContractDropdown` despacha `SELECT_CONTRACT` → `App.tsx` reacciona
  vía `useConsumption(selectedContractId)`, que vuelve a hacer fetch del
  historial de consumo del nuevo contrato; `TariffCard` recibe el contrato
  ya resuelto (`contracts.find(...)`) sin ningún fetch propio.
- El `Toggle` de la gráfica despacha `SET_VIEW_MODE` → `BillingChart` cambia
  entre `eur`/`kwh` leyendo el mismo array de consumo ya cargado, **sin
  refetch**: el cambio de unidad es puramente de presentación.
- Los custom hooks `useContracts` y `useConsumption` encapsulan toda la
  lógica de fetching (loading, error, cancelación en `unmount`/cambio de
  dependencia, y un `refetch` manual) para que ningún componente de UI haga
  `fetch` directamente ni gestione sus propios flags de carga.

### Manejo de errores y estados de carga

Cada hook de datos (`useContracts`, `useConsumption`) expone
`{ loading, error, refetch }` además de los datos. Esos tres valores se
propagan como props hasta los componentes de presentación, que son los que
deciden cómo pintarlos:

- **Loading**: skeletons con animación shimmer específicos de cada
  componente (barras de altura variable en `BillingChart`, líneas/pill en
  `TariffCard`, spinner inline en el trigger del `ContractDropdown`) en vez
  de un spinner de página completa — el layout no salta cuando llegan los
  datos reales.
- **Error**: un componente `ErrorMessage` (`src/components/ui/ErrorMessage`)
  reutilizado en `TariffCard`, `BillingChart` y `ContractDropdown`, con
  mensaje y botón "Reintentar" que llama al `refetch` del hook
  correspondiente — cada bloque de la UI puede fallar y recuperarse de
  forma independiente sin recargar la página.
- **Vacío**: `BillingChart` distingue explícitamente "sin facturas todavía"
  (array vacío sin error) de un error real, con su propio mensaje.
- **Errores inesperados de render**: un `ErrorBoundary` de clase
  (`src/components/ui/ErrorBoundary`) envuelve toda la app en `main.tsx`
  como red de seguridad ante fallos de renderizado no previstos por la
  lógica de arriba, mostrando un fallback con botón de recarga.
- La API real soporta `?simulateError=true` y `?delay={ms}` en ambos
  endpoints, lo que se usó durante el desarrollo para verificar estos
  estados contra la API de verdad y no solo con mocks en Storybook.

## Qué haría con más tiempo

- Tests unitarios (Vitest) y de integración (Testing Library) — el proyecto
  no tiene suite de tests todavía, solo verificación manual y visual vía
  Storybook.
- Animaciones en la transición de datos al cambiar de contrato.
- Dark mode.
- PWA con service worker para uso offline.
- Virtualización de la gráfica si hubiera miles de datos.
- Cobertura completa de accesibilidad: navegación por teclado del dropdown
  y verificación con lector de pantalla.

## Uso de IA

Usé Claude Code como asistente durante todo el desarrollo, dentro de mi
editor. En líneas generales me ayudó a:

- **Ensamblar el flujo de datos completo en `App.tsx`**: conectar
  `ContractProvider`, `useContracts` y `useConsumption`, seleccionar el
  primer contrato automáticamente al cargar, y cablear el layout de dos
  columnas (tarjeta de tarifa + gráfica).
- **Corregir la lógica de paginación de `BillingChart`**: la vista inicial
  arrancaba en la página 1 (datos más antiguos) en vez de en la última
  página (datos más recientes), que es el comportamiento que especifica el
  enunciado. Se localizó el problema en la inicialización de `currentPage`
  y en el reset al cambiar de contrato, y se verificó contra los datos
  reales de ambos contratos (30 registros → página 3 con 6 meses, 20
  registros → página 2 con 8 meses).
- **Restaurar la configuración de proxy de Vite** (`server.proxy` en
  `vite.config.ts`) y volver a rutas relativas (`/api/...`) en
  `src/api/services.ts` para eliminar los errores de CORS contra la API real
  en desarrollo local.
- **Diagnosticar y gestionar el problema de CORS de la API**: al arrancar el
  proyecto con los componentes reales haciendo fetch desde el navegador, los
  datos dejaron de llegar con un error "No Access-Control-Allow-Origin
  header is present". Se diagnosticó que el problema no estaba en el código
  propio sino en las serverless functions del enunciado (`contracts.js` y
  `consumption.js` no incluían esa cabecera), se verificó por triplicado
  (código fuente, navegador real, descarte de Postman/curl como
  herramientas no sujetas a CORS), y se comunicó a la empresa de forma
  proactiva con una descripción técnica precisa. En paralelo se restauró el
  proxy de Vite como solución temporal para no bloquear el desarrollo,
  aunque resultó ser una solución parcial: cubría la navegación directa a
  la URL pero no las peticiones `fetch()` reales desde JavaScript de otro
  origen, que es justo el escenario de la propia app — el problema
  reapareció al ensamblar los componentes reales.
- **Implementar una solución de CORS definitiva e independiente de
  terceros**: en vez de depender de un segundo aviso a la empresa y esperar
  de nuevo, se añadió un `rewrite` en `vercel.json`
  (`/api/:path*` → `https://gana-front.vercel.app/api/:path*`) que resuelve
  el CORS también en el entorno de producción, sin depender de que la API
  externa añada nunca esas cabeceras. Verificado en el propio deploy: las
  peticiones a `/api/contracts` y `/api/consumption` funcionan sin ningún
  error de CORS en consola.
- **Construir los estados de carga y error de extremo a extremo**: los
  componentes `Spinner`, `ErrorMessage` y `ErrorBoundary`, los skeletons con
  shimmer de `TariffCard` y `BillingChart`, y propagar `loading`/`error`
  desde `useContracts` hasta el `ContractDropdown` con su propio botón de
  reintento.
- **Pulido visual comparando contra el diseño**: ajustes de tipografía,
  espaciados, estados de `:focus-visible` y `hover` en todos los elementos
  interactivos, y una serie de correcciones puntuales de estilo (color del
  botón "Contratar", radio de borde y sombra del dropdown, tono de fondo de
  la tarjeta de bienvenida, alineación del logo) que fui indicando a partir
  de comparar capturas del resultado renderizado.
- Cuando no tuve acceso a la fuente de verdad del diseño (el archivo de
  Figma quedó bloqueado por el límite de la API de su plugin), Claude lo
  señaló explícitamente en vez de inventar valores de color o tamaño, y
  seguimos por inspección visual de las capturas compartidas.

Todo el código generado fue revisado, ejecutado y verificado visualmente
(navegador real vía Chrome DevTools y Storybook) antes de aceptarlo; ninguna
decisión de arquitectura (Context vs. Redux, CSS Modules vs. Tailwind, etc.)
se tomó sin mi validación explícita.

## Supuestos asumidos

- **Forma de la respuesta de la API**: el enunciado original sugiere que
  ambos endpoints devuelven los datos envueltos en `{ data: [...] }`, pero
  verificando contra la API real (`https://gana-front.vercel.app`) esta
  devuelve directamente un array plano (`Contract[]` /
  `ConsumptionRecord[]`). El código sigue el comportamiento real verificado,
  no el documentado.
- **Orden cronológico de `consumption`**: la API devuelve los registros de
  más antiguo a más reciente; se asumió que ese orden es estable y se
  construyó la paginación (bloques de 12 meses, más recientes a la derecha)
  sobre esa base sin reordenar los datos.
- **Interpretación de "primera página" al cambiar de contrato**: el
  enunciado indica que al cambiar de contrato la gráfica debe recargarse
  "empezando de nuevo en la primera página", pero también especifica que
  los datos más recientes deben mostrarse por defecto (a la derecha, como
  última gráfica). Se interpretó "primera página" como la página por
  defecto que ve el usuario al entrar — que en esta implementación es la
  que contiene los meses más recientes — y no como el índice de página 1
  en sentido literal, ya que esa segunda lectura entraría en contradicción
  con el resto del enunciado.
- **Selección inicial de contrato**: al no especificarse cuál debe verse por
  defecto, se asumió que debe seleccionarse automáticamente el primer
  contrato de la lista devuelta por `/api/contracts` en cuanto llega.
- **Acciones de "Contratar" y "Salir"**: al no formar parte del alcance
  funcional del dashboard (no hay flujo de contratación ni autenticación
  reales que implementar), quedan como acciones simuladas (`console.log`)
  en vez de navegación real.
- **Avatar de usuario**: al no proveerse una imagen real del cliente, se usó
  un placeholder (`pravatar.cc`) únicamente a efectos visuales.
