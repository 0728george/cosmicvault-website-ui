import { BrowserRouter as Router, Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';

// --- COMPONENTS ---

const Header = ({ warmLevel, setWarmLevel, isStargaze }: any) => (
  <header className={`fixed-nav ${isStargaze ? 'nav-dimmed' : ''}`}>
    <div className="nav-container">
      <Link to="/" className="cv-logo">CV</Link>
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

const Footer = ({ toggleStargaze, isStargaze }: any) => (
  <footer className={`cosmic-footer ${isStargaze ? 'footer-dimmed' : ''}`}>
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
    
    <button onClick={toggleStargaze} className="stargaze-btn">
      {isStargaze ? "EXIT DEEP SPACE" : "🔭 STARGAZE MODE"}
    </button>

    <div className="authorship-area">
      <p>CREATED BY COMYANDRADIS</p>
      <p className="copyright-tag">© 2025 COSMIC VAULT</p>
    </div>
  </footer>
);

// --- PAGES ---

const Home = ({ warmLevel, setWarmLevel, toggleStargaze, isStargaze }: any) => (
  <div className={`page-wrapper ${isStargaze ? 'stargaze-active' : ''}`}>
    <div className="warmth-overlay" style={{ backgroundColor: `rgba(255, 140, 0, ${warmLevel / 100})` }} />
    <Header warmLevel={warmLevel} setWarmLevel={setWarmLevel} isStargaze={isStargaze} />
    <Hero />
    <Footer toggleStargaze={toggleStargaze} isStargaze={isStargaze} />
  </div>
);

const Results = ({ warmLevel, setWarmLevel, toggleStargaze, isStargaze }: any) => {
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
    <div className={`page-wrapper ${isStargaze ? 'stargaze-active' : ''}`}>
      <div className="warmth-overlay" style={{ backgroundColor: `rgba(255, 140, 0, ${warmLevel / 100})` }} />
      <Header warmLevel={warmLevel} setWarmLevel={setWarmLevel} isStargaze={isStargaze} />
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
      <Footer toggleStargaze={toggleStargaze} isStargaze={isStargaze} />
    </div>
  );
};

export default function App() {
  const [warmLevel, setWarmLevel] = useState(0);
  const [isStargaze, setIsStargaze] = useState(false);

  const toggleStargaze = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
      setIsStargaze(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen(); 
        setIsStargaze(false);
      }
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home warmLevel={warmLevel} setWarmLevel={setWarmLevel} toggleStargaze={toggleStargaze} isStargaze={isStargaze} />} />
        <Route path="/search" element={<Results warmLevel={warmLevel} setWarmLevel={setWarmLevel} toggleStargaze={toggleStargaze} isStargaze={isStargaze} />} />
      </Routes>
    </Router>
  );
}