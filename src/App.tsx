import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { BookListView } from './pages/BookListView';
import { ChapterSelectionView } from './pages/ChapterSelectionView';
import { ReadingView } from './pages/ReadingView';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<BookListView />} />
          <Route path="book/:bookId" element={<ChapterSelectionView />} />
          <Route path="read/:bookId/:chapterId" element={<ReadingView />} />
        </Route>
      </Routes>
    </Router>
  );
}
