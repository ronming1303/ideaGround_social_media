import { useEffect, useState, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Link } from "react-router-dom";
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
import CreatorAnalytics from "./pages/CreatorAnalytics";

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
          toast.error("Authentication failed");
          navigate("/");
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

const ProtectedRoute = ({ children }) => {
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

  return user ? children : null;
};

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <Sidebar className="hidden lg:flex" />
        <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
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
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/dashboard";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
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
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthContext.Provider>
  );
}

export default App;
