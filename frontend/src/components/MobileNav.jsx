import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Briefcase, Wallet, Eye, LogOut, Video, HelpCircle } from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../App";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "./ui/dropdown-menu";

const baseNavItems = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/watchlist", label: "Watch", icon: Eye },
  { path: "/portfolio", label: "Portfolio", icon: Briefcase },
  { path: "/wallet", label: "Wallet", icon: Wallet },
];

const whyAllowedEmails = ["kshitiz.dadhich2015@gmail.com", "rumingliu1303@gmail.com"];

export default function MobileNav({ className }) {
  const location = useLocation();
  const { user, logout, isCreator } = useAuth();

  const navItems = [
    ...baseNavItems,
    ...(isCreator ? [{ path: "/studio", label: "Studio", icon: Video }] : []),
    ...(whyAllowedEmails.includes(user?.email) ? [{ path: "/why", label: "Why", icon: HelpCircle }] : []),
  ];

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50 safe-area-bottom",
      className
    )}>
      <div className="flex items-center py-2 overflow-x-auto scrollbar-none gap-1 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all flex-shrink-0",
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

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all text-muted-foreground flex-shrink-0">
              <Avatar className="w-5 h-5">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">Me</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48 mb-2">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
