import { Button } from "./ui/button";
import logoImage from "figma:asset/cae8a4d564a683466103f40cfd4323e43cdd43a8.png";

interface HeaderProps {
  onNavigate: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="cursor-pointer flex items-center gap-3" onClick={() => onNavigate('landing')}>
            <img src={logoImage} alt="Talento sin Barreras Logo" className="h-12" />
            <div>
              <h1 className="text-[#0A4E6A]">Talento sin Barreras</h1>
              <p className="text-sm text-[#3E7D8C]">Conectando oportunidades y comunidad</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onNavigate('register')}
              className="border-[#0A4E6A] text-[#0A4E6A] hover:bg-[#0A4E6A] hover:text-white"
            >
              Registrarse
            </Button>
            <Button
              onClick={() => onNavigate('login')}
              className="bg-[#E86C4B] hover:bg-[#d45a39] text-white"
            >
              Iniciar sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}