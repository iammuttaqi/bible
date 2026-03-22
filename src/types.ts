export interface Book {
  id: string;
  name: string;
  testament: 'OT' | 'NT';
  chapters: number;
}

export interface Verse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface ChapterData {
  reference: string;
  verses: Verse[];
  text: string;
  translation_id: string;
  translation_name: string;
  translation_note: string;
}

export interface Translation {
  id: string;
  name: string;
  shortName: string;
}
