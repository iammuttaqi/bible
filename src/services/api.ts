import { ChapterData } from '../types';
import { BOOKS } from '../constants';

const BASE_URL = 'https://bible-api.com';

export async function fetchChapter(bookName: string, chapter: number, translation: string = 'kjv'): Promise<ChapterData> {
  if (translation === 'esv' || translation === 'nasb') {
    const bookIndex = BOOKS.findIndex(b => b.name.toLowerCase() === bookName.toLowerCase());
    if (bookIndex === -1) throw new Error(`Book not found: ${bookName}`);
    
    const bookId = bookIndex + 1;
    const url = `https://bolls.life/get-text/${translation.toUpperCase()}/${bookId}/${chapter}/`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch chapter: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      reference: `${bookName} ${chapter}`,
      verses: data.map((v: any) => ({
        book_id: BOOKS[bookIndex].id,
        book_name: bookName,
        chapter: chapter,
        verse: v.verse,
        text: v.text
      })),
      text: data.map((v: any) => v.text).join(' '),
      translation_id: translation,
      translation_name: translation === 'esv' ? 'English Standard Version' : 'New American Standard Bible',
      translation_note: 'Provided by bolls.life'
    };
  }

  const url = `${BASE_URL}/${encodeURIComponent(bookName)}+${chapter}?translation=${translation}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch chapter: ${response.statusText}`);
  }
  
  return response.json();
}
