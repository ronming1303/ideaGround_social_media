import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Settings, User, ChevronDown, Video, Eye, PieChart, BarChart3, HelpCircle, Bell
} from "lucide-react";
import { cn } from "../lib/utils";
import { useState, useEffect } from "react";
import axios from "axios";

const API = process.env.REACT_APP_BACKEND_URL;

const navItems = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/explore", label: "Explore", icon: Compass },
  { path: "/portfolio", label: "Portfolio", icon: Briefcase },
  { path: "/watchlist", label: "Watchlist", icon: Eye },
  { path: "/subscriptions", label: "Subscriptions", icon: Bell },
  { path: "/wallet", label: "Wallet", icon: Wallet },
  { path: "/studio", label: "Creator Studio", icon: Video },
  { path: "/investors", label: "Investor Metrics", icon: BarChart3 },
];

// Mini donut chart component for portfolio allocation
const MiniDonut = ({ data }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return null;
  
  const size = 60;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Pre-calculate angles for each segment
  const segments = data.map((item, index) => {
    const previousTotal = data.slice(0, index).reduce((sum, i) => sum + i.value, 0);
    const percentage = item.value / total;
    const startAngle = previousTotal / total;
    return {
      ...item,
      percentage,
      startAngle,
      strokeDasharray: `${percentage * circumference} ${circumference}`,
      strokeDashoffset: -startAngle * circumference
    };
  });
  
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {segments.map((segment, index) => (
          <circle
            key={index}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeDasharray={segment.strokeDasharray}
            strokeDashoffset={segment.strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-bold text-foreground">{data.length}</span>
      </div>
    </div>
  );
};

export default function Sidebar({ className }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [portfolioData, setPortfolioData] = useState(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await axios.get(`${API}/api/portfolio`, { withCredentials: true });
        if (response.data.items && response.data.items.length > 0) {
          const colors = ['#f97316', '#14b8a6', '#6366f1', '#ec4899', '#eab308', '#22c55e'];
          const chartData = response.data.items.slice(0, 5).map((item, idx) => ({
            name: item.video.ticker_symbol,
            value: item.current_value,
            color: colors[idx % colors.length]
          }));
          setPortfolioData({
            items: chartData,
            total: response.data.total_value
          });
        }
      } catch (err) {
        // Silent fail
      }
    };

    if (user) fetchPortfolio();
  }, [user]);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen w-64 bg-card border-r border-border flex flex-col z-40",
      className
    )}>
      {/* Sticky Logo Header */}
      <div className="sticky top-0 z-10 p-6 border-b border-border bg-card/95 backdrop-blur-sm">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <span className="font-heading font-bold text-xl gradient-text">ideaGround</span>
          {process.env.REACT_APP_ENV === 'staging' && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-yellow-400/20 text-yellow-500 border border-yellow-500/30">DEV</span>
          )}
          {process.env.REACT_APP_ENV === 'development' && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-400/20 text-blue-500 border border-blue-500/30">LOCAL</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {[...navItems, ...( ["kshitiz.dadhich2015@gmail.com","rumingliu1303@gmail.com"].includes(user?.email)
          ? [{ path: "/why", label: "Why ideaGround", icon: HelpCircle }]
          : [])].map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/25 orange-glow" 
                  : "text-muted-foreground hover:bg-accent hover:text-primary"
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}

        {/* Portfolio Allocation Mini Widget */}
        {portfolioData && portfolioData.items.length > 0 && (
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-accent to-orange-50 border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-foreground">Portfolio</span>
            </div>
            <div className="flex items-center gap-3">
              <MiniDonut data={portfolioData.items} />
              <div className="flex-1">
                <p className="text-lg font-bold text-foreground">
                  ${portfolioData.total.toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {portfolioData.items.length} holdings
                </p>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              {portfolioData.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-muted-foreground truncate flex-1">
                    {item.name}
                  </span>
                  <span className="text-xs font-mono text-foreground">
                    ${item.value.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border bg-gradient-to-t from-accent/50 to-transparent">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              data-testid="user-menu-btn"
              variant="ghost" 
              className="w-full justify-start gap-3 px-3 py-6 h-auto hover:bg-primary/5 rounded-xl"
            >
              <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                <AvatarImage src={user?.picture} alt={user?.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
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
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <User className="w-4 h-4 mr-2" />
              Profile
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
