# Flujos de datos del dashboard

Representación visual esquemática de las dos funcionalidades principales del
proyecto. Cada diagrama recorre el dato desde que el usuario interactúa con la
UI hasta que se renderiza, incluyendo **todas las ramas posibles**: carga
(loading), éxito, error de red y error HTTP.

## Cómo leer los diagramas

| Forma / color | Significado |
|---------------|-------------|
| Rombo `◇` | Punto de decisión (bifurcación del flujo) |
| Cilindro | API externa (`gana-front.vercel.app`) |
| Naranja | Estado de carga (loading) |
| Rojo | Rama de error |
| Verde | Rama de éxito / datos disponibles |
| Azul | Capa de red (fetch + proxy) |
| Flecha punteada | Efecto secundario / render derivado (no continúa el flujo principal) |

Ideas transversales a los dos flujos:

- Las rutas del `fetch` son **relativas** (`/api/...`). Un **proxy** las reenvía
  a la API real (Vite en desarrollo, `vercel.json` en producción), evitando CORS.
- El **estado de servidor** (contratos, consumo) vive en los hooks; el **Context**
  solo guarda `selectedContractId` y `viewMode`. El `selectedContractId` es el
  pegamento entre ambas features: la Feature 1 lo escribe, la Feature 2 lo lee.
- El **reintento** es siempre el mismo mecanismo: `onRetry → refetch →
  reloadToken++ → se re-ejecuta el useEffect del hook`.
- El flag `cancelled` de la cláusula de limpieza descarta respuestas obsoletas
  (doble montaje de StrictMode y cambios rápidos de contrato).

---

## Feature 1 — Carga y selección de contratos

Desde el arranque de la app hasta que el `ContractDropdown` muestra los
contratos y el usuario (o la auto-selección) elige uno. El nodo final enlaza
con la Feature 2.

```mermaid
flowchart TD
    Start(["Carga de la app - main.tsx"]) --> Boot["ErrorBoundary - App - ContractProvider - Dashboard"]
    Boot --> UC["Dashboard llama a useContracts"]
    UC --> Eff["useEffect al montar<br/>setLoading true, setError null"]
    Eff --> LoadingUI{"loading es true"}
    LoadingUI -. render .-> DDload["ContractDropdown: Spinner<br/>mas texto Cargando contratos<br/>trigger disabled"]
    Eff --> Svc["getContracts - services.ts"]
    Svc --> Fetch["fetch a /api/contracts<br/>ruta relativa, mismo origen"]
    Fetch --> Proxy["Proxy: Vite en dev, rewrite vercel.json en prod<br/>hacia gana-front.vercel.app"]
    Proxy --> API[("API externa<br/>GET /api/contracts")]
    API --> NetOk{"el fetch resuelve"}
    NetOk -- No, red caida --> NetErr["throw Error de conexion"]
    NetOk -- Si --> HttpOk{"response.ok"}
    HttpOk -- No, 4xx o 5xx --> ParseErr["parseErrorMessage<br/>body.error o fallback HTTP"]
    ParseErr --> HttpErr["throw Error con mensaje"]
    HttpOk -- Si --> Json["response.json como Contract array"]
    NetErr --> Catch["catch en useContracts<br/>setError mensaje"]
    HttpErr --> Catch
    Json --> SetOk["setContracts data"]
    Catch --> Finally["finally: setLoading false"]
    SetOk --> Finally
    Finally --> Branch{"hay error"}
    Branch -- Si --> ErrUI["ContractDropdown:<br/>errorTrigger mas boton Reintentar"]
    ErrUI -- click Reintentar --> Refetch["onRetry = refetchContracts<br/>incrementa reloadToken"]
    Refetch --> Eff
    Branch -- No --> OkUI["ContractDropdown:<br/>opciones, role listbox"]
    OkUI --> AutoSel["useEffect auto-seleccion en Dashboard:<br/>si selectedId es null,<br/>dispatch SELECT_CONTRACT con contracts 0"]
    OkUI --> Click["Usuario hace click en una opcion"]
    Click --> Handle["handleSelect - onSelect - Header.handleSelect<br/>dispatch SELECT_CONTRACT, cierra panel"]
    AutoSel --> Store["Context: selectedContractId actualizado"]
    Handle --> Store
    Store --> Next(["Dispara la Feature 2: carga de consumo"])

    classDef loading fill:#fff4e0,stroke:#f0a500,color:#3a2c00
    classDef error fill:#ffe3e3,stroke:#e03131,color:#5c0000
    classDef ok fill:#e0f7ef,stroke:#3ccfaf,color:#00352a
    classDef api fill:#e7f0ff,stroke:#4c7fff,color:#0a2a66
    class LoadingUI,DDload loading
    class NetErr,HttpErr,ParseErr,Catch,ErrUI error
    class Json,SetOk,OkUI,Store ok
    class Fetch,Proxy,API api
```

