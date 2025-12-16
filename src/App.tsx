import { useState, useEffect } from 'react';

// Interface to match your Python JSON keys: t (title), a (author), g (genre), u (url)
interface Book {
  id: string;
  t: string; 
  a: string; 
  g: string; 
  y: string; 
  u: string; 
}

function App() {
  const [catalog, setCatalog] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch the data from the public folder
  useEffect(() => {
    fetch('/cosmic_catalog.json')
      .then(res => res.json())
      .then(data => setCatalog(data))
      .catch(err => console.error("Vault Error:", err));
  }, []);

  // Filter logic: Checks Title, Author, and Genre
  const filteredBooks = catalog.filter(book => 
    book.t.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.a.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.g.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', color: '#f8fafc', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. MISSION STATEMENT SECTION */}
      <header style={{ maxWidth: '800px', margin: '0 auto 3rem auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '4rem', color: '#f59e0b', marginBottom: '1rem' }}>COSMIC VAULT</h1>
        <div style={{ borderLeft: '4px solid #f59e0b', padding: '1rem', backgroundColor: 'rgba(30, 41, 59, 0.5)', fontStyle: 'italic' }}>
          <p style={{ fontSize: '1.2rem', color: '#94a3b8', margin: 0 }}>
            "A modern Library of Alexandria: Preserving the collective intellect of humanity 
            through decentralized archival. Open access for all, forever."
          </p>
        </div>
      </header>

      {/* 2. INTELLIGENT SEARCH BAR */}
      <div style={{ maxWidth: '600px', margin: '0 auto 4rem auto' }}>
        <input 
          type="text"
          placeholder="Search the vault (Title, Author, or Genre)..."
          style={{
            width: '100%',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: 'white',
            fontSize: '1.2rem',
            outline: 'none'
          }}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem', textAlign: 'right' }}>
          Showing {filteredBooks.length} results
        </p>
      </div>

      {/* 3. RESULTS GRID */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {filteredBooks.map((book, index) => (
          <div key={index} style={{ 
            backgroundColor: '#1e293b', 
            padding: '1.5rem', 
            borderRadius: '12px', 
            border: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <span style={{ color: '#f59e0b', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '0.1rem' }}>{book.g.toUpperCase()}</span>
              <h3 style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>{book.t}</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{book.a} ({book.y})</p>
            </div>
            <a 
              href={book.u} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                marginTop: '1.5rem',
                backgroundColor: '#f59e0b',
                color: 'black',
                textAlign: 'center',
                padding: '0.6rem',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Read Now
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;