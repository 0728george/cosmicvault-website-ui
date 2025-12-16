import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

// --- SHARED COMPONENTS ---

const Footer = () => (
  <footer className="admin-footer">
    <div className="star-map-container">
      <div className="star-map-glow"></div>
      <p className="authorship">CREATED BY COMYANDRADIS</p>
    </div>
    <p className="footer-sub">© 2025 COSMIC VAULT • ARCHIVAL INTELLIGENCE UNIT</p>
  </footer>
);

const HealthSettings = ({ warmLevel, setWarmLevel }: any) => (
  <div className="health-controls-top-right">
    <label>SPECTRAL FILTER</label>
    <input 
      type="range" 
      min="0" 
      max="45" 
      value={warmLevel} 
      onChange={(e) => setWarmLevel(e.target.value)} 
    />
  </div>
);

const ConstellationLoader = () => (
  <div className="constellation-container">
    <svg viewBox="0 0 100 100" className="constellation-svg">
      <circle cx="20" cy="50" r="1.5" fill="white" />
      <circle cx="50" cy="20" r="1.5" fill="white" />
      <circle cx="80" cy="50" r="1.5" fill="white" />
      <circle cx="50" cy="80" r="1.5" fill="white" />
      <path d="M20 50 L50 20 L80 50 L50 80 Z" fill="none" stroke="rgba(245, 158, 11, 0.5)" strokeWidth="0.5" className="draw-path" />
    </svg>
    <p className="loading-text-cinzel">ALIGNING CONSTELLATIONS...</p>
  </div>
);

// --- PAGE: HOMEPAGE ---

const Home = ({ warmLevel, setWarmLevel }: any) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="page-wrapper parallax-bg">
      <div className="warmth-overlay" style={{ backgroundColor: `rgba(255, 140, 0, ${warmLevel / 100})` }} />
      <HealthSettings warmLevel={warmLevel} setWarmLevel={setWarmLevel} />
      
      <main className="home-main">
        <h1 className="cinzel-title">COSMIC VAULT</h1>
        <p className="mission-statement">
          "A digital sanctuary for humanity's collective knowledge. We archive, preserve, and illuminate the public domain for generations to come."
        </p>
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
      </main>
      <Footer />
    </div>
  );
};

// --- PAGE: RESULTS ---

const Results = ({ warmLevel, setWarmLevel }: any) => {
  const [catalog, setCatalog] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const [loading, setLoading] = useState(true);
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search).get('q') || '', [search]);

  useEffect(() => {
    fetch('/cosmic_catalog.json').then(res => res.json()).then(data => {
      setCatalog(data);
      setTimeout(() => setLoading(false), 1500); // Artificial delay to show constellation
    });
  }, []);

  const filteredBooks = useMemo(() => {
    if (!query.trim()) return catalog;
    const fuse = new Fuse(catalog, { keys: [{name:'t',weight:1}, {name:'a',weight:0.7}, {name:'g',weight:0.4}], threshold: 0.35 });
    return fuse.search(query).map(r => r.item);
  }, [catalog, query]);

  return (
    <div className="page-wrapper parallax-bg">
      <div className="warmth-overlay" style={{ backgroundColor: `rgba(255, 140, 0, ${warmLevel / 100})` }} />
      <header className="results-header-minimal">
        <Link to="/" className="logo-link">COSMIC VAULT</Link>
        <HealthSettings warmLevel={warmLevel} setWarmLevel={setWarmLevel} />
      </header>
      
      <main className="results-main">
        {loading ? (
          <ConstellationLoader />
        ) : (
          <>
            <div className="results-grid">
              {filteredBooks.slice(0, visibleCount).map((book: any, i) => (
                <div key={i} className="book-card">
                  <span className="genre-tag">{book.g || 'ARCHIVAL RECORD'}</span>
                  <h3>{book.t}</h3>
                  <p className="author-tag">{book.a}</p>
                  <a href={book.u} target="_blank" rel="noreferrer" className="read-link">ACCESS DATA</a>
                </div>
              ))}
            </div>
            {visibleCount < filteredBooks.length && (
              <button className="load-more" onClick={() => setVisibleCount(v => v + 9)}>DECODE FURTHER RECORDS</button>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default function App() {
  const [warmLevel, setWarmLevel] = useState(0);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home warmLevel={warmLevel} setWarmLevel={setWarmLevel} />} />
        <Route path="/search" element={<Results warmLevel={warmLevel} setWarmLevel={setWarmLevel} />} />
      </Routes>
    </Router>
  );
}