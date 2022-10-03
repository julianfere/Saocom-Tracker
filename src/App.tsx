import SaocomTracker from "./components/SaocomTracker";

function App() {
  return (
    <div className="App">
      <SaocomTracker satelliteIds={["43641", "46265"]} />
    </div>
  );
}

export default App;
