import { BrowserRouter, Routes, Route } from 'react-router-dom';
import InternalPanel from './pages/InternalPanel';
import ICPPublicPage from './pages/ICPPublicPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Painel interno da agência */}
        <Route path="/" element={<InternalPanel />} />
        {/* URL pública para o cliente — sem nada interno */}
        <Route path="/icp/:leadId" element={<ICPPublicPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
