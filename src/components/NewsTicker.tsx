import { motion } from 'framer-motion';
import { useNews } from '../hooks/useNews';

const NewsTicker = () => {
  const { news, hasNews } = useNews();

  // Ne prikazuj ticker ako nema novosti
  if (!hasNews) {
    return null;
  }

  // Spoji sve novosti u jedan string sa separatorom
  const newsText = news.map((item) => item.text).join('   •   ');
  // Dupliramo tekst za seamless loop
  const doubledText = `${newsText}   •   ${newsText}`;

  return (
    <div className="news-ticker-container">
      <div className="news-ticker-label">
        <span className="news-icon">📢</span>
        NOVOSTI
      </div>
      <div className="news-ticker-content">
        <motion.div
          className="news-ticker-text"
          animate={{
            x: ['0%', '-50%'],
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: news.length * 22.5, // Brzina zavisi od broja novosti (50% sporije)
              ease: 'linear',
            },
          }}
        >
          {doubledText}
        </motion.div>
      </div>
    </div>
  );
};

export default NewsTicker;
