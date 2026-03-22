import { Link } from 'react-router-dom';
import { BOOKS } from '../constants';

export function BookListView() {
  const oldTestament = BOOKS.filter((b) => b.testament === 'OT');
  const newTestament = BOOKS.filter((b) => b.testament === 'NT');

  const renderBooks = (books: typeof BOOKS) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {books.map((book) => (
        <Link
          key={book.id}
          to={`/book/${book.id}`}
          className="group flex flex-col items-center justify-center p-4 rounded-xl border border-border bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <span className="font-medium text-center text-sm sm:text-base group-hover:scale-105 transition-transform">
            {book.name}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">OT</span>
          Old Testament
        </h2>
        {renderBooks(oldTestament)}
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2">
          <span className="bg-primary text-primary-foreground px-3 py-1 rounded-md text-sm">NT</span>
          New Testament
        </h2>
        {renderBooks(newTestament)}
      </section>
    </div>
  );
}
