import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeHooks from "./playground/HomeHooks";
import UseId from "./playground/hooks/UseId";
import UseDebugValue from "./playground/hooks/UseDebugValue";
import UseSyncExternalStore from "./playground/hooks/UseSyncExternalStore";
import Use from "./playground/hooks/Use";
import UseActionState from "./playground/hooks/UseActionState";
import UseFormStatus from "./playground/hooks/UseFormStatus";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Bienvenido a nuestro proyecto</h1>} />
        <Route path="/homehooks" element={<HomeHooks />} />
        <Route path="/useid" element={<UseId />} />
        <Route path="/usedebugvalue" element={<UseDebugValue />} />
        <Route path="/usesyncexternalstore" element={<UseSyncExternalStore />} />
        <Route path="/use" element={<Use />} />
        <Route path="/useactionstate" element={<UseActionState />} />
        <Route path="/useformstatus" element={<UseFormStatus />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
