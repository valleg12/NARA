import { Settings, LogOut, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.svg";

const navigation = [
  { name: "Accueil", href: "/app" },
  { name: "GUARDIANS", href: "/app/guardians" },
  { name: "CASHFLOW", href: "/app/cashflow" },
  { name: "COMPLIANCE", href: "/app/compliance" },
];

const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 min-h-screen bg-muted/20 border-r border-border/50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border/50">
        <Link to="/app" className="flex items-center">
          <img src={logo} alt="NARA" className="h-16 w-auto" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                isActive
                  ? "bg-gold/10 text-foreground font-semibold"
                  : "text-foreground/70 hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-border/50 space-y-2">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-muted/50 hover:text-foreground transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 text-foreground/60 group-hover:text-gold transition-colors" />
          <span className="text-sm">Retour au site</span>
        </Link>

        <Link
          to="/app/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground/70 hover:bg-muted/50 hover:text-foreground transition-all duration-300 group"
        >
          <Settings className="w-5 h-5 text-foreground/60 group-hover:text-gold transition-colors" />
          <span className="text-sm">Paramètres</span>
        </Link>
        
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-sm font-semibold text-foreground">
            NG
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">NARAGent</p>
            <button className="text-xs text-foreground/60 hover:text-foreground flex items-center gap-1 transition-colors">
              <LogOut className="w-3 h-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
