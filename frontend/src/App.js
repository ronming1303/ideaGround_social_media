import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";

// Pages
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import VideoPlayer from "./pages/VideoPlayer";
import Portfolio from "./pages/Portfolio";
import Wallet from "./pages/Wallet";
import CreatorProfile from "./pages/CreatorProfile";
import Explore from "./pages/Explore";
import CreatorStudio from "./pages/CreatorStudio";
import Shorts from "./pages/Shorts";
import CreatorAnalytics from "./pages/CreatorAnalytics";
import Watchlist from "./pages/Watchlist";
import Admin from "./pages/Admin";
import WhyIdeaGround from "./pages/WhyIdeaGround";
import InvestorDashboard from "./pages/InvestorDashboard";
import SolutionDetail from "./pages/SolutionDetail";

// Components
import Sidebar from "./components/Sidebar";
import MobileNav from "./components/MobileNav";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
import { createContext, useContext } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const AuthCallback = () => {
  const navigate = useNavigate();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      const hash = window.location.hash;
      const sessionId = new URLSearchParams(hash.substring(1)).get("session_id");
      
      if (sessionId) {
        try {
          const response = await axios.post(`${API}/auth/session`, { session_id: sessionId }, {
            withCredentials: true
          });
          
          // Clear hash and navigate to dashboard with user data
          window.history.replaceState(null, "", window.location.pathname);
          navigate("/dashboard", { state: { user: response.data } });
        } catch (error) {
          console.error("Auth error:", error);
          // Check if it's an access restriction error
          if (error.response?.status === 403) {
            toast.error(error.response?.data?.detail || "Access restricted. This application is in private beta.");
            setTimeout(() => navigate("/"), 2000);
          } else {
            toast.error("Authentication failed");
            navigate("/");
          }
        }
      } else {
        navigate("/");
      }
    };

    processAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-muted-foreground">Authenticating...</div>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedEmails }) => {
  const { user, setUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // If user came from AuthCallback with user data in state, use it
    if (location.state?.user && !user) {
      setUser(location.state.user);
      // Clear the state to avoid stale data
      window.history.replaceState({}, document.title);
      setIsChecking(false);
      return;
    }

    // If we already have a user, we're good
    if (user) {
      setIsChecking(false);
      return;
    }

    // If auth context is still loading, wait
    if (isLoading) {
      return;
    }

    // Auth finished loading and no user - redirect to login
    setIsChecking(false);
    navigate("/");
  }, [user, isLoading, location.state, navigate, setUser]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;
  if (allowedEmails && !allowedEmails.includes(user.email)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar className="hidden lg:flex" />
        <main className="flex-1 min-w-0 lg:ml-64 pb-20 lg:pb-0 overflow-x-hidden">
          {children}
        </main>
      </div>
      <MobileNav className="lg:hidden" />
    </div>
  );
};

function AppRouter() {
  const location = useLocation();

  // Check URL fragment for session_id synchronously
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/solutions/:slug" element={<SolutionDetail />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><Dashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/video/:videoId" element={
        <ProtectedRoute>
          <AppLayout><VideoPlayer /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/portfolio" element={
        <ProtectedRoute>
          <AppLayout><Portfolio /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/watchlist" element={
        <ProtectedRoute>
          <AppLayout><Watchlist /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/wallet" element={
        <ProtectedRoute>
          <AppLayout><Wallet /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/creator/:creatorId" element={
        <ProtectedRoute>
          <AppLayout><CreatorProfile /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/explore" element={
        <ProtectedRoute>
          <AppLayout><Explore /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/studio" element={
        <ProtectedRoute>
          <AppLayout><CreatorStudio /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout><CreatorAnalytics /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/shorts/:videoId" element={
        <ProtectedRoute>
          <Shorts />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={<Admin />} />
      <Route path="/investors" element={<ProtectedRoute><InvestorDashboard /></ProtectedRoute>} />
      <Route path="/why" element={
        <ProtectedRoute allowedEmails={["kshitiz.dadhich2015@gmail.com", "rumingliu1303@gmail.com"]}>
          <AppLayout><WhyIdeaGround /></AppLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setUser(response.data);
        // Check creator status in parallel
        try {
          const creatorResponse = await axios.get(`${API}/creators/me`, { withCredentials: true });
          setIsCreator(creatorResponse.data?.is_creator === true);
        } catch {
          setIsCreator(false);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    window.location.href = `${API}/auth/google`;
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, isCreator, setIsCreator, login, logout }}>
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
