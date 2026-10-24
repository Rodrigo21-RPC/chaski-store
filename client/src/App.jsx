import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigationType } from 'react-router-dom';
import AdminGuard from './components/AdminGuard.jsx';
import CustomerLayout from './components/CustomerLayout.jsx';
import AdminAcceso from './pages/AdminAcceso.jsx';
import AdminNuevoProducto from './pages/AdminNuevoProducto.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Detalle from './pages/Detalle.jsx';
import MiPedido from './pages/MiPedido.jsx';
import { StoreProvider } from './state/StoreContext.jsx';

// Al avanzar a otra pantalla la página empieza arriba; al volver atrás, el navegador restaura el scroll.
function ScrollToTop() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    if (navigationType === 'PUSH') window.scrollTo(0, 0);
  }, [pathname, navigationType]);
  return null;
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Catalogo />} />
            <Route path="/producto/:id" element={<Detalle />} />
            <Route path="/pedido" element={<MiPedido />} />
          </Route>
          <Route path="/admin" element={<AdminAcceso />} />
          <Route
            path="/admin/panel"
            element={
              <AdminGuard>
                <AdminPanel />
              </AdminGuard>
            }
          />
          <Route
            path="/admin/productos/nuevo"
            element={
              <AdminGuard>
                <AdminNuevoProducto />
              </AdminGuard>
            }
          />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
