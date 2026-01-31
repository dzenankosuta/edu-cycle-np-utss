import { useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, push, remove, update } from 'firebase/database';
import { database } from '../../firebase-config';
import type { ImageItem } from '../../types';

interface UseAdminImagesReturn {
  images: ImageItem[];
  isLoading: boolean;
  error: string | null;
  addImage: (url: string) => Promise<void>;
  updateImage: (id: string, updates: Partial<Omit<ImageItem, 'id'>>) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
  clearError: () => void;
}

export function useAdminImages(): UseAdminImagesReturn {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!database) {
      setError('Firebase baza nije inicijalizovana');
      setIsLoading(false);
      return;
    }

    const imagesRef = ref(database, 'images');

    const unsubscribe = onValue(
      imagesRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const imageList: ImageItem[] = Object.entries(data).map(([id, value]) => ({
            id,
            ...(value as Omit<ImageItem, 'id'>),
          }));
          // Sortiraj po order polju
          imageList.sort((a, b) => (a.order || 0) - (b.order || 0));
          setImages(imageList);
        } else {
          setImages([]);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Greška pri učitavanju slika:', err);
        setError('Greška pri učitavanju slika');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addImage = useCallback(async (url: string): Promise<void> => {
    if (!database) {
      setError('Firebase baza nije inicijalizovana');
      return;
    }

    try {
      const imagesRef = ref(database, 'images');
      const newImageRef = push(imagesRef);
      const maxOrder = images.reduce((max, img) => Math.max(max, img.order || 0), 0);

      await set(newImageRef, {
        url,
        active: true,
        order: maxOrder + 1,
      });
      setError(null);
    } catch (err) {
      console.error('Greška pri dodavanju slike:', err);
      setError('Greška pri dodavanju slike');
      throw err;
    }
  }, [images]);

  const updateImage = useCallback(
    async (id: string, updates: Partial<Omit<ImageItem, 'id'>>): Promise<void> => {
      if (!database) {
        setError('Firebase baza nije inicijalizovana');
        return;
      }

      try {
        const imageRef = ref(database, `images/${id}`);
        await update(imageRef, updates);
        setError(null);
      } catch (err) {
        console.error('Greška pri ažuriranju slike:', err);
        setError('Greška pri ažuriranju slike');
        throw err;
      }
    },
    []
  );

  const deleteImage = useCallback(async (id: string): Promise<void> => {
    if (!database) {
      setError('Firebase baza nije inicijalizovana');
      return;
    }

    try {
      const imageRef = ref(database, `images/${id}`);
      await remove(imageRef);
      setError(null);
    } catch (err) {
      console.error('Greška pri brisanju slike:', err);
      setError('Greška pri brisanju slike');
      throw err;
    }
  }, []);

  const toggleActive = useCallback(
    async (id: string): Promise<void> => {
      const image = images.find((img) => img.id === id);
      if (!image) return;

      await updateImage(id, { active: !image.active });
    },
    [images, updateImage]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    images,
    isLoading,
    error,
    addImage,
    updateImage,
    deleteImage,
    toggleActive,
    clearError,
  };
}
