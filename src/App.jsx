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
import HookUseContext from "./playground/hooks/HookUseContext";
import HookUseRef from "./playground/hooks/HookUseRef";
import HookUseImperativeHandle from "./playground/hooks/HookUseImperativeHandle";
import HookUseMemo from "./playground/hooks/HookUseMemo";
import HookUseCallback from "./playground/hooks/HookUseCallback";
import HookUseTransition from "./playground/hooks/HookUseTransition";
import HookUseDeferredValue from "./playground/hooks/HookUseDeferredValue";
import LoginPage from "./pages/LoginPage";
import RegistroUsuario from "./pages/RegistroUsuario";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeHooks />} />
        <Route path="/hookusestate" element={<HookUseState />} />
        <Route path="/hookuseducer" element={<HookUseReducer />} />
        <Route path="/hookuseeffect" element={<HookUseEffect />} />
        <Route path="/hookuselayouteffect" element={<HookUseLayoutEffect />} />
        <Route path="/hookuseinsertioneffect" element={<HookUseInsertionEffect />} />
        <Route path="/hookuseoptimistic" element={<HookUseOptimistic />} />
        <Route path="/hookusenavigate" element={<HookUseNavigate />} />
        <Route path="/hookuseid" element={<UseId />} />
        <Route path="/hookusdebugvalue" element={<UseDebugValue />} />
        <Route path="/hookusynxexternalstore" element={<UseSyncExternalStore />} />
        <Route path="/hookuse" element={<Use />} />
        <Route path="/hookuseactionstate" element={<UseActionState />} />
        <Route path="/hookuseformstatus" element={<UseFormStatus />} />
        <Route path="/hookusecontext" element={<HookUseContext />} />
        <Route path="/hookuseref" element={<HookUseRef />} />
        <Route path="/hookuseimperativehandle" element={<HookUseImperativeHandle />} />
        <Route path="/hoikusememo" element={<HookUseMemo />} />
        <Route path="/hoikusecallback" element={<HookUseCallback />} />
        <Route path="/hookusetransition" element={<HookUseTransition />} />
        <Route path="/hoikusedeferredvalue" element={<HookUseDeferredValue />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrousuario" element={<RegistroUsuario />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
