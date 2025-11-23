import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface CarouselCard {
  title: string;
  text: string;
  color: string;
}

interface VerticalCarouselProps {
  cards: CarouselCard[];
}

export function VerticalCarousel({ cards }: VerticalCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % cards.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [cards.length]);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="overflow-hidden">
        <div
          className="transition-transform duration-500 ease-in-out"
          style={{ transform: `translateY(-${activeIndex * 100}%)` }}
        >
          {cards.map((card, index) => (
            <Card
              key={index}
              className="mb-4 border-none shadow-lg"
              style={{ backgroundColor: card.color }}
            >
              <CardHeader>
                <CardTitle className="text-white">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">{card.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center gap-2 mt-6">
        <button
          onClick={handlePrevious}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Previous"
        >
          <ChevronUp className="w-5 h-5 text-[#0A4E6A]" />
        </button>
        <button
          onClick={handleNext}
          className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 transition-colors"
          aria-label="Next"
        >
          <ChevronDown className="w-5 h-5 text-[#0A4E6A]" />
        </button>
      </div>
      
      <div className="flex justify-center gap-2 mt-4">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === activeIndex ? "bg-[#E86C4B]" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
