import { Header } from "./Header";
import { Footer } from "./Footer";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import heroImage from "figma:asset/3c411e0fed35364b5da46a7d3986811626ee8467.png";
import inclusionImage from "figma:asset/915ddc6ee6b13303edd8694b3acb30ef72cee1b8.png";
import servicioImage from "figma:asset/bc864c0bc82b48d86a006be369df8c41165bbf92.png";
import voluntariadoImage from "figma:asset/a22a9666c534339e2b1f6dced0b1f81f669a0d7a.png";

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const opportunityCards = [
    {
      title: "Inclusión laboral",
      text: "Accede a vacantes diseñadas para promover la inclusión laboral y el desarrollo profesional sin barreras.",
      color: "#E86C4B",
      image: inclusionImage,
      alt: "Inclusión laboral - personas con diversas capacidades",
    },
    {
      title: "Servicio social",
      text: "Facilitamos el cumplimiento de tu servicio social con proyectos educativos y comunitarios significativos.",
      color: "#F5B567",
      image: servicioImage,
      alt: "Servicio social - manos unidas en colaboración",
    },
    {
      title: "Voluntariado",
      text: "Participa en iniciativas que fortalecen la comunidad y generan impacto positivo.",
      color: "#F5D27A",
      image: voluntariadoImage,
      alt: "Voluntariado - comunidad activa",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={onNavigate} />
      
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-[#0A4E6A] to-[#3E7D8C] text-white py-20 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <h1 className="mb-6 text-4xl md:text-5xl">
              Talento Sin Barreras conecta talento, educación y comunidad
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Ofreciendo empleo inclusivo y oportunidades de servicio social para todos.
            </p>
          </div>
          <div className="flex justify-center">
            <img
              src={heroImage}
              alt="Comunidad inclusiva y diversa"
              className="rounded-lg shadow-2xl w-full max-w-md"
            />
          </div>
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="w-full py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center text-[#0A4E6A] mb-12">
            Nuestras Oportunidades
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {opportunityCards.map((card, index) => (
              <div
                key={index}
                className="rounded-lg p-6 shadow-lg flex flex-col items-center text-center"
                style={{ backgroundColor: card.color }}
              >
                <div className={`mb-4 flex items-center justify-center ${index === 0 ? 'w-32 h-32' : 'w-24 h-24'}`}>
                  <img 
                    src={card.image} 
                    alt={card.alt}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-white mb-4">{card.title}</h3>
                <p className="text-white/90">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}