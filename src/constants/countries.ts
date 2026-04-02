import type { ChallengeCategory } from "../types";

// ISO 3166-1 alpha-2 continent groupings
export type ContinentCode = "AF" | "AN" | "AS" | "EU" | "NA" | "OC" | "SA";

export const CONTINENT_NAMES: Record<ContinentCode, string> = {
  AF: "Africa",
  AN: "Antarctica",
  AS: "Asia",
  EU: "Europe",
  NA: "North America",
  OC: "Oceania",
  SA: "South America",
};

export const CONTINENT_TO_COUNTRIES: Record<ContinentCode, string[]> = {
  AF: [
    "DZ","AO","BJ","BW","BF","BI","CV","CM","CF","TD","KM","CG","CD","CI","DJ",
    "EG","GQ","ER","SZ","ET","GA","GM","GH","GN","GW","KE","LS","LR","LY","MG",
    "MW","ML","MR","MU","YT","MA","MZ","NA","NE","NG","RE","RW","ST","SN","SC",
    "SL","SO","ZA","SS","SD","TZ","TG","TN","UG","EH","ZM","ZW",
  ],
  AN: ["AQ"],
  AS: [
    "AF","AM","AZ","BH","BD","BT","BN","KH","CN","CX","CC","IO","GE","HK","IN",
    "ID","IR","IQ","IL","JP","JO","KZ","KW","KG","LA","LB","MO","MY","MV","MN",
    "MM","NP","KP","OM","PK","PS","PH","QA","SA","SG","LK","SY","TW","TJ","TH",
    "TL","TR","TM","AE","UZ","VN","YE",
  ],
  EU: [
    "AL","AD","AT","BY","BE","BA","BG","HR","CY","CZ","DK","EE","FI","FR","DE",
    "GI","GR","GG","VA","HU","IS","IE","IM","IT","JE","XK","LV","LI","LT","LU",
    "MT","MD","MC","ME","NL","MK","NO","PL","PT","RO","RU","SM","RS","SK","SI",
    "ES","SE","CH","UA","GB",
  ],
  NA: [
    "AG","BS","BB","BZ","CA","CR","CU","DM","DO","SV","GD","GT","HT","HN","JM",
    "MX","NI","PA","KN","LC","VC","TT","US",
  ],
  OC: [
    "AU","FJ","KI","MH","FM","NR","NZ","PW","PG","WS","SB","TO","TV","VU",
  ],
  SA: [
    "AR","BO","BR","CL","CO","EC","GY","PY","PE","SR","UY","VE",
  ],
};

// Inverse map: country code → continent code
export const COUNTRY_TO_CONTINENT: Record<string, ContinentCode> = Object.entries(
  CONTINENT_TO_COUNTRIES
).reduce<Record<string, ContinentCode>>((acc, [continent, countries]) => {
  for (const cc of countries) {
    acc[cc] = continent as ContinentCode;
  }
  return acc;
}, {});

// Country list for manual check-in — name, ISO code, and centroid coordinates
export interface CountryEntry {
  code: string;
  name: string;
  nameEn: string;
  nameEs: string;
  latitude: number;
  longitude: number;
  continent: ContinentCode;
}

/** @deprecated Use CountryEntry */
export type Country = CountryEntry;

