import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FormEntry from './pages/FormEntry';
import FormView from './pages/FormView';

const App = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={token && role === 'admin' ? <Dashboard /> : <Navigate to="/" />}
      />
      <Route path="/enter-form" element={token ? <FormEntry /> : <Navigate to="/" />} />
      <Route path="/form/:formId" element={token ? <FormView /> : <Navigate to="/" />} />
    </Routes>
  );
};

export default App;
