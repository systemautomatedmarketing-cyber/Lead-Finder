// src/App.jsx
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PlanProvider } from "./context/PlanContext";
import AuthScreen from "./components/AuthScreen";
import OnboardingWizard from "./components/OnboardingWizard";
import CompanySetup from "./components/CompanySetup";
import LeaderDashboard from "./components/LeaderDashboard";
import CollaboratoreDashboard from "./components/CollaboratoreDashboard";

function AppRouter() {
  const { currentUser, userProfile } = useAuth();

  // Non loggato
  if (!currentUser || !userProfile) return <AuthScreen />;

  // Leader — setup azienda non ancora fatto
  if (userProfile.role === "leader" && !userProfile.companySetupDone) {
    return (
      <PlanProvider>
        <CompanySetup onComplete={async () => {
          // companySetupDone viene settato dentro CompanySetup via updateProfile
        }} />
      </PlanProvider>
    );
  }

  // Leader — dashboard
  if (userProfile.role === "leader") {
    return <PlanProvider><LeaderDashboard /></PlanProvider>;
  }

  // Collaboratore — onboarding non ancora completato
  if (userProfile.role === "collaboratore" && !userProfile.onboardingCompleted) {
    return <PlanProvider><OnboardingWizard onComplete={() => {}} /></PlanProvider>;
  }

  // Collaboratore — app completa
  return <PlanProvider><CollaboratoreDashboard /></PlanProvider>;
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
