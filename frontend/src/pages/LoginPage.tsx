import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError(null);
      const res = await axios.post('http://localhost:3000/api/auth/login', { email, password });
      console.log('Login response:', res.data);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      navigate(res.data.role === 'admin' ? '/dashboard' : '/enter-form');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    }
  };

  const handleSignup = async () => {
    try {
      setError(null);
      await axios.post('http://localhost:3000/api/auth/register', {
        name,
        email,
        password,
        isAdmin
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Signup failed');
      } else {
        setError('Signup failed');
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h1 className="text-2xl font-bold mb-4">Login / Signup</h1>
        <input
          type="text"
          placeholder="Name (Not needed for login)"
          className="input mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="input mb-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="input mb-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={isAdmin}
            onChange={() => setIsAdmin(!isAdmin)}
          />{' '}
          Admin?
        </label>
        <button className="btn" onClick={handleLogin}>Login</button>
        <button className="btn mt-2" onClick={handleSignup}>Sign up</button>
        {error && (
          <div className="text-red-500 mt-4">{error}</div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