---

## Feature 2 — Carga del consumo del contrato seleccionado

Se dispara cuando `selectedContractId` cambia (por la auto-selección inicial o
por un clic del usuario). Termina en el render del `BillingChart`, con sus tres
estados (skeleton, error, vacío) y el procesamiento de los datos hacia la
gráfica. El toggle €/kWh y la paginación **no** vuelven a la red.

```mermaid
flowchart TD
    Trigger(["selectedContractId cambia<br/>auto-seleccion o click del usuario"]) --> Rerender["Dashboard re-renderiza<br/>useConsumption con selectedContractId"]
    Rerender --> Eff["useEffect con contractId y reloadToken"]
    Eff --> NullChk{"contractId es null"}
    NullChk -- Si, estado inicial --> Clear["limpia consumption, loading false, error null<br/>return, sin fetch"]
    NullChk -- No --> SetLoad["setLoading true, setError null"]
    SetLoad --> SkelUI{"loading es true"}
    SkelUI -. render .-> Skeleton["BillingChart: skeleton de 12 barras"]
    SetLoad --> Svc["getConsumption id - services.ts"]
    Svc --> Fetch["fetch a /api/consumption con contract_id"]
    Fetch --> Proxy["Proxy Vite o rewrite Vercel<br/>hacia gana-front.vercel.app"]
    Proxy --> API[("API externa<br/>GET /api/consumption")]
    API --> NetOk{"el fetch resuelve"}
    NetOk -- No, red --> NetErr["throw Error de conexion"]
    NetOk -- Si --> HttpOk{"response.ok"}
    HttpOk -- No, 4xx o 5xx --> ParseErr["parseErrorMessage y throw"]
    HttpOk -- Si --> Json["response.json como ConsumptionRecord array"]
    NetErr --> Cancel1{"cancelled"}
    ParseErr --> Cancel1
    Json --> Cancel2{"cancelled"}
    Cancel1 -- Si, cambio el contrato --> Ignore["se ignora la respuesta obsoleta"]
    Cancel2 -- Si --> Ignore
    Cancel1 -- No --> SetErr["setError mensaje"]
    Cancel2 -- No --> SetData["setConsumption data"]
    SetErr --> Finally["finally: setLoading false"]
    SetData --> Finally
    Finally --> Render{"Estado del BillingChart"}
    Render -- error --> ErrUI["ErrorMessage mas boton Reintentar"]
    ErrUI -- onRetry --> Reload["refetch, incrementa reloadToken"]
    Reload --> Eff
    Render -- consumption vacio --> EmptyUI["Estado vacio: aun no hemos emitido ninguna factura"]
    Render -- con datos --> Pages["totalPages = ceil n dividido 12<br/>currentPage = ultima, recientes a la derecha"]
    Pages --> Slice["pageRecords = slice de 12"]
    Slice --> Slots["buildSlots: mapea a ChartSlot<br/>rellena con slots vacios hasta 12"]
    Slots --> YAxis["getYAxisMax: escala del eje Y con margen y redondeo"]
    YAxis --> Chart["Recharts BarChart<br/>XAxisTick, CustomTooltip, Cells con hover"]
    Chart --> Toggle["Toggle euros o kWh - dispatch SET_VIEW_MODE"]
    Toggle -. recalcula slots sin refetch .-> Slots
    Chart --> Pag["Pagination - goToPage"]
    Pag -. recalcula slice sin refetch .-> Slice

    classDef loading fill:#fff4e0,stroke:#f0a500,color:#3a2c00
    classDef error fill:#ffe3e3,stroke:#e03131,color:#5c0000
    classDef ok fill:#e0f7ef,stroke:#3ccfaf,color:#00352a
    classDef api fill:#e7f0ff,stroke:#4c7fff,color:#0a2a66
    class SkelUI,Skeleton loading
    class NetErr,ParseErr,SetErr,ErrUI error
    class Json,SetData,Chart ok
    class Fetch,Proxy,API api
```

