import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, FileText, PlusCircle, BarChart3, Shield, Plane, LogOut,
  Building2, Users, Briefcase, Network, UserCog, ScrollText, KeyRound, UserPlus
} from "lucide-react";
import { logAudit } from "@/lib/audit";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: LayoutDashboard },
  { name: "Liste des cas", href: "/cases", icon: FileText },
  { name: "Cas par service", href: "/cases-by-service", icon: Building2 },
  { name: "Utilisateurs par rôle", href: "/users-by-role", icon: Users },
  { name: "Nouveau cas", href: "/new", icon: PlusCircle },
  { name: "Statistiques", href: "/stats", icon: BarChart3 },
];

const adminNavigation = [
  { name: "Utilisateurs", href: "/admin/users", icon: UserCog },
  { name: "Register", href: "/admin/register", icon: UserPlus },
  { name: "Rôles", href: "/admin/roles", icon: Users },
  { name: "Services parents", href: "/admin/service-parents", icon: Network },
  { name: "Services", href: "/admin/services", icon: Briefcase },
  { name: "Journal d'audit", href: "/admin/audit", icon: ScrollText },
];

export function Sidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col gradient-header">
      <div className="flex h-16 items-center gap-3 px-6 border-b border-sidebar-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
          <Shield className="h-6 w-6 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground">DPAF</h1>
          <p className="text-xs text-sidebar-foreground/70">Fraudes Documentaires</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {profile?.role === "ADMIN" && (
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <p className="px-3 mb-2 text-xs font-semibold uppercase text-sidebar-foreground/50">Administration</p>
            {adminNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-2">
        <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/30 px-3 py-2">
          <Plane className="h-5 w-5 text-sidebar-foreground/70" />
          <div>
            <p className="text-xs font-medium text-sidebar-foreground">{profile?.full_name || "Utilisateur"}</p>
            <p className="text-xs text-sidebar-foreground/60">{profile?.role || ""}</p>
          </div>
        </div>
        <Link
          to="/change-password"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <KeyRound className="h-4 w-4" />
          Changer mot de passe
        </Link>
        <button
          onClick={async () => { await logAudit("LOGOUT"); await signOut(); }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}
