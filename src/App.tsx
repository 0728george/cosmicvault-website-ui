import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css'; // We will put cosmic animations here

// --- COMPONENTS ---

const Home = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Navigate to results page with the query as a URL parameter
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="cosmic-bg full-center">
      <div className="hero-section">
        <h1 className="cinzel-title">COSMIC VAULT</h1>
        <div className="mission-box">
          <p>"Preserving the collective intellect of humanity."</p>
        </div>
        
        <form onSubmit={handleSearch} className="search-container">
          <input 
            type="text" 
            placeholder="Search the infinite..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="main-search"
          />
          <button type="submit" className="search-btn">Explore</button>
        </form>
      </div>
    </div>
  );
};

const Results = () => {
  const [books, setBooks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(6); // Limit to 6 initially
  const query = new URLSearchParams(window.location.search).get('q') || '';

  useEffect(() => {
    fetch('/cosmic_catalog.json')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((b: any) => 
          b.t.toLowerCase().includes(query.toLowerCase()) || 
          b.a.toLowerCase().includes(query.toLowerCase())
        );
        setBooks(filtered);
      });
  }, [query]);

  return (
    <div className="results-page">
      <header className="results-header">
        <h2 onClick={() => window.location.href='/'} className="logo-small">COSMIC VAULT</h2>
        <p>Results for: <span>"{query}"</span></p>
      </header>

      <div className="results-grid">
        {books.slice(0, visibleCount).map((book: any, i) => (
          <div key={i} className="book-card">
            <span className="genre-tag">{book.g}</span>
            <h3>{book.t}</h3>
            <p>{book.a}</p>
            <a href={book.u} target="_blank" className="read-link">Read Now</a>
          </div>
        ))}
      </div>

      {visibleCount < books.length && (
        <button className="load-more" onClick={() => setVisibleCount(prev => prev + 6)}>
          Show More
        </button>
      )}
    </div>
  );
};

// --- MAIN ROUTER ---

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;