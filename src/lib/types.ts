// Frontend-expected types (matches page.tsx interface)
export interface NewsItem {
  headline: string;
  summary: string;
  type: "welt" | "lokal" | "wetter";
}

export interface NewsApiResponse {
  news: NewsItem[];
  isLive: boolean;
}

// Internal processing type with original text for Claude simplification
export interface RawNewsItem {
  headline: string;
  summary: string;
  type: "welt" | "lokal" | "wetter";
  originalTitle?: string;
  originalSummary?: string;
}

// Tagesschau API response types
export interface TagesschauStory {
  sophoraId?: string;
  title: string;
  topline?: string;
  firstSentence?: string;
  date?: string;
  regionId?: number;
  ressort?: string;
  type: string;
  shareURL?: string;
  tags?: Array<{ tag: string }>;
}

export interface TagesschauHomepageResponse {
  news: TagesschauStory[];
  regional?: TagesschauStory[];
}

export interface TagesschauNewsResponse {
  news: TagesschauStory[];
}

// Open-Meteo API response types
export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;
  current_units: {
    temperature_2m: string;
    weathercode: string;
  };
  current: {
    time: string;
    temperature_2m: number;
    weathercode: number;
  };
}

// City configuration type
export interface CityConfig {
  name: string;
  stateName: string;
  regionId: number;
  latitude: number;
  longitude: number;
}
