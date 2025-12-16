import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

// --- SHARED COMPONENTS ---

const Footer = () => (
  <footer style={{ 
    padding: '4rem 0 2rem 0', 
    textAlign: 'center', 
    fontSize: '0.8rem', 
    color: '#475569', 
    letterSpacing: '3px',
    fontFamily: 'Inter, sans-serif',
    textTransform: 'uppercase'
  }}>
    <p>CREATED BY COMYANDRADIS</p>
    <p style={{ fontSize: '0.6rem', marginTop: '0.8rem', opacity: 0.4, letterSpacing: '1px' }}>
      © 2025 COSMIC VAULT • ARCHIVAL INTELLIGENCE UNIT
    </p>
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
          
          <div style={{ marginBottom: '3rem', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <p style={{ color: '#94a3b8', lineHeight: '1.8', fontStyle: 'italic', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
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
              autoFocus
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
  const [catalog, setCatalog] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search).get('q') || '', [search]);

  useEffect(() => {
    // Fetches from /public/cosmic_catalog.json
    fetch('/cosmic_catalog.json')
      .then(res => res.json())
      .then(data => {
        setCatalog(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Vault Access Error:", err);
        setLoading(false);
      });
  }, []);

  // Fuse.js Intelligent Search Logic
  const filteredBooks = useMemo(() => {
    if (!query.trim() || catalog.length === 0) return catalog;

    const fuse = new Fuse(catalog, {
      keys: [
        { name: 't', weight: 1.0 }, // Title
        { name: 'a', weight: 0.7 }, // Author
        { name: 'g', weight: 0.4 }  // Genre/Category
      ],
      threshold: 0.35, // Typos allowed, but keeps results relevant
      distance: 100,
      ignoreLocation: true
    });

    return fuse.search(query).map(result => result.item);
  }, [catalog, query]);

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '2rem', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
           <h2 style={{ fontFamily: 'Cinzel', color: '#f59e0b', margin: 0, fontSize: '1.5rem', letterSpacing: '2px' }}>COSMIC VAULT</h2>
        </Link>
        <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                Manifesting Sector: <span style={{ color: '#f8fafc' }}>"{query}"</span>
            </p>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '6rem' }}>
            <p className="pulse" style={{ color: '#f59e0b', fontFamily: 'Cinzel', letterSpacing: '5px' }}>SCANNING MULTIVERSE...</p>
          </div>
        ) : filteredBooks.length > 0 ? (
          <>
            <div className="results-grid">
              {filteredBooks.slice(0, visibleCount).map((book: any, i) => (
                <div key={i} className="book-card">
                  <span className="genre-tag">{book.g || 'ARCHIVAL RECORD'}</span>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', lineHeight: '1.4', fontWeight: '600' }}>{book.t}</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '2rem', borderLeft: '2px solid #f59e0b', paddingLeft: '12px' }}>
                    {book.a}
                  </p>
                  <a href={book.u} target="_blank" rel="noreferrer" className="read-link">ACCESS DATA</a>
                </div>
              ))}
            </div>
            
            {visibleCount < filteredBooks.length && (
              <button className="load-more" onClick={() => setVisibleCount(prev => prev + 9)}>
                LOAD FURTHER RECORDS
              </button>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '8rem' }}>
            <p style={{ color: '#f59e0b', fontSize: '1.2rem', letterSpacing: '2px', fontFamily: 'Cinzel' }}>VOID DETECTED: NO RECORDS AT THESE COORDINATES.</p>
            <Link to="/" style={{ color: '#64748b', textDecoration: 'none', marginTop: '1.5rem', display: 'inline-block', fontSize: '0.9rem', borderBottom: '1px solid #334155', paddingBottom: '2px' }}>
                Return to Navigation Hub
            </Link>
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