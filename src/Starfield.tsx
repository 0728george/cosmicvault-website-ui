import { useEffect, useRef } from 'react';
import { REAL_STARS, getStarPosition } from './astronomy';

interface StarfieldProps {
  mode: 'ambient' | 'real';
  userLocation: { lat: number; lng: number } | null;
}

const Starfield = ({ mode, userLocation }: StarfieldProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // --- SETUP AMBIENT STARS (Artistic) ---
    // We keep these for the "Ambient" mode
    interface AmbientStar {
      x: number; y: number; size: number; color: string; alpha: number; speed: number;
    }
    const ambientStars: AmbientStar[] = [];
    const colors = ["#9db4ff", "#a2b9ff", "#cad8ff", "#fff5f2", "#ffcc6f"];
    
    for (let i = 0; i < 600; i++) {
      ambientStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random(),
        speed: Math.random() * 0.2 + 0.05
      });
    }

    // --- RENDER LOOP ---
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      // 1. Background Gradient (Same for both)
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width);
      gradient.addColorStop(0, "#0f1c2e");
      gradient.addColorStop(1, "#000000");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // --- MODE A: REAL SKY ---
      if (mode === 'real' && userLocation) {
        const cx = width / 2;
        const cy = height / 2;
        const scale = Math.min(width, height) / 2; // Radius of sky circle

        // Draw Compass Ring
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, scale, 0, Math.PI * 2);
        ctx.stroke();

        // Draw Real Stars
        REAL_STARS.forEach(star => {
          const pos = getStarPosition(star, userLocation.lat, userLocation.lng, new Date());
          
          if (pos && pos.visible) {
            const x = cx + pos.x * scale;
            const y = cy + pos.y * scale;
            
            // Draw Star
            ctx.fillStyle = star.color;
            ctx.shadowBlur = (2 - star.mag) * 5; // Bright stars glow more
            ctx.shadowColor = star.color;
            
            ctx.beginPath();
            // Magnitude to Size math: Brighter stars are larger
            const size = Math.max(1, (3 - star.mag) * 1.5); 
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw Label (Only for very bright stars)
            if (star.mag < 1.5) {
              ctx.fillStyle = "rgba(255,255,255,0.4)";
              ctx.font = "10px Inter";
              ctx.fillText(star.name, x + 8, y + 3);
            }
          }
        });

      } 
      // --- MODE B: AMBIENT SKY ---
      else {
        ambientStars.forEach(star => {
          star.y -= star.speed; // Drift up
          if (star.y < 0) star.y = height;
          
          ctx.globalAlpha = star.alpha;
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Resize Logic
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, userLocation]);

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, zIndex: -1 }} />;
};

export default Starfield;