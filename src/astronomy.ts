// src/astronomy.ts

// --- 1. THE STAR CATALOG (Brightest Stars & Constellation Markers) ---
// RA (Right Ascension) is in hours, Dec (Declination) is in degrees.
// Mag is brightness (lower is brighter).

export interface StarData {
  name: string;
  ra: number;  // Hours (0-24)
  dec: number; // Degrees (-90 to +90)
  mag: number; // Magnitude
  color: string; // Spectral Color
}

export const REAL_STARS: StarData[] = [
  // WINTER HEXAGON STARS
  { name: "Sirius", ra: 6.75, dec: -16.7, mag: -1.46, color: "#a2b9ff" }, // Canis Major
  { name: "Rigel", ra: 5.24, dec: -8.2, mag: 0.13, color: "#a2b9ff" },    // Orion Foot
  { name: "Betelgeuse", ra: 5.92, dec: 7.4, mag: 0.5, color: "#ff906e" }, // Orion Shoulder
  { name: "Aldebaran", ra: 4.6, dec: 16.5, mag: 0.87, color: "#ffcc6f" }, // Taurus
  { name: "Capella", ra: 5.27, dec: 46.0, mag: 0.08, color: "#fff5f2" },  // Auriga
  { name: "Pollux", ra: 7.75, dec: 28.0, mag: 1.14, color: "#ffcc6f" },   // Gemini
  { name: "Procyon", ra: 7.65, dec: 5.2, mag: 0.34, color: "#fff5f2" },   // Canis Minor

  // ORION BELT
  { name: "Alnitak", ra: 5.68, dec: -1.9, mag: 1.7, color: "#9db4ff" },
  { name: "Alnilam", ra: 5.6, dec: -1.2, mag: 1.69, color: "#9db4ff" },
  { name: "Mintaka", ra: 5.53, dec: -0.3, mag: 2.2, color: "#cad8ff" },

  // BIG DIPPER (Ursa Major)
  { name: "Dubhe", ra: 11.06, dec: 61.75, mag: 1.79, color: "#ffcc6f" },
  { name: "Merak", ra: 11.03, dec: 56.38, mag: 2.37, color: "#f8f7ff" },
  { name: "Phecda", ra: 11.89, dec: 53.69, mag: 2.44, color: "#cad8ff" },
  { name: "Megrez", ra: 12.25, dec: 57.03, mag: 3.31, color: "#cad8ff" },
  { name: "Alioth", ra: 12.9, dec: 55.95, mag: 1.77, color: "#cad8ff" },
  { name: "Mizar", ra: 13.4, dec: 54.92, mag: 2.27, color: "#cad8ff" },
  { name: "Alkaid", ra: 13.79, dec: 49.31, mag: 1.86, color: "#9db4ff" },

  // SUMMER TRIANGLE
  { name: "Vega", ra: 18.62, dec: 38.78, mag: 0.03, color: "#cad8ff" },
  { name: "Altair", ra: 19.84, dec: 8.87, mag: 0.77, color: "#f8f7ff" },
  { name: "Deneb", ra: 20.69, dec: 45.28, mag: 1.25, color: "#cad8ff" },

  // OTHERS
  { name: "Arcturus", ra: 14.26, dec: 19.18, mag: -0.05, color: "#ffcc6f" },
  { name: "Antares", ra: 16.49, dec: -26.43, mag: 1.06, color: "#ff906e" },
  { name: "Spica", ra: 13.42, dec: -11.16, mag: 0.97, color: "#cad8ff" },
  { name: "Polaris", ra: 2.53, dec: 89.26, mag: 1.98, color: "#fff5f2" }, // North Star
];

// --- 2. THE PHYSICS ENGINE (Coordinate Conversion) ---

// Convert Degrees to Radians
const rad = (deg: number) => deg * (Math.PI / 180);
const deg = (rad: number) => rad * (180 / Math.PI);

export function getStarPosition(
  star: StarData, 
  lat: number, 
  lng: number, 
  time: Date
): { x: number, y: number, visible: boolean } | null {
  
  // 1. Calculate Local Sidereal Time (LST)
  // This tells us "what part of the universe is above us right now"
  const d = (time.getTime() - new Date(Date.UTC(2000, 0, 1, 12, 0, 0)).getTime()) / 86400000;
  const GMST = 18.697374558 + 24.06570982441908 * d;
  const LST = (GMST + lng / 15) % 24;

  // 2. Calculate Hour Angle (HA)
  let HA = (LST - star.ra) * 15; // Degrees
  if (HA < 0) HA += 360;

  // 3. Convert Equatorial (Space) to Horizontal (Earth View) coords
  // Formulas for Altitude (Alt) and Azimuth (Az)
  const sinAlt = Math.sin(rad(star.dec)) * Math.sin(rad(lat)) + 
                 Math.cos(rad(star.dec)) * Math.cos(rad(lat)) * Math.cos(rad(HA));
  const alt = deg(Math.asin(sinAlt));

  if (alt < 0) return { x: 0, y: 0, visible: false }; // Star is below horizon

  const cosAz = (Math.sin(rad(star.dec)) - Math.sin(rad(lat)) * sinAlt) / 
                (Math.cos(rad(lat)) * Math.cos(rad(alt)));
  let az = deg(Math.acos(cosAz));
  if (Math.sin(rad(HA)) > 0) az = 360 - az;

  // 4. Map to Screen Coordinates (Polar Projection)
  // Center of screen is Zenith (90 deg altitude). Edges are Horizon (0 deg).
  const radius = (90 - alt) / 90; // 0 at center, 1 at edge
  const angle = rad(az - 90); // Rotate so North is Up

  return {
    x: Math.cos(angle) * radius, // Normalized -1 to 1
    y: Math.sin(angle) * radius, // Normalized -1 to 1
    visible: true
  };
}