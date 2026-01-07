import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Domains from './pages/Domains';
import BalanceWheel from './pages/BalanceWheel';
import Reflection from './pages/Reflection';
import Review from './pages/Review';
import Insights from './pages/Insights';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((state) => state.token);
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="domains" element={<Domains />} />
        <Route path="balance-wheel" element={<BalanceWheel />} />
        <Route path="reflection" element={<Reflection />} />
        <Route path="review" element={<Review />} />
        <Route path="insights" element={<Insights />} />
      </Route>
    </Routes>
  );
}

export default App;
