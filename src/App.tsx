import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

// --- COMPONENTS ---

const Header = ({ warmLevel, setWarmLevel }: any) => (
  <header className="fixed-nav">
    <div className="nav-container">
      <Link href="/" className="cv-logo">CV</Link>
      <nav className="nav-links">
        <Link to="/">HOME</Link>
        <a href="#browse">BROWSE</a>
        <Link to="/about">ABOUT</Link>
      </nav>
      <div className="spectral-container">
        <span className="spectral-label">SPECTRAL FILTER</span>
        <input 
          type="range" min="0" max="45" 
          value={warmLevel} 
          onChange={(e) => setWarmLevel(e.target.value)} 
        />
      </div>
    </div>
  </header>
);

const Hero = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="hero-viewport">
      <div className="hero-content">
        <h1 className="hero-headline glow-animate">Cosmic Vault</h1>
        <p className="hero-subheadline">Gateway to Infinite Knowledge</p>
        <p className="hero-mission">Explore millions of public-domain texts—free, secure, and eternal.</p>
        
        <form onSubmit={handleSearch} className="hero-search-box">
          <input 
            type="text" 
            placeholder="Unlock cosmic secrets..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="wormhole-btn">ENTER THE VAULT</button>
        </form>
      </div>
    </section>
  );
};

const Footer = () => (
  <footer className="cosmic-footer">
    <div className="footer-grid">
      <div className="footer-col">
        <h4>MISSION</h4>
        <p>A free, public-domain library safeguarding humanity's knowledge in the stars.</p>
      </div>
      <div className="footer-col">
        <h4>LEGAL</h4>
        <p>Released under MIT/CC0. Nexus Verified .US Archive.</p>
      </div>
    </div>
    <div className="authorship-area">
      <p>CREATED BY COMYANDRADIS</p>
      <p className="copyright-tag">© 2025 COSMIC VAULT</p>
    </div>
  </footer>
);

// --- PAGES ---

const Home = ({ warmLevel, setWarmLevel }: any) => (
  <div className="page-wrapper">
    <div className="warmth-overlay" style={{ backgroundColor: `rgba(255, 140, 0, ${warmLevel / 100})` }} />
    <Header warmLevel={warmLevel} setWarmLevel={setWarmLevel} />
    <Hero />
    <Footer />
  </div>
);

const Results = ({ warmLevel, setWarmLevel }: any) => {
  const [catalog, setCatalog] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);
  const { search } = useLocation();
  const query = new URLSearchParams(search).get('q') || '';

  useEffect(() => {
    fetch('/cosmic_catalog.json').then(res => res.json()).then(data => setCatalog(data));
  }, []);

  const filtered = useMemo(() => {
    if (!query) return catalog;
    const fuse = new Fuse(catalog, { keys: ['t', 'a', 'g'], threshold: 0.35 });
    return fuse.search(query).map(r => r.item);
  }, [catalog, query]);

  return (
    <div className="page-wrapper">
      <div className="warmth-overlay" style={{ backgroundColor: `rgba(255, 140, 0, ${warmLevel / 100})` }} />
      <Header warmLevel={warmLevel} setWarmLevel={setWarmLevel} />
      <main className="results-container">
        <h2 className="results-status">DECODING SECTOR: "{query}"</h2>
        <div className="results-grid">
          {filtered.slice(0, visibleCount).map((book: any, i) => (
            <div key={i} className="cosmic-card">
              <span className="card-genre">{book.g}</span>
              <h3>{book.t}</h3>
              <p>{book.a}</p>
              <a href={book.u} target="_blank" className="vault-link">OPEN ARCHIVE</a>
            </div>
          ))}
        </div>
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