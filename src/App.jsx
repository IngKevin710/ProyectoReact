import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomeHooks from "./playground/HomeHooks";
import HookUseState from "./playground/hooks/HookUseState";
import HookUseReducer from "./playground/hooks/HookUseReducer";
import HookUseEffect from "./playground/hooks/HookUseEffect";
import HookUseLayoutEffect from "./playground/hooks/HookUseLayoutEffect";
import HookUseInsertionEffect from "./playground/hooks/HookUseInsertionEffect";
import HookUseOptimistic from "./playground/hooks/HookUseOptimistic";
import HookUseNavigate from "./playground/hooks/HookUseNavigate";
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
        <Route path="/" element={<HomeHooks />} />
        <Route path="/usestate" element={<HookUseState />} />
        <Route path="/usereducer" element={<HookUseReducer />} />
        <Route path="/useeffect" element={<HookUseEffect />} />
        <Route path="/uselayouteffect" element={<HookUseLayoutEffect />} />
        <Route path="/useinsertioneffect" element={<HookUseInsertionEffect />} />
        <Route path="/useoptimistic" element={<HookUseOptimistic />} />
        <Route path="/usenavigate" element={<HookUseNavigate />} />
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
