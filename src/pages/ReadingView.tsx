import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Bookmark, Share2, ChevronLeft, ChevronRight, Settings2, Check } from 'lucide-react';
import { BOOKS, TRANSLATIONS } from '../constants';
import { fetchChapter } from '../services/api';
import { ChapterData } from '../types';
import { useBookmarks } from '../hooks/useBookmarks';

export function ReadingView() {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();

  const [chapterDataList, setChapterDataList] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const initialTranslations = searchParams.get('translations')?.split(',') || [searchParams.get('translation') || 'kjv'];
  const [translations, setTranslations] = useState<string[]>(initialTranslations);
  
  const [showSettings, setShowSettings] = useState(false);
  const [copiedVerse, setCopiedVerse] = useState<number | null>(null);

  const verseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const targetVerse = searchParams.get('verse');

  const book = BOOKS.find((b) => b.id === bookId);
  const chapterNum = parseInt(chapterId || '1', 10);

  useEffect(() => {
    if (!book) return;

    const loadChapters = async () => {
      setLoading(true);
      setError(null);
      try {
        const promises = translations.map(t => fetchChapter(book.name, chapterNum, t));
        const results = await Promise.all(promises);
        setChapterDataList(results);
      } catch (err: any) {
        setError(err.message || 'Failed to load chapters');
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [book, chapterNum, translations]);

  useEffect(() => {
    if (chapterDataList.length > 0 && targetVerse && !loading) {
      const verseNum = parseInt(targetVerse, 10);
      const element = verseRefs.current[verseNum];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('bg-accent/50', 'ring-2', 'ring-primary/50');
          setTimeout(() => {
            element.classList.remove('bg-accent/50', 'ring-2', 'ring-primary/50');
          }, 2000);
        }, 100);
      }
    }
  }, [chapterDataList, targetVerse, loading]);

  const toggleTranslation = (tId: string) => {
    setTranslations((prev) => {
      let newTranslations;
      if (prev.includes(tId)) {
        if (prev.length === 1) return prev; // Prevent deselecting the last one
        newTranslations = prev.filter((id) => id !== tId);
      } else {
        newTranslations = [...prev, tId];
      }
      
      setSearchParams((params) => {
        params.set('translations', newTranslations.join(','));
        params.delete('translation'); // Clean up old param if exists
        return params;
      });
      
      return newTranslations;
    });
  };

  const handleShare = async (verseNum: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('verse', verseNum.toString());
    url.searchParams.set('translations', translations.join(','));
    
    const texts = chapterDataList.map(data => {
      const v = data.verses.find(v => v.verse === verseNum);
      return v ? `[${data.translation_id.toUpperCase()}] ${v.text.trim()}` : '';
    }).filter(Boolean).join('\n');

    const shareText = `"${texts}"\n- ${book?.name} ${chapterNum}:${verseNum}\n${url.toString()}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${book?.name} ${chapterNum}:${verseNum}`,
          text: shareText,
          url: url.toString()
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        setCopiedVerse(verseNum);
        setTimeout(() => setCopiedVerse(null), 2000);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  if (!book) {
    return <div className="text-center py-20">Book not found</div>;
  }

  const prevChapter = chapterNum > 1 ? chapterNum - 1 : null;
  const nextChapter = chapterNum < book.chapters ? chapterNum + 1 : null;

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 sticky top-14 bg-background/95 backdrop-blur z-40 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(`/book/${book.id}`)}
            className="p-2 -ml-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label="Back to chapters"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {book.name} {chapterNum}
          </h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors text-sm font-medium"
          >
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {translations.map(tId => TRANSLATIONS.find(t => t.id === tId)?.shortName || tId.toUpperCase()).join(', ')}
            </span>
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none animate-in zoom-in-95 duration-100 z-50">
              <div className="p-1">
                {TRANSLATIONS.map((t) => {
                  const isSelected = translations.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTranslation(t.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors ${isSelected ? 'bg-accent/50 font-medium' : ''}`}
                    >
                      {t.name}
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="space-y-6 py-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-6 h-4 bg-muted rounded mt-1.5 shrink-0"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                  <div className="h-4 bg-muted rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">
            <p className="mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-6 font-serif text-lg leading-loose">
            {Array.from({ length: Math.max(...chapterDataList.map(d => d.verses.length), 0) }, (_, i) => i + 1).map((verseNum) => {
              const bookmarked = isBookmarked(book.id, chapterNum, verseNum);
              
              return (
                <div 
                  key={verseNum}
                  ref={(el) => (verseRefs.current[verseNum] = el)}
                  className="group relative flex gap-3 sm:gap-4 p-2 -mx-2 rounded-lg transition-colors hover:bg-accent/30"
                >
                  <span className="text-sm font-sans font-semibold text-muted-foreground mt-1.5 shrink-0 select-none w-6 text-right">
                    {verseNum}
                  </span>
                  
                  <div className="flex-1 space-y-4">
                    {chapterDataList.map((data) => {
                      const verseData = data.verses.find(v => v.verse === verseNum);
                      if (!verseData) return null;
                      
                      return (
                        <div key={data.translation_id} className="relative">
                          {translations.length > 1 && (
                            <span className="text-xs font-sans font-bold text-muted-foreground uppercase tracking-wider mr-2 select-none">
                              {data.translation_id}
                            </span>
                          )}
                          <span className="text-foreground/90">
                            {verseData.text.trim()}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-background/80 backdrop-blur-sm p-1 rounded-md shadow-sm border border-border/50 sm:static sm:opacity-100 sm:bg-transparent sm:border-none sm:shadow-none sm:backdrop-blur-none">
                    <button
                      onClick={() => {
                        const firstVerseData = chapterDataList[0]?.verses.find(v => v.verse === verseNum);
                        if (firstVerseData) {
                          toggleBookmark({
                            bookId: book.id,
                            chapter: chapterNum,
                            verse: verseNum,
                            text: firstVerseData.text.trim()
                          });
                        }
                      }}
                      className={`p-1.5 rounded hover:bg-accent transition-colors ${bookmarked ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                      aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
                      title="Bookmark"
                    >
                      <Bookmark className="h-4 w-4" fill={bookmarked ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => handleShare(verseNum)}
                      className="p-1.5 rounded text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      aria-label="Share verse"
                      title="Share"
                    >
                      {copiedVerse === verseNum ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      {!loading && !error && (
        <div className="flex items-center justify-between mt-16 pt-8 border-t border-border max-w-3xl mx-auto">
          {prevChapter ? (
            <Link
              to={`/read/${book.id}/${prevChapter}?translations=${translations.join(',')}`}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="hidden sm:inline">Chapter {prevChapter}</span>
            </Link>
          ) : (
            <div />
          )}
          
          {nextChapter ? (
            <Link
              to={`/read/${book.id}/${nextChapter}?translations=${translations.join(',')}`}
              className="flex items-center gap-2 px-4 py-2 rounded-md hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"
            >
              <span className="hidden sm:inline">Chapter {nextChapter}</span>
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      )}
    </div>
  );
}
