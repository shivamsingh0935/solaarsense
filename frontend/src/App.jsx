import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SslData from './pages/SslData';
import WorkingDays from './pages/WorkingDays';
import FaultLogs from './pages/FaultLogs';
import UsersPage from './pages/UsersPage';
import BulkApprove from './pages/BulkApprove';
import LightsLocation from './pages/LightsLocation';
import FeSubmissions from './pages/FeSubmissions';
import SwapRequests from './pages/SwapRequests';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

function Protected({ children }) {
  return localStorage.getItem('token') ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="ssl-data" element={<SslData />} />
        <Route path="bulk-approve" element={<BulkApprove />} />
        <Route path="fe-submissions" element={<FeSubmissions />} />
        <Route path="swap-requests" element={<SwapRequests />} />
        <Route path="lights-location" element={<LightsLocation />} />
        <Route path="reports/working-days" element={<WorkingDays />} />
        <Route path="reports/fault-logs" element={<FaultLogs />} />
        <Route path="users/sub-users" element={<UsersPage role="sub_user" title="Sub Users" />} />
        <Route path="users/field-engineers" element={<UsersPage role="field_engineer" title="Field Engineers" />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
