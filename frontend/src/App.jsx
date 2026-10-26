import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import SslData from './pages/SslData';
import WorkingDays from './pages/WorkingDays';
import FaultLogs from './pages/FaultLogs';
import UsersPage from './pages/UsersPage';
import BulkApprove from './pages/BulkApprove';
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
        <Route path="fe-submissions" element={<Placeholder title="Field Engineer Submissions" />} />
        <Route path="swap-requests" element={<Placeholder title="Swap Requests" />} />
        <Route path="lights-location" element={<Placeholder title="Lights Location" />} />
        <Route path="reports/working-days" element={<WorkingDays />} />
        <Route path="reports/fault-logs" element={<FaultLogs />} />
        <Route path="users/sub-users" element={<UsersPage role="sub_user" title="Sub Users" />} />
        <Route path="users/field-engineers" element={<UsersPage role="field_engineer" title="Field Engineers" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
