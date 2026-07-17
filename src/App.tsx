import { useRef, useState } from "react";
import { useContracts } from "./hooks/useContracts";
import { useConsumption } from "./hooks/useConsumption";
import { useClickOutside } from "./hooks/useClickOutside";

function App() {
  const { contracts, loading: contractsLoading, error: contractsError } = useContracts();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { consumption, loading: consumptionLoading, error: consumptionError } = useConsumption(selectedId);

  const boxRef = useRef<HTMLDivElement>(null);
  const [outsideClicks, setOutsideClicks] = useState(0);
  useClickOutside(boxRef, () => setOutsideClicks((n) => n + 1));

  return (
    <div style={{ padding: 20 }}>
      <h1>HOOK TEST HARNESS</h1>

      <section>
        <h2>useContracts</h2>
        <p data-testid="contracts-loading">loading: {String(contractsLoading)}</p>
        <p data-testid="contracts-error">error: {String(contractsError)}</p>
        <ul data-testid="contracts-list">
          {contracts.map((c) => (
            <li key={c.id}>
              <button onClick={() => setSelectedId(c.id)}>
                {c.id} - {c.tarifa_nombre} - {c.direccion}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>useConsumption (selectedId: {String(selectedId)})</h2>
        <p data-testid="consumption-loading">loading: {String(consumptionLoading)}</p>
        <p data-testid="consumption-error">error: {String(consumptionError)}</p>
        <p data-testid="consumption-count">count: {consumption.length}</p>
        <p data-testid="consumption-first">{consumption[0] ? JSON.stringify(consumption[0]) : "none"}</p>
      </section>

      <section>
        <h2>useClickOutside</h2>
        <p data-testid="outside-clicks">outsideClicks: {outsideClicks}</p>
        <div
          ref={boxRef}
          style={{ width: 200, height: 100, background: "lightgreen" }}
        >
          click inside me (should NOT increment)
        </div>
        <div style={{ width: 200, height: 100, background: "pink", marginTop: 10 }}>
          click me OUTSIDE the green box (SHOULD increment)
        </div>
      </section>
    </div>
  );
}

export default App;
