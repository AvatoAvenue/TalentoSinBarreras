import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { RegistrationPage } from "./components/RegistrationPage";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { UserProfile } from "./components/UserProfile";
import { Toaster } from "./components/ui/sonner";

type Page = 'landing' | 'register' | 'login' | 'dashboard' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

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
