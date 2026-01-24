import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Briefcase, Wallet, User } from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/portfolio", label: "Portfolio", icon: Briefcase },
  { path: "/wallet", label: "Wallet", icon: Wallet },
];

export default function MobileNav({ className }) {
  const location = useLocation();

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 safe-area-bottom",
      className
    )}>
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "fill-primary/20")} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
