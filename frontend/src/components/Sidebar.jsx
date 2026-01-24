import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { Button } from "../components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "../components/ui/dropdown-menu";
import { 
  Home, Compass, Briefcase, Wallet, LogOut, 
  Settings, User, ChevronDown, Video
} from "lucide-react";
import { cn } from "../lib/utils";

const navItems = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/portfolio", label: "Portfolio", icon: Briefcase },
  { path: "/wallet", label: "Wallet", icon: Wallet },
  { path: "/studio", label: "Creator Studio", icon: Video },
];

export default function Sidebar({ className }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40",
      className
    )}>
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img 
            src="https://customer-assets.emergentagent.com/job_ideaground/artifacts/lxdvr0pk_IG%20logo.png" 
            alt="ideaGround Logo" 
            className="w-10 h-10 object-contain"
          />
          <span className="font-heading font-bold text-xl">ideaGround</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase()}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              data-testid="user-menu-btn"
              variant="ghost" 
              className="w-full justify-start gap-3 px-3 py-6 h-auto hover:bg-muted"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              data-testid="logout-btn"
              onClick={logout}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
