// src/components/Layout.tsx
import { Link, Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <>
      <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Login</Link>
        <Link to="/dashboard" style={{ marginRight: '1rem' }}>Dashboard</Link>
        <Link to="/formdashboard" style={{ marginRight: '1rem' }}>Form Room Dashboard</Link>
        <Link to="/enter-form" style={{ marginRight: '1rem' }}>Enter Form</Link>
      </nav>
      <div style={{ padding: '1rem' }}>
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
