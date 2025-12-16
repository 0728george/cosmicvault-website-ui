import { useState } from 'react';
import Starfield from './Starfield';
import Dashboard from './Dashboard'; // Import the new component
import './index.css';

// ✅ Correct relative API path
const API_URL = "/api"; 

function App() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [skyMode, setSkyMode] = useState<'ambient' | 'real'>('ambient');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  // User State
  const [user, setUser] = useState<string | null>(null); // Stores userId if logged in
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // GEOGRAPHIC CENTER OF THE USA
  const DEFAULT_LOCATION = { lat: 39.8283, lng: -98.5795 };

  // --- HANDLE AUTH ---
  const handleAuth = async () => {
    setStatusMsg("Connecting to Vault...");

    if (!email || !password) {
      setStatusMsg("Error: Please enter email and Master Key.");
      return;
    }

    const endpoint = isLoginView ? `${API_URL}/login` : `${API_URL}/register`;
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMsg(isLoginView ? "Login Successful." : "Identity Created. Please Login.");
        
        if (isLoginView) {
          // LOGIN SUCCESS -> GO TO DASHBOARD
          if (data.userId) setUser(data.userId);
        } else {
          // REGISTER SUCCESS -> SWITCH TO LOGIN VIEW
          setIsLoginView(true);
        }
      } else {
        setStatusMsg(`[API Error: ${data.error || "Unknown Error"}]`);
      }
    } catch (e) {
      console.error("Fetch Error:", e);
      setStatusMsg("[Connection Failure. Try again.]");
    }
  };

  const toggleSkyMode = () => {
    if (skyMode === 'real') {
      setSkyMode('ambient');
      setStatusMsg("");
      return;
    }
    setStatusMsg("Aligning telescopes...");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setSkyMode('real');
          setStatusMsg(`Observatory: ${pos.coords.latitude.toFixed(2)}°, ${pos.coords.longitude.toFixed(2)}°`);
        },
        () => {
          setLocation(DEFAULT_LOCATION);
          setSkyMode('real');
          setStatusMsg("GPS Denied. Using Default View.");
        }
      );
    } else {
        setLocation(DEFAULT_LOCATION);
        setSkyMode('real');
        setStatusMsg("GPS Not Supported.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', position: 'relative' }}>
      
      <Starfield mode={skyMode} userLocation={location} />

      {/* HEADER */}
      <header style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', letterSpacing: '4px', color: 'white' }}>
          COSMIC VAULT
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={toggleSkyMode} style={{ fontSize: '0.7rem', borderColor: skyMode === 'real' ? '#fff' : 'var(--accent-gold)' }}>
            {skyMode === 'real' ? "Return to Orbit" : "View My Sky"}
          </button>
          
          {/* Only show Login toggle if NOT logged in */}
          {!user && (
            <button onClick={() => setIsLoginView(!isLoginView)} style={{ fontSize: '0.7rem' }}>
              {isLoginView ? "Need an Account?" : "Return to Login"}
            </button>
          )}
        </div>
      </header>

      {/* MAIN INTERFACE */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '1rem', zIndex: 10 }}>
        
        {/* SHOW DASHBOARD IF LOGGED IN */}
        {user ? (
          <Dashboard userId={user} onLogout={() => { setUser(null); setPassword(""); setStatusMsg(""); }} />
        ) : (
          /* SHOW LOGIN FORM IF NOT LOGGED IN */
          skyMode === 'ambient' && (
            <>
              {statusMsg && <div style={{ color: 'var(--accent-gold)', marginBottom: '1rem', fontSize: '0.8rem', fontFamily: 'monospace' }}>[{statusMsg}]</div>}

              <h1 style={{ marginBottom: '1rem', textShadow: '0 0 30px rgba(255,255,255,0.3)' }}>
                {isLoginView ? "Enter the Void" : "Join the Stars"}
              </h1>
              
              <div className="glass-panel" style={{ padding: '2.5rem', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <input type="email" placeholder="Identity (Email)" value={email} onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '1rem', background: 'rgba(5, 5, 9, 0.6)', border: '1px solid #444', color: 'white', borderRadius: '4px' }} />

                <input type="password" placeholder="Master Key (Password)" value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '1rem', background: 'rgba(5, 5, 9, 0.6)', border: '1px solid #444', color: 'white', borderRadius: '4px' }} />

                <button onClick={handleAuth} style={{ width: '100%', marginTop: '0.5rem', fontWeight: 700 }}>
                  {isLoginView ? "Unlock Vault" : "Initialize Identity"}
                </button>
              </div>
            </>
          )
        )}
      </main>

      <footer style={{ padding: '2rem', textAlign: 'center', opacity: 0.6, fontSize: '0.75rem', zIndex: 10 }}>
        <p style={{letterSpacing: '1px'}}>SECURED BY AES-256 / PBKDF2</p>
      </footer>

    </div>
  );
}

export default App;