
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
  {
    id: 1,
    title: "Welcome to Youth Connect",
    description: "A community where faith meets friendship",
    image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 2,
    title: "Join Our Events",
    description: "Fun activities every week for everyone",
    image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    id: 3,
    title: "Connect & Share",
    description: "Build meaningful relationships in our community",
    image: "https://images.unsplash.com/photo-1609234656388-0ff363383899?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1332&q=80"
  }
];

const Hero3DSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isManualChange, setIsManualChange] = useState(false);

  const nextSlide = () => {
    setIsManualChange(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const prevSlide = () => {
    setIsManualChange(true);
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (!isManualChange) {
      timer = setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
      }, 5000);
    } else {
      // Reset the manual change flag after a delay
      timer = setTimeout(() => {
        setIsManualChange(false);
      }, 10000);
    }

    return () => clearTimeout(timer);
  }, [currentIndex, isManualChange]);

  // Calculate positions and styles for each slide
  const getSlideStyle = (index: number) => {
    // Center slide
    if (index === currentIndex) {
      return "translate-x-0 scale-100 z-20 opacity-100";
    }
    // Previous slide
    else if (index === ((currentIndex - 1 + slides.length) % slides.length)) {
      return "-translate-x-full scale-90 z-10 opacity-60";
    }
    // Next slide
    else if (index === ((currentIndex + 1) % slides.length)) {
      return "translate-x-full scale-90 z-10 opacity-60";
    }
    // Hidden slides
    return "translate-x-full scale-75 opacity-0";
  };

  return (
    <div className="mx-auto max-w-6xl py-10 px-4">
      <div className="slider-container relative h-[500px] overflow-hidden">
        {slides.map((slide, index) => (
          <Card 
            key={slide.id}
            className={`slide absolute inset-0 transition-all duration-700 ease-in-out transform ${getSlideStyle(index)}`}
          >
            <CardContent className="p-0 h-full">
              <div className="relative h-full overflow-hidden rounded-lg">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 flex flex-col justify-end p-8">
                  <h2 className="text-white text-3xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                  <p className="text-white/90 text-lg md:text-xl mb-4">{slide.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-2 z-30">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-youth-blue w-6" : "bg-white/50"
              }`}
              onClick={() => {
                setIsManualChange(true);
                setCurrentIndex(index);
              }}
            ></button>
          ))}
        </div>

        <button
          className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black/30 hover:bg-youth-blue text-white rounded-full p-2 z-30 transition-all button-pop"
          onClick={prevSlide}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-black/30 hover:bg-youth-blue text-white rounded-full p-2 z-30 transition-all button-pop"
          onClick={nextSlide}
        >
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default Hero3DSlider;
