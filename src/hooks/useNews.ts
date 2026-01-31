import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase-config';

export interface NewsItem {
  id: string;
  text: string;
  active: boolean;
  priority: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FirebaseNewsValue {
  text?: string;
  active?: boolean;
  priority?: number;
  createdAt?: string;
  updatedAt?: string;
}

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database) {
      console.warn('Firebase nije dostupan za novosti');
      setIsLoading(false);
      return;
    }

    const newsRef = ref(database, 'news');

    const unsubscribe = onValue(
      newsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const newsArray: NewsItem[] = (Object.entries(data) as [string, FirebaseNewsValue][])
            .map(([id, value]) => ({
              id,
              text: value.text || '',
              active: value.active ?? false,
              priority: value.priority ?? 0,
              createdAt: value.createdAt,
              updatedAt: value.updatedAt,
            }))
            .filter((item) => item.active) // Samo aktivne novosti
            .sort((a, b) => b.priority - a.priority); // Veći prioritet = važnija vest

          setNews(newsArray);
          console.log(`✅ Učitano ${newsArray.length} aktivnih novosti`);
        } else {
          setNews([]);
          console.log('ℹ️ Nema novosti u bazi');
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Greška pri učitavanju novosti:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    news,
    isLoading,
    hasNews: news.length > 0,
  };
};
