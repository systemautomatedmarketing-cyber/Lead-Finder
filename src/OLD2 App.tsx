// src/App.jsx
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AuthScreen from "./components/AuthScreen";
import OnboardingWizard from "./components/OnboardingWizard";
import LeaderDashboard from "./components/LeaderDashboard";
import CollaboratoreDashboard from "./components/CollaboratoreDashboard";

function AppRouter() {
  const { currentUser, userProfile } = useAuth();

  // Non loggato
  if (!currentUser || !userProfile) return <AuthScreen />;

  // Leader
  if (userProfile.role === "leader") return <LeaderDashboard />;

  // Collaboratore — onboarding non ancora completato
  if (userProfile.role === "collaboratore" && !userProfile.onboardingCompleted) {
    return <OnboardingWizard onComplete={() => {}} />;
  }

  // Collaboratore — app completa
  return <CollaboratoreDashboard />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  );
}
