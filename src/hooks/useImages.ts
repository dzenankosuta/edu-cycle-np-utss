import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase-config';

export interface ImageItem {
  id: string;
  url: string;
  active: boolean;
  order: number;
}

export const useImages = () => {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!database) {
      setIsLoading(false);
      return;
    }

    const imagesRef = ref(database, 'images');

    const unsubscribe = onValue(
      imagesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const imageUrls = Object.entries(data)
            .map(([id, value]: [string, any]) => ({
              id,
              url: value.url,
              active: value.active ?? true,
              order: value.order ?? 0,
            }))
            .filter((item) => item.active)
            .sort((a, b) => a.order - b.order)
            .map((item) => item.url);

          setImages(imageUrls);
        } else {
          setImages([]);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Greška pri učitavanju slika:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { images, isLoading, hasImages: images.length > 0 };
};
