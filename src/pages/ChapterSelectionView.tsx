import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BOOKS } from '../constants';

export function ChapterSelectionView() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  
  const book = BOOKS.find((b) => b.id === bookId);

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold mb-4">Book not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  const chapters = Array.from({ length: book.chapters }, (_, i) => i + 1);

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-3xl font-bold tracking-tight">{book.name}</h1>
      </div>
      
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        {chapters.map((chapter) => (
          <Link
            key={chapter}
            to={`/read/${book.id}/${chapter}`}
            className="flex items-center justify-center aspect-square rounded-xl border border-border bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 text-lg font-medium shadow-sm hover:shadow-md"
          >
            {chapter}
          </Link>
        ))}
      </div>
    </div>
  );
}
