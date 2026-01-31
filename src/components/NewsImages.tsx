import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Newspaper, ChevronLeft, ChevronRight, Image } from 'lucide-react';

interface NewsImagesProps {
  images: string[];
}

const NewsImages: React.FC<NewsImagesProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-advance carousel every 2 minutes (120000ms)
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 120000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="news-images-container">
      <div className="news-images-header">
        <Newspaper className="news-header-icon" />
        <h2>Novosti i Događaji</h2>
      </div>

      <div className="news-carousel">
        {images.length > 0 ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                className="carousel-slide"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <img
                  src={images[currentIndex]}
                  alt={`Novost ${currentIndex + 1}`}
                  className="carousel-image"
                />
              </motion.div>
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  className="carousel-btn carousel-btn-prev"
                  onClick={goToPrevious}
                  aria-label="Prethodna slika"
                >
                  <ChevronLeft />
                </button>
                <button
                  className="carousel-btn carousel-btn-next"
                  onClick={goToNext}
                  aria-label="Sledeća slika"
                >
                  <ChevronRight />
                </button>

                <div className="carousel-dots">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                      onClick={() => goToSlide(index)}
                      aria-label={`Idi na sliku ${index + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <motion.div
            className="news-images-placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image className="placeholder-icon" />
            <p>Novosti će uskoro biti dostupne</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NewsImages;
