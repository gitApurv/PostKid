import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/store";
import DashboardLayout from "./layouts/DashboardLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import RequestsBuilderPage from "./pages/RequestsBuilderPage";
import WorkspacesPage from "./pages/WorkspacesPage";
import EnvironmentManager from "./pages/EnvironmentManager";
import HistoryPage from "./pages/HistoryPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <BrowserRouter>
      <Routes>
        {/* Unauthenticated Routes */}
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} />

        {/* Authenticated Routes */}
        <Route element={isAuthenticated ? <DashboardLayout /> : <Navigate to="/login" replace />}>
          <Route path="/" element={<RequestsBuilderPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="/environments" element={<EnvironmentManager />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback wildcard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
