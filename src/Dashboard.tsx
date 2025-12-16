import { useState, useEffect } from 'react';

const API_URL = "/api";

interface Secret {
  id: string;
  name: string;
  value: string;
}

interface DashboardProps {
  userId: string;
  onLogout: () => void;
}

export default function Dashboard({ userId, onLogout }: DashboardProps) {
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Inputs
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");
  
  // PHASE 7: Search State
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchSecrets();
  }, [userId]);

  const fetchSecrets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/secrets?userId=${userId}`);
      const data = await res.json();
      if (Array.isArray(data)) setSecrets(data);
    } catch (e) {
      console.error("Failed to load secrets", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!name || !value) return;
    setStatus("Encrypting...");

    try {
      const res = await fetch(`${API_URL}/secrets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name, secretValue: value })
      });

      if (res.ok) {
        setStatus("Asset Secured.");
        setName("");
        setValue("");
        fetchSecrets(); 
      } else {
        setStatus("Save failed.");
      }
    } catch (e) {
      setStatus("Network error.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to destroy this secret?")) return;
    const originalSecrets = [...secrets];
    setSecrets(secrets.filter(s => s.id !== id));

    try {
      const res = await fetch(`${API_URL}/secrets?id=${id}&userId=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Delete failed");
    } catch (e) {
      alert("Failed to delete item.");
      setSecrets(originalSecrets);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setStatus("Copied to clipboard.");
    setTimeout(() => setStatus(""), 2000);
  };

  // PHASE 7: Export Functionality
  const handleExport = () => {
    const dataStr = JSON.stringify(secrets, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cosmic_vault_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter secrets based on search
  const filteredSecrets = secrets.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ width: '100%', maxWidth: '700px', zIndex: 20, textAlign: 'left', animation: 'fadeIn 0.5s ease-out' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, letterSpacing: '4px', color: 'white', fontSize: '1.2rem' }}>VAULT INTERFACE</h2>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', opacity: 0.8, letterSpacing: '1px' }}>SECURE CONNECTION ESTABLISHED</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
             {/* EXPORT BUTTON */}
            <button onClick={handleExport} style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', cursor: 'pointer' }}>
                EXPORT DATA
            </button>
            <button onClick={onLogout} style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem', background: 'rgba(255, 100, 100, 0.1)', border: '1px solid rgba(255, 100, 100, 0.4)', color: '#ffaaaa', cursor: 'pointer' }}>
                CLOSE SESSION
            </button>
        </div>
      </div>

      {/* Add Secret Form */}
      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2.5rem', background: 'rgba(10, 15, 30, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <h3 style={{ fontSize: '0.8rem', marginBottom: '1.2rem', color: 'var(--accent-gold)', letterSpacing: '2px' }}>ENCRYPT NEW ASSET</h3>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <input 
            placeholder="Label (e.g. Meta Login)" 
            value={name} 
            onChange={e => setName(e.target.value)}
            style={{ flex: 1, padding: '1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.9rem' }} 
          />
          <input 
            placeholder="Secret Value" 
            type="password"
            value={value} 
            onChange={e => setValue(e.target.value)}
            style={{ flex: 2, padding: '1rem', background: 'rgba(0,0,0,0.4)', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '0.9rem' }} 
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', height: '20px' }}>{status}</span>
          <button onClick={handleAdd} style={{ padding: '0.8rem 2rem', fontWeight: 'bold', cursor: 'pointer', background: 'white', color: 'black', border: 'none', borderRadius: '2px', letterSpacing: '1px', fontSize: '0.8rem' }}>
            SECURE ASSET
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input 
            type="text" 
            placeholder="Search Assets..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderBottom: '1px solid #444', color: 'white', outline: 'none' }}
        />
      </div>

      {/* Secrets List */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', color: 'white', letterSpacing: '2px', margin: 0 }}>SECURED ASSETS</h3>
        <span style={{ fontSize: '0.8rem', color: '#666' }}>{filteredSecrets.length} ITEMS</span>
      </div>

      <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
        {loading ? <p style={{color: '#666', fontSize: '0.9rem'}}>Decrypting vault contents...</p> : (
          filteredSecrets.length === 0 ? 
            <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed #333', borderRadius: '8px', color: '#555' }}>NO ASSETS FOUND</div> : (
            filteredSecrets.map(secret => (
              <div key={secret.id} style={{ 
                background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.0) 100%)', 
                padding: '1.2rem', 
                marginBottom: '0.8rem', 
                borderRadius: '6px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderLeft: '2px solid var(--accent-gold)',
              }}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <span style={{ fontWeight: 'bold', color: 'white', fontSize: '0.95rem' }}>{secret.name}</span>
                  <span style={{ fontFamily: 'monospace', color: '#888', fontSize: '0.85rem' }}>••••••••••••</span>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleCopy(secret.value)} title="Copy" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', cursor: 'pointer', borderRadius: '4px', fontSize: '0.75rem' }}>COPY</button>
                  <button onClick={() => handleDelete(secret.id)} title="Destroy" style={{ padding: '0.5rem', background: 'transparent', border: '1px solid #442222', color: '#aa4444', cursor: 'pointer', borderRadius: '4px', fontSize: '0.75rem', minWidth: '30px' }}>X</button>
                </div>
              </div>
            ))
          )
        )}
      </div>

    </div>
  );
}