/**
 * One-time seed script — inserts challenges into Supabase.
 * Run: node scripts/seed-challenges.mjs
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

function id() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ─── COUNTRY challenges ────────────────────────────────────────────────────
// Center = capital city. radius = 100 km for GPS fallback.
// country_code matching is used for manual check-in.
const countries = [
  // North America
  { cc: "MX", name: "Mexico",         continent: "NA", lat: 19.4326,   lon: -99.1332,  pts: 100 },
  { cc: "US", name: "United States",  continent: "NA", lat: 38.8951,   lon: -77.0364,  pts: 150 },
  { cc: "CA", name: "Canada",         continent: "NA", lat: 45.4215,   lon: -75.6972,  pts: 150 },
  { cc: "GT", name: "Guatemala",      continent: "NA", lat: 14.6349,   lon: -90.5069,  pts: 100 },
  { cc: "CU", name: "Cuba",           continent: "NA", lat: 23.1136,   lon: -82.3666,  pts: 120 },

  // South America
  { cc: "BR", name: "Brazil",         continent: "SA", lat: -15.7801,  lon: -47.9292,  pts: 150 },
  { cc: "AR", name: "Argentina",      continent: "SA", lat: -34.6037,  lon: -58.3816,  pts: 120 },
  { cc: "CO", name: "Colombia",       continent: "SA", lat: 4.7110,    lon: -74.0721,  pts: 100 },
  { cc: "PE", name: "Peru",           continent: "SA", lat: -12.0464,  lon: -77.0428,  pts: 100 },
  { cc: "CL", name: "Chile",          continent: "SA", lat: -33.4489,  lon: -70.6693,  pts: 100 },
  { cc: "VE", name: "Venezuela",      continent: "SA", lat: 10.4806,   lon: -66.9036,  pts: 100 },

  // Europe
  { cc: "FR", name: "France",         continent: "EU", lat: 48.8566,   lon: 2.3522,    pts: 150 },
  { cc: "ES", name: "Spain",          continent: "EU", lat: 40.4168,   lon: -3.7038,   pts: 150 },
  { cc: "IT", name: "Italy",          continent: "EU", lat: 41.9028,   lon: 12.4964,   pts: 150 },
  { cc: "DE", name: "Germany",        continent: "EU", lat: 52.5200,   lon: 13.4050,   pts: 120 },
  { cc: "GB", name: "United Kingdom", continent: "EU", lat: 51.5074,   lon: -0.1278,   pts: 150 },
  { cc: "PT", name: "Portugal",       continent: "EU", lat: 38.7169,   lon: -9.1395,   pts: 120 },
  { cc: "GR", name: "Greece",         continent: "EU", lat: 37.9838,   lon: 23.7275,   pts: 120 },
  { cc: "NL", name: "Netherlands",    continent: "EU", lat: 52.3676,   lon: 4.9041,    pts: 100 },

  // Asia
  { cc: "JP", name: "Japan",          continent: "AS", lat: 35.6762,   lon: 139.6503,  pts: 150 },
  { cc: "CN", name: "China",          continent: "AS", lat: 39.9042,   lon: 116.4074,  pts: 150 },
  { cc: "IN", name: "India",          continent: "AS", lat: 28.6139,   lon: 77.2090,   pts: 150 },
  { cc: "TH", name: "Thailand",       continent: "AS", lat: 13.7563,   lon: 100.5018,  pts: 120 },
  { cc: "VN", name: "Vietnam",        continent: "AS", lat: 21.0285,   lon: 105.8542,  pts: 100 },
  { cc: "ID", name: "Indonesia",      continent: "AS", lat: -6.2088,   lon: 106.8456,  pts: 120 },
  { cc: "AE", name: "United Arab Emirates", continent: "AS", lat: 25.2048, lon: 55.2708, pts: 130 },
  { cc: "TR", name: "Turkey",         continent: "AS", lat: 39.9334,   lon: 32.8597,   pts: 120 },

  // Africa
  { cc: "EG", name: "Egypt",          continent: "AF", lat: 30.0444,   lon: 31.2357,   pts: 150 },
  { cc: "MA", name: "Morocco",        continent: "AF", lat: 33.9716,   lon: -6.8498,   pts: 120 },
  { cc: "ZA", name: "South Africa",   continent: "AF", lat: -25.7461,  lon: 28.1881,   pts: 150 },
  { cc: "KE", name: "Kenya",          continent: "AF", lat: -1.2921,   lon: 36.8219,   pts: 120 },
  { cc: "NG", name: "Nigeria",        continent: "AF", lat: 9.0579,    lon: 7.4951,    pts: 100 },
  { cc: "TZ", name: "Tanzania",       continent: "AF", lat: -6.3690,   lon: 34.8888,   pts: 100 },

  // Oceania
  { cc: "AU", name: "Australia",      continent: "OC", lat: -35.2809,  lon: 149.1300,  pts: 150 },
  { cc: "NZ", name: "New Zealand",    continent: "OC", lat: -41.2865,  lon: 174.7762,  pts: 150 },
  { cc: "FJ", name: "Fiji",           continent: "OC", lat: -18.1248,  lon: 178.4501,  pts: 120 },
];

const countryRows = countries.map(({ cc, name, continent, lat, lon, pts }) => ({
  id: id(),
  title: `Visit ${name}`,
  description: `Set foot in ${name} and explore its wonders.`,
  category: "COUNTRY",
  points_value: pts,
  latitude: lat,
  longitude: lon,
  radius_meters: 100000,
  country_code: cc,
  continent_code: continent,
  is_active: true,
}));

// ─── WONDER challenges ─────────────────────────────────────────────────────
const wonders = [
  { title: "Chichén Itzá",       desc: "Stand before the ancient Mayan pyramid.",        cc: "MX", cont: "NA", lat: 20.6843,  lon: -88.5678,  r: 2000,   pts: 300 },
  { title: "Machu Picchu",       desc: "Reach the lost city of the Incas.",              cc: "PE", cont: "SA", lat: -13.1631, lon: -72.5450,  r: 2000,   pts: 400 },
  { title: "Christ the Redeemer",desc: "See the iconic statue over Rio de Janeiro.",     cc: "BR", cont: "SA", lat: -22.9519, lon: -43.2105,  r: 1000,   pts: 350 },
  { title: "Colosseum",          desc: "Walk inside the ancient Roman amphitheatre.",    cc: "IT", cont: "EU", lat: 41.8902,  lon: 12.4922,   r: 500,    pts: 350 },
  { title: "Eiffel Tower",       desc: "See Paris from its most iconic landmark.",       cc: "FR", cont: "EU", lat: 48.8584,  lon: 2.2945,    r: 500,    pts: 300 },
  { title: "Sagrada Família",    desc: "Marvel at Gaudí's unfinished masterpiece.",     cc: "ES", cont: "EU", lat: 41.4036,  lon: 2.1744,    r: 500,    pts: 300 },
  { title: "Mount Fuji",         desc: "Reach the iconic peak of Japan.",                cc: "JP", cont: "AS", lat: 35.3606,  lon: 138.7274,  r: 5000,   pts: 500 },
  { title: "Great Wall of China",desc: "Walk along the world's longest wall.",           cc: "CN", cont: "AS", lat: 40.4319,  lon: 116.5704,  r: 3000,   pts: 500 },
  { title: "Taj Mahal",          desc: "Behold the most beautiful tomb ever built.",     cc: "IN", cont: "AS", lat: 27.1751,  lon: 78.0421,   r: 1000,   pts: 400 },
  { title: "Pyramids of Giza",   desc: "Stand before the last of the ancient wonders.", cc: "EG", cont: "AF", lat: 29.9792,  lon: 31.1342,   r: 2000,   pts: 500 },
  { title: "Sydney Opera House", desc: "Visit the world-famous performance centre.",     cc: "AU", cont: "OC", lat: -33.8568, lon: 151.2153,  r: 500,    pts: 300 },
  { title: "Angkor Wat",         desc: "Explore the largest religious monument.",        cc: "KH", cont: "AS", lat: 13.4125,  lon: 103.8670,  r: 3000,   pts: 400 },
];

const wonderRows = wonders.map(({ title, desc, cc, cont, lat, lon, r, pts }) => ({
  id: id(),
  title,
  description: desc,
  category: "WONDER",
  points_value: pts,
  latitude: lat,
  longitude: lon,
  radius_meters: r,
  country_code: cc,
  continent_code: cont,
  is_active: true,
}));

// ─── HIDDEN GEM challenges ─────────────────────────────────────────────────
const hiddenGems = [
  { title: "Cenote Ik-Kil",       desc: "Swim in a hidden cenote in the Yucatán.",             cc: "MX", cont: "NA", lat: 20.6723,   lon: -88.5751,  r: 500,   pts: 200 },
  { title: "Salar de Uyuni",      desc: "Walk on the world's largest salt flat.",              cc: "BO", cont: "SA", lat: -20.1338,  lon: -67.4891,  r: 10000, pts: 350 },
  { title: "Plitvice Lakes",      desc: "Discover Croatia's cascading lake system.",           cc: "HR", cont: "EU", lat: 44.8654,   lon: 15.5820,   r: 2000,  pts: 250 },
  { title: "Ha Long Bay",         desc: "Sail between Vietnam's limestone karsts.",            cc: "VN", cont: "AS", lat: 20.9101,   lon: 107.1839,  r: 5000,  pts: 300 },
  { title: "Zhangjiajie Forest",  desc: "Walk among the inspiration for Avatar's Pandora.",   cc: "CN", cont: "AS", lat: 29.3244,   lon: 110.4347,  r: 5000,  pts: 300 },
  { title: "Faroe Islands",       desc: "Explore the remote archipelago between Iceland and Norway.", cc: "FO", cont: "EU", lat: 62.0000, lon: -6.7900, r: 10000, pts: 350 },
  { title: "Omo Valley",          desc: "Meet indigenous tribes in Ethiopia's most remote valley.", cc: "ET", cont: "AF", lat: 5.8545, lon: 36.5634, r: 10000, pts: 400 },
];

const hiddenGemRows = hiddenGems.map(({ title, desc, cc, cont, lat, lon, r, pts }) => ({
  id: id(),
  title,
  description: desc,
  category: "HIDDEN_GEM",
  points_value: pts,
  latitude: lat,
  longitude: lon,
  radius_meters: r,
  country_code: cc,
  continent_code: cont,
  is_active: true,
}));

// ─── MAGIC TOWN challenges ─────────────────────────────────────────────────
const magicTowns = [
  { title: "Real de Catorce",   desc: "The ghost town turned magic village in the Mexican desert.", cc: "MX", cont: "NA", lat: 23.6833, lon: -100.9000, r: 2000,  pts: 250 },
  { title: "Taxco",             desc: "Mexico's silver city perched on a hillside.",                cc: "MX", cont: "NA", lat: 18.5561, lon: -99.6052,  r: 2000,  pts: 200 },
  { title: "Guanajuato",        desc: "The colorful colonial city built in a canyon.",              cc: "MX", cont: "NA", lat: 21.0190, lon: -101.2574, r: 3000,  pts: 250 },
  { title: "Cuetzalan",         desc: "A mystical town hidden in the Sierra Norte of Puebla.",      cc: "MX", cont: "NA", lat: 20.0294, lon: -97.5255,  r: 2000,  pts: 200 },
  { title: "Bacalar",           desc: "The lake of seven colors on the Yucatán Peninsula.",         cc: "MX", cont: "NA", lat: 18.6724, lon: -88.3906,  r: 3000,  pts: 220 },
];

const magicTownRows = magicTowns.map(({ title, desc, cc, cont, lat, lon, r, pts }) => ({
  id: id(),
  title,
  description: desc,
  category: "MAGIC_TOWN",
  points_value: pts,
  latitude: lat,
  longitude: lon,
  radius_meters: r,
  country_code: cc,
  continent_code: cont,
  is_active: true,
}));

// ─── CONTINENT challenges ──────────────────────────────────────────────────
const continentRows = [
  { continent_code: "AF", title: "African Explorer",           pts: 1000 },
  { continent_code: "AS", title: "Asian Wanderer",             pts: 1000 },
  { continent_code: "EU", title: "European Voyager",           pts: 1000 },
  { continent_code: "NA", title: "North American Trailblazer", pts: 1000 },
  { continent_code: "OC", title: "Oceania Adventurer",         pts: 1000 },
  { continent_code: "SA", title: "South American Pioneer",     pts: 1000 },
].map(({ continent_code, title, pts }) => ({
  id: id(),
  title,
  description: `Visit every country challenge available in ${title.split(" ").slice(-1)[0]}.`,
  category: "CONTINENT",
  points_value: pts,
  latitude: null,
  longitude: null,
  radius_meters: null,
  country_code: null,
  continent_code,
  is_active: true,
}));

// ─── Insert all ────────────────────────────────────────────────────────────
const allChallenges = [
  ...countryRows,
  ...wonderRows,
  ...hiddenGemRows,
  ...magicTownRows,
  ...continentRows,
];

console.log(`Seeding ${allChallenges.length} challenges…`);

const { data, error } = await supabase
  .from("challenges")
  .insert(allChallenges)
  .select("id, title, category");

if (error) {
  console.error("Seed failed:", error.message);
  process.exit(1);
}

console.log(`✅ Seeded ${data.length} challenges:`);
const byCategory = data.reduce((acc, c) => {
  acc[c.category] = (acc[c.category] || 0) + 1;
  return acc;
}, {});
Object.entries(byCategory).forEach(([cat, n]) => console.log(`   ${cat}: ${n}`));
