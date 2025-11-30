import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { RegistrationPage } from "./components/RegistrationPage";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { UserProfile } from "./components/UserProfile";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

type Page = 'landing' | 'register' | 'login' | 'dashboard' | 'profile';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const { user } = useAuth();

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    if (user && (currentPage === 'login' || currentPage === 'register' || currentPage === 'landing')) {
      setCurrentPage('dashboard');
    }
  }, [user, currentPage]);

  return (
    <>
      {currentPage === 'landing' && <LandingPage onNavigate={handleNavigate} />}
      {currentPage === 'register' && <RegistrationPage onNavigate={handleNavigate} />}
      {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
      {currentPage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
      {currentPage === 'profile' && <UserProfile onNavigate={handleNavigate} />}
      <Toaster position="top-right" />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
