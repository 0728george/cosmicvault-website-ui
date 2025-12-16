import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// --- SHARED COMPONENTS ---

const Footer = () => (
  <footer style={{ 
    padding: '4rem 0 2rem 0', 
    textAlign: 'center', 
    fontSize: '0.85rem', 
    color: '#475569', 
    letterSpacing: '2px',
    fontFamily: 'Inter, sans-serif'
  }}>
    <p>CREATED BY COMYANDRADIS</p>
    <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.5 }}>© 2025 COSMIC VAULT • ALL RIGHTS RESERVED</p>
  </footer>
);

// --- PAGE: HOMEPAGE ---

const Home = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="cosmic-bg" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '90%', maxWidth: '800px', textAlign: 'center' }}>
          <h1 className="cinzel-title">COSMIC VAULT</h1>
          
          <div style={{ marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <p style={{ color: '#94a3b8', lineHeight: '1.8', fontStyle: 'italic', fontSize: '1.1rem' }}>
              "A digital sanctuary for humanity's collective knowledge. We archive, preserve, and illuminate the public domain for generations to come."
            </p>
          </div>
          
          <form onSubmit={handleSearch} className="search-container">
            <input 
              type="text" 
              placeholder="Search by Author, Title, or Discipline..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="main-search"
            />
            <button type="submit" className="search-btn">DECODE</button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// --- PAGE: RESULTS ---

const Results = () => {
  const [books, setBooks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  const query = new URLSearchParams(window.location.search).get('q') || '';

  useEffect(() => {
    // CRITICAL FIX: The leading slash '/' ensures it pulls from the root folder
    fetch('/cosmic_catalog.json')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((b: any) => 
          b.t.toLowerCase().includes(query.toLowerCase()) || 
          b.a.toLowerCase().includes(query.toLowerCase()) ||
          (b.g && b.g.toLowerCase().includes(query.toLowerCase()))
        );
        setBooks(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
           <h2 style={{ fontFamily: 'Cinzel', color: '#f59e0b', margin: 0, fontSize: '1.5rem' }}>COSMIC VAULT</h2>
        </Link>
        <p style={{ margin: 0, color: '#64748b' }}>MANIFESTING: <span style={{ color: '#f8fafc' }}>"{query}"</span></p>
      </header>

      <main style={{ flex: 1, padding: '2rem' }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#f59e0b' }}>SCANNING ARCHIVES...</p>
        ) : books.length > 0 ? (
          <>
            <div className="results-grid">
              {books.slice(0, visibleCount).map((book: any, i) => (
                <div key={i} className="book-card">
                  <span className="genre-tag">{book.g || 'General'}</span>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{book.t}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{book.a}</p>
                  <a href={book.u} target="_blank" rel="noreferrer" className="read-link">ACCESS ARCHIVE</a>
                </div>
              ))}
            </div>
            {visibleCount < books.length && (
              <button className="load-more" onClick={() => setVisibleCount(prev => prev + 9)}>
                LOAD FURTHER RECORDS
              </button>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '4rem' }}>
            <p style={{ color: '#f59e0b' }}>NO RECORDS FOUND IN THIS SECTOR.</p>
            <Link to="/" style={{ color: '#94a3b8' }}>Return to Navigation</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

// --- MAIN ROUTER ---

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Results />} />
      </Routes>
    </Router>
  );
}