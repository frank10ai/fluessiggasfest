import { CityConfig } from "./types";

// City to Tagesschau region mapping with coordinates for weather
// Tagesschau regions: 1=BW, 2=Bavaria, 3=Berlin, 4=Brandenburg, 5=Bremen,
// 6=Hamburg, 7=Hesse, 8=MV, 9=Lower Saxony, 10=NRW,
// 11=Rhineland-Palatinate, 12=Saarland, 13=Saxony,
// 14=Saxony-Anhalt, 15=Schleswig-Holstein, 16=Thuringia

// All 16 German Bundesländer with their capitals
export const CITY_CONFIG: Record<string, CityConfig> = {
  stuttgart: {
    name: "Stuttgart",
    stateName: "Baden-Württemberg",
    regionId: 1,
    latitude: 48.7758,
    longitude: 9.1829,
  },
  muenchen: {
    name: "München",
    stateName: "Bayern",
    regionId: 2,
    latitude: 48.1351,
    longitude: 11.582,
  },
  berlin: {
    name: "Berlin",
    stateName: "Berlin",
    regionId: 3,
    latitude: 52.52,
    longitude: 13.405,
  },
  potsdam: {
    name: "Potsdam",
    stateName: "Brandenburg",
    regionId: 4,
    latitude: 52.3906,
    longitude: 13.0645,
  },
  bremen: {
    name: "Bremen",
    stateName: "Bremen",
    regionId: 5,
    latitude: 53.0793,
    longitude: 8.8017,
  },
  hamburg: {
    name: "Hamburg",
    stateName: "Hamburg",
    regionId: 6,
    latitude: 53.5511,
    longitude: 9.9937,
  },
  wiesbaden: {
    name: "Wiesbaden",
    stateName: "Hessen",
    regionId: 7,
    latitude: 50.0782,
    longitude: 8.2398,
  },
  schwerin: {
    name: "Schwerin",
    stateName: "Mecklenburg-Vorpommern",
    regionId: 8,
    latitude: 53.6355,
    longitude: 11.4012,
  },
  hannover: {
    name: "Hannover",
    stateName: "Niedersachsen",
    regionId: 9,
    latitude: 52.3759,
    longitude: 9.732,
  },
  duesseldorf: {
    name: "Düsseldorf",
    stateName: "Nordrhein-Westfalen",
    regionId: 10,
    latitude: 51.2277,
    longitude: 6.7735,
  },
  mainz: {
    name: "Mainz",
    stateName: "Rheinland-Pfalz",
    regionId: 11,
    latitude: 49.9929,
    longitude: 8.2473,
  },
  saarbruecken: {
    name: "Saarbrücken",
    stateName: "Saarland",
    regionId: 12,
    latitude: 49.2354,
    longitude: 6.9965,
  },
  dresden: {
    name: "Dresden",
    stateName: "Sachsen",
    regionId: 13,
    latitude: 51.0504,
    longitude: 13.7373,
  },
  magdeburg: {
    name: "Magdeburg",
    stateName: "Sachsen-Anhalt",
    regionId: 14,
    latitude: 52.1205,
    longitude: 11.6276,
  },
  kiel: {
    name: "Kiel",
    stateName: "Schleswig-Holstein",
    regionId: 15,
    latitude: 54.3233,
    longitude: 10.1228,
  },
  erfurt: {
    name: "Erfurt",
    stateName: "Thüringen",
    regionId: 16,
    latitude: 50.9848,
    longitude: 11.0299,
  },
};

// WMO Weather codes to German descriptions
export const WEATHER_CODES: Record<number, string> = {
  0: "klarer Himmel",
  1: "überwiegend klar",
  2: "teilweise bewölkt",
  3: "bedeckt",
  45: "Nebel",
  48: "gefrierender Nebel",
  51: "leichter Nieselregen",
  53: "mäßiger Nieselregen",
  55: "starker Nieselregen",
  56: "gefrierender Nieselregen",
  57: "starker gefrierender Nieselregen",
  61: "leichter Regen",
  63: "mäßiger Regen",
  65: "starker Regen",
  66: "gefrierender Regen",
  67: "starker gefrierender Regen",
  71: "leichter Schneefall",
  73: "mäßiger Schneefall",
  75: "starker Schneefall",
  77: "Schneegriesel",
  80: "leichte Regenschauer",
  81: "mäßige Regenschauer",
  82: "starke Regenschauer",
  85: "leichte Schneeschauer",
  86: "starke Schneeschauer",
  95: "Gewitter",
  96: "Gewitter mit leichtem Hagel",
  99: "Gewitter mit starkem Hagel",
};

// API endpoints
export const TAGESSCHAU_BASE_URL = "https://www.tagesschau.de/api2u";
export const OPEN_METEO_BASE_URL = "https://api.open-meteo.com/v1/forecast";

// Cache configuration
export const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const SIMPLIFIED_CACHE_TTL_MS = 60 * 60 * 1000; // 60 minutes for simplified text
export const WORLD_NEWS_COUNT = 3;
