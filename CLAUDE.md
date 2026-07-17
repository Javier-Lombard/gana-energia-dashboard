# Gana Energía — Dashboard Área Cliente

Prueba técnica de Frontend Developer para Gana Energía: dashboard del Área
Cliente de una comercializadora eléctrica (desplegable de contratos, tarjeta
de tarifa, gráfica de historial de facturación). React + TypeScript + Vite.

## Stack y decisiones tomadas

- **Estilos**: CSS Modules. Nada de Tailwind ni styled-components.
- **Estado**: Context + `useReducer` para el estado compartido entre el
  desplegable de contratos, la tarjeta de tarifa y la gráfica. Nada de
  Redux ni Zustand.
- **Gráficas**: Recharts.
- **Peticiones HTTP**: `fetch` nativo, sin axios (ver `src/api/services.ts`).

## Estructura de carpetas (`src/`)

```
src/
├── api/          servicios de API (fetch a la API externa)
├── assets/
│   └── icons/    SVGs
├── components/   componentes de UI (cada uno en su carpeta: .tsx + .module.css)
├── context/      React Context
├── hooks/        custom hooks
├── styles/       variables.css y global.css
├── types/        tipos TypeScript compartidos
└── utils/        funciones auxiliares
```

## Convenciones de código

- **Componentes**: PascalCase, cada uno en su propia carpeta con su
  `Componente.tsx` y `Componente.module.css`.
- **Tipado estricto**: nunca `any`. Ver `eslint.config.js`
  (`@typescript-eslint/no-explicit-any` está como error, no warning).
- **Fetching de datos**: siempre a través de un custom hook (ver
  `src/hooks/useContracts.ts` y `src/hooks/useConsumption.ts`), nunca `fetch`
  directamente desde un componente.

## API externa

Base URL: `https://gana-front.vercel.app`

- `GET /api/contracts` — lista de contratos/suministros del cliente.
- `GET /api/consumption?contract_id={id}` — historial de consumo de un
  contrato (`id` obligatorio).

Ambos devuelven un **array plano** (`Contract[]` / `ConsumptionRecord[]`),
**no** envuelto en `{ data: [...] }` — el README del enunciado original sugiere
esa forma envuelta, pero no es lo que la API realmente devuelve (verificado
contra el endpoint real).

Parámetros de simulación disponibles en ambos endpoints (útiles para probar
estados de carga/error):

- `simulateError=true` → fuerza un 500 con `{ "error": "..." }`.
- `delay={ms}` → retrasa la respuesta ese número de milisegundos.

## Paginación de la gráfica de historial

- Bloques de **12 meses por página**.
- Puede haber una última página incompleta: contrato 1 → páginas de 12/12/6
  meses; contrato 2 → páginas de 12/8 meses. La gráfica debe soportar un
  bloque incompleto sin romperse visualmente.
- Los datos más recientes van a la **derecha**: el mes más reciente es
  siempre la última barra visible.

## Comandos

- `npm run dev` — servidor de desarrollo.
- `npm run build` — typecheck (`tsc -b`) + build de producción.
- `npm run lint` — ESLint.
- `npm run format` — Prettier (`--write`).
