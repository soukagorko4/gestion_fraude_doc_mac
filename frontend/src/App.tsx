import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { passwordAgeStatus } from "@/lib/security";
import { toast } from "sonner";
import Dashboard from "./pages/Dashboard";
import CasesList from "./pages/CasesList";
import NewCase from "./pages/NewCase";
import Statistics from "./pages/Statistics";
import ListeCasdeFraudeParService from "./pages/ListeCasdeFraudeParService";
import AdminRoles from "./pages/AdminRoles";
import AdminServiceParents from "./pages/AdminServiceParents";
import AdminServices from "./pages/AdminServices";
import AdminUsers from "./pages/AdminUsers";
import Register from "./pages/Register";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import RoleParUtilisateur from "./pages/RoleParUtilisateur";
import ChangePassword from "./pages/ChangePassword";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, appUser, profile } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (appUser && profile && profile.role !== "ADMIN") {
      const status = passwordAgeStatus(appUser.password_last_changed, profile.role);
      if (status.warn) {
        toast.warning(`Votre mot de passe expire dans ${status.daysLeft} jour(s).`, { id: "pwd-warn" });
      }
    }
  }, [appUser, profile]);

  if (loading) return <div className="flex h-screen items-center justify-center text-muted-foreground">Chargement...</div>;
  if (!user) return <Navigate to="/login" replace />;

  // Force password change if flagged or expired (non-admin)
  if (appUser && location.pathname !== "/change-password") {
    if (appUser.force_password_change) return <Navigate to="/change-password" replace />;
    if (profile && profile.role !== "ADMIN") {
      const status = passwordAgeStatus(appUser.password_last_changed, profile.role);
      if (status.expired) return <Navigate to="/change-password" replace />;
    }
  }
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginGuard />} />
    <Route path="/change-password" element={<ProtectedRoute><Layout><ChangePassword /></Layout></ProtectedRoute>} />
    <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
    <Route path="/cases" element={<ProtectedRoute><Layout><CasesList /></Layout></ProtectedRoute>} />
    <Route path="/new" element={<ProtectedRoute><Layout><NewCase /></Layout></ProtectedRoute>} />
    <Route path="/stats" element={<ProtectedRoute><Layout><Statistics /></Layout></ProtectedRoute>} />
    <Route path="/cases-by-service" element={<ProtectedRoute><Layout><ListeCasdeFraudeParService /></Layout></ProtectedRoute>} />
    <Route path="/admin/users" element={<ProtectedRoute><Layout><AdminUsers /></Layout></ProtectedRoute>} />
    <Route path="/admin/register" element={<ProtectedRoute><Layout><Register /></Layout></ProtectedRoute>} />
    <Route path="/admin/roles" element={<ProtectedRoute><Layout><AdminRoles /></Layout></ProtectedRoute>} />
    <Route path="/users-by-role" element={<ProtectedRoute><Layout><RoleParUtilisateur /></Layout></ProtectedRoute>} />
    <Route path="/admin/service-parents" element={<ProtectedRoute><Layout><AdminServiceParents /></Layout></ProtectedRoute>} />
    <Route path="/admin/services" element={<ProtectedRoute><Layout><AdminServices /></Layout></ProtectedRoute>} />
    <Route path="/admin/audit" element={<ProtectedRoute><Layout><AdminAuditLogs /></Layout></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function LoginGuard() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