/** Converts an ISO 3166-1 alpha-2 code to its flag emoji (e.g. "MX" → "🇲🇽") */
export function getFlagEmoji(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

function c(
  code: string,
  nameEn: string,
  nameEs: string,
  latitude: number,
  longitude: number,
  continent: ContinentCode
): CountryEntry {
  return { code, name: nameEn, nameEn, nameEs, latitude, longitude, continent };
}

export const COUNTRIES: CountryEntry[] = [
  c("AR", "Argentina", "Argentina", -38.416097, -63.616672, "SA"),
  c("AU", "Australia", "Australia", -25.274398, 133.775136, "OC"),
  c("AT", "Austria", "Austria", 47.516231, 14.550072, "EU"),
  c("BE", "Belgium", "Bélgica", 50.503887, 4.469936, "EU"),
  c("BR", "Brazil", "Brasil", -14.235004, -51.925282, "SA"),
  c("CA", "Canada", "Canadá", 56.130366, -106.346771, "NA"),
  c("CL", "Chile", "Chile", -35.675147, -71.542969, "SA"),
  c("CN", "China", "China", 35.86166, 104.195397, "AS"),
  c("CO", "Colombia", "Colombia", 4.570868, -74.297333, "SA"),
  c("HR", "Croatia", "Croacia", 45.1, 15.2, "EU"),
  c("CZ", "Czech Republic", "República Checa", 49.817492, 15.472962, "EU"),
  c("DK", "Denmark", "Dinamarca", 56.26392, 9.501785, "EU"),
  c("EG", "Egypt", "Egipto", 26.820553, 30.802498, "AF"),
  c("ET", "Ethiopia", "Etiopía", 9.145, 40.489673, "AF"),
  c("FI", "Finland", "Finlandia", 61.92411, 25.748151, "EU"),
  c("FR", "France", "Francia", 46.227638, 2.213749, "EU"),
  c("DE", "Germany", "Alemania", 51.165691, 10.451526, "EU"),
  c("GH", "Ghana", "Ghana", 7.946527, -1.023194, "AF"),
  c("GR", "Greece", "Grecia", 39.074208, 21.824312, "EU"),
  c("HU", "Hungary", "Hungría", 47.162494, 19.503304, "EU"),
  c("IN", "India", "India", 20.593684, 78.96288, "AS"),
  c("ID", "Indonesia", "Indonesia", -0.789275, 113.921327, "AS"),
  c("IE", "Ireland", "Irlanda", 53.41291, -8.24389, "EU"),
  c("IL", "Israel", "Israel", 31.046051, 34.851612, "AS"),
  c("IT", "Italy", "Italia", 41.87194, 12.56738, "EU"),
  c("JP", "Japan", "Japón", 36.204824, 138.252924, "AS"),
  c("KE", "Kenya", "Kenia", -0.023559, 37.906193, "AF"),
  c("KR", "South Korea", "Corea del Sur", 35.907757, 127.766922, "AS"),
  c("MA", "Morocco", "Marruecos", 31.791702, -7.09262, "AF"),
  c("MX", "Mexico", "México", 23.634501, -102.552784, "NA"),
  c("NL", "Netherlands", "Países Bajos", 52.132633, 5.291266, "EU"),
  c("NZ", "New Zealand", "Nueva Zelanda", -40.900557, 174.885971, "OC"),
  c("NG", "Nigeria", "Nigeria", 9.081999, 8.675277, "AF"),
  c("NO", "Norway", "Noruega", 60.472024, 8.468946, "EU"),
  c("PK", "Pakistan", "Pakistán", 30.375321, 69.345116, "AS"),
  c("PE", "Peru", "Perú", -9.189967, -75.015152, "SA"),
  c("PH", "Philippines", "Filipinas", 12.879721, 121.774017, "AS"),
  c("PL", "Poland", "Polonia", 51.919438, 19.145136, "EU"),
  c("PT", "Portugal", "Portugal", 39.399872, -8.224454, "EU"),
  c("RO", "Romania", "Rumania", 45.943161, 24.96676, "EU"),
  c("RU", "Russia", "Rusia", 61.52401, 105.318756, "EU"),
  c("SA", "Saudi Arabia", "Arabia Saudita", 23.885942, 45.079162, "AS"),
  c("ZA", "South Africa", "Sudáfrica", -30.559482, 22.937506, "AF"),
  c("ES", "Spain", "España", 40.463667, -3.74922, "EU"),
  c("SE", "Sweden", "Suecia", 60.128161, 18.643501, "EU"),
  c("CH", "Switzerland", "Suiza", 46.818188, 8.227512, "EU"),
  c("TH", "Thailand", "Tailandia", 15.870032, 100.992541, "AS"),
  c("TR", "Turkey", "Turquía", 38.963745, 35.243322, "AS"),
  c("UA", "Ukraine", "Ucrania", 48.379433, 31.16558, "EU"),
  c("AE", "United Arab Emirates", "Emiratos Árabes Unidos", 23.424076, 53.847818, "AS"),
  c("GB", "United Kingdom", "Reino Unido", 55.378051, -3.435973, "EU"),
  c("US", "United States", "Estados Unidos", 37.09024, -95.712891, "NA"),
  c("UY", "Uruguay", "Uruguay", -32.522779, -55.765835, "SA"),
  c("VE", "Venezuela", "Venezuela", 6.42375, -66.58973, "SA"),
  c("VN", "Vietnam", "Vietnam", 14.058324, 108.277199, "AS"),
];

// Continent challenge seed data
export interface ContinentChallengeSeed {
  title: string;
  description: string;
  category: ChallengeCategory;
  points_value: number;
  continent_code: ContinentCode;
}

export const CONTINENT_CHALLENGES: ContinentChallengeSeed[] = [
  {
    title: "African Explorer",
    description: "Visit every country challenge available in Africa.",
    category: "CONTINENT",
    points_value: 1000,
    continent_code: "AF",
  },
  {
    title: "Asian Wanderer",
    description: "Visit every country challenge available in Asia.",
    category: "CONTINENT",
    points_value: 1000,
    continent_code: "AS",
  },
  {
    title: "European Voyager",
    description: "Visit every country challenge available in Europe.",
    category: "CONTINENT",
    points_value: 1000,
    continent_code: "EU",
  },
  {
    title: "North American Trailblazer",
    description: "Visit every country challenge available in North America.",
    category: "CONTINENT",
    points_value: 1000,
    continent_code: "NA",
  },
  {
    title: "Oceania Adventurer",
    description: "Visit every country challenge available in Oceania.",
    category: "CONTINENT",
    points_value: 1000,
    continent_code: "OC",
  },
  {
    title: "South American Pioneer",
    description: "Visit every country challenge available in South America.",
    category: "CONTINENT",
    points_value: 1000,
    continent_code: "SA",
  },
];