---

## Diagrama de secuencia — diálogo entre capas

Complementa a los dos flowcharts: mientras estos muestran las *ramas*
posibles, este diagrama muestra el *orden temporal* de las llamadas entre
componente, hook, servicio, proxy y API para una selección de contrato
completa (Feature 1 seguida de Feature 2), incluyendo una rama de error y un
reintento.

```mermaid
sequenceDiagram
    actor Usuario
    participant CD as ContractDropdown
    participant HD as Header
    participant CTX as ContractContext
    participant DASH as Dashboard
    participant UCO as useContracts
    participant UCS as useConsumption
    participant SVC as services.ts
    participant PXY as Proxy Vite o Vercel
    participant API as API externa

    Note over DASH,UCO: Montaje inicial de la app
    DASH ->> UCO: useContracts
    UCO ->> SVC: getContracts
    SVC ->> PXY: fetch /api/contracts
    PXY ->> API: GET /api/contracts
    API -->> PXY: 200 con array de contratos
    PXY -->> SVC: response ok
    SVC -->> UCO: Contract array
    UCO -->> DASH: contracts, loading false, error null
    DASH -->> CD: contracts, loading, error via Header

    Note over DASH: useEffect de auto-seleccion
    DASH ->> CTX: dispatch SELECT_CONTRACT con contracts 0
    CTX -->> DASH: selectedContractId actualizado

    Note over DASH,UCS: El cambio de selectedContractId dispara la Feature 2
    DASH ->> UCS: useConsumption con selectedContractId
    UCS ->> SVC: getConsumption id
    SVC ->> PXY: fetch /api/consumption con contract_id
    PXY ->> API: GET /api/consumption
    API -->> PXY: 200 con array de consumo
    PXY -->> SVC: response ok
    SVC -->> UCS: ConsumptionRecord array
    UCS -->> DASH: consumption, loading false, error null
    DASH -->> DASH: BillingChart pinta la grafica

    Note over Usuario,API: El usuario cambia de contrato manualmente
    Usuario ->> CD: click en otra opcion
    CD ->> HD: onSelect id
    HD ->> CTX: dispatch SELECT_CONTRACT id
    CTX -->> DASH: selectedContractId cambia otra vez
    DASH ->> UCS: useConsumption reacciona al nuevo id
    UCS ->> SVC: getConsumption nuevo id
    SVC ->> PXY: fetch /api/consumption con nuevo contract_id
    PXY ->> API: GET /api/consumption

    alt Respuesta con error HTTP
        API -->> PXY: 500 con body error
        PXY -->> SVC: response no ok
        SVC -->> UCS: throw Error con mensaje del body
        UCS -->> DASH: error set, loading false
        DASH -->> DASH: BillingChart muestra ErrorMessage
        Usuario ->> DASH: click en Reintentar
        DASH ->> UCS: refetch incrementa reloadToken
        UCS ->> SVC: getConsumption mismo id otra vez
        SVC ->> PXY: fetch /api/consumption
        PXY ->> API: GET /api/consumption
        API -->> PXY: 200 con array de consumo
        PXY -->> SVC: response ok
        SVC -->> UCS: ConsumptionRecord array
        UCS -->> DASH: consumption, loading false, error null
    else Respuesta correcta
        API -->> PXY: 200 con array de consumo
        PXY -->> SVC: response ok
        SVC -->> UCS: ConsumptionRecord array
        UCS -->> DASH: consumption, loading false, error null
    end
```

---

## Resumen del recorrido de un dato

1. **Arranque** → `useContracts` pide `/api/contracts` a través del proxy.
2. Los contratos llegan → se pintan en el `ContractDropdown` y la
   auto-selección elige el primero (`SELECT_CONTRACT`).
3. Ese cambio en el Context activa `useConsumption`, que pide
   `/api/consumption?contract_id=…`.
4. El consumo llega → `BillingChart` lo pagina de 12 en 12, rellena la última
   página incompleta y lo dibuja con Recharts.
5. El usuario puede **cambiar de contrato** (vuelve al paso 3), **cambiar la
   unidad** (€/kWh, recalcula sin red) o **paginar** (recalcula sin red).
