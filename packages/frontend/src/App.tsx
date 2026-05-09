import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Domains from './pages/Domains';
import BalanceWheel from './pages/BalanceWheel';
import Reflection from './pages/Reflection';
import Review from './pages/Review';
import Insights from './pages/Insights';
import Subscriptions from './pages/Subscriptions';
import MindsetManagement from './pages/MindsetManagement';
import DevEnvironment from './pages/DevEnvironment';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="domains" element={<Domains />} />
        <Route path="balance-wheel" element={<BalanceWheel />} />
        <Route path="reflection" element={<Reflection />} />
        <Route path="review" element={<Review />} />
        <Route path="insights" element={<Insights />} />
        <Route path="subscriptions" element={<Subscriptions />} />
        <Route path="mindset" element={<MindsetManagement />} />
        <Route path="dev-environment" element={<DevEnvironment />} />
      </Route>
    </Routes>
  );
}

export default App;
