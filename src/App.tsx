import { Suspense, lazy, useEffect } from "react";
import {
  useRoutes,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Home from "./components/home";
import routes from "tempo-routes";
import { ProjectDetail } from "./components/dashboard/ProjectDetail";
import AuthGuard from "./components/auth/AuthGuard";
import ExtensionBridge from "./components/auth/ExtensionBridge";
import TokenDisplayPage from "./components/auth/TokenDisplayPage";

// Lazy load components
const LandingPage = lazy(() => import("./components/landing/LandingPage"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const SignupPage = lazy(() => import("./components/auth/SignupPage"));
const ForgotPasswordPage = lazy(
  () => import("./components/auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
  () => import("./components/auth/ResetPasswordPage"),
);

// Auth wrapper to redirect authenticated users away from auth pages
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is logged in (using localStorage in this demo)
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn) {
      // If user is logged in and trying to access auth pages, redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, location]);

  return <>{children}</>;
}

// Root component to redirect to login if not authenticated
function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in (using localStorage in this demo)
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (!isLoggedIn) {
      // If not logged in, redirect to login
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  return <Home />;
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      }
    >
      <>
        {/* Include the ExtensionBridge component to enable communication with the extension */}
        <ExtensionBridge />
        
        <Routes>
          {/* Public landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth routes - wrapped with AuthRedirect to prevent access when logged in */}
          <Route
            path="/login"
            element={
              <AuthRedirect>
                <LoginPage />
              </AuthRedirect>
            }
          />
          <Route
            path="/signup"
            element={
              <AuthRedirect>
                <SignupPage />
              </AuthRedirect>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <AuthRedirect>
                <ForgotPasswordPage />
              </AuthRedirect>
            }
          />
          <Route
            path="/reset-password"
            element={
              <AuthRedirect>
                <ResetPasswordPage />
              </AuthRedirect>
            }
          />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/projects"
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            }
          />
          <Route
            path="/project/:projectId"
            element={
              <AuthGuard>
                <ProjectDetail />
              </AuthGuard>
            }
          />
          <Route
            path="/analytics"
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            }
          />
          <Route
            path="/team"
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            }
          />
          <Route
            path="/docs"
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            }
          />
          <Route
            path="/help"
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            }
          />
          <Route
            path="/settings"
            element={
              <AuthGuard>
                <Home />
              </AuthGuard>
            }
          />
          <Route
            path="/extension-token"
            element={
              <AuthGuard>
                <TokenDisplayPage />
              </AuthGuard>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
