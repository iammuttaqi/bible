import { useState, useEffect } from 'react';

export interface Bookmark {
  bookId: string;
  chapter: number;
  verse: number;
  text: string;
  timestamp: number;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bible_bookmarks');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse bookmarks', e);
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bible_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const toggleBookmark = (bookmark: Omit<Bookmark, 'timestamp'>) => {
    setBookmarks((prev) => {
      const exists = prev.some(
        (b) => b.bookId === bookmark.bookId && b.chapter === bookmark.chapter && b.verse === bookmark.verse
      );
      
      if (exists) {
        return prev.filter(
          (b) => !(b.bookId === bookmark.bookId && b.chapter === bookmark.chapter && b.verse === bookmark.verse)
        );
      } else {
        return [...prev, { ...bookmark, timestamp: Date.now() }];
      }
    });
  };

  const isBookmarked = (bookId: string, chapter: number, verse: number) => {
    return bookmarks.some((b) => b.bookId === bookId && b.chapter === chapter && b.verse === verse);
  };

  return { bookmarks, toggleBookmark, isBookmarked };
}
