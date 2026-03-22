import { ChapterData } from '../types';

const BASE_URL = 'https://bible-api.com';

export async function fetchChapter(bookName: string, chapter: number, translation: string = 'kjv'): Promise<ChapterData> {
  const url = `${BASE_URL}/${encodeURIComponent(bookName)}+${chapter}?translation=${translation}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch chapter: ${response.statusText}`);
  }
  
  return response.json();
}
