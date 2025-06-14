import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FormEntry from './pages/FormEntry';
import FormView from './pages/FormView';
import FormRoomDashboard from './pages/FormRoomDashboard';
import FormResults from './pages/FormResults';
import Layout from './Layout';

const App = () => {
  const [auth, setAuth] = useState<{ token: string | null; role: string | null; loading: boolean }>({ token: null, role: null, loading: true });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    setAuth({ token, role, loading: false });
  }, []);

  if (auth.loading) return null;

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LoginPage />} />
        <Route
          path="dashboard"
          element={auth.token && auth.role === 'admin' ? <Dashboard /> : <Navigate to="/" />}
        />
        <Route
          path="formdashboard"
          element={auth.token && auth.role === 'admin' ? <FormRoomDashboard /> : <Navigate to="/" />}
        />
        <Route
          path="enter-form"
          element={auth.token ? <FormEntry /> : <Navigate to="/" />}
        />
        <Route
          path="form/:formId"
          element={auth.token ? <FormView /> : <Navigate to="/" />}
        />
        <Route
          path="form-results/:formId"
          element={auth.token && auth.role === 'admin' ? <FormResults /> : <Navigate to="/" />}
        />
      </Route>
    </Routes>
  );
};

export default App;
