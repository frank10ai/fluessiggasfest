import { OpenMeteoResponse, RawNewsItem } from "./types";
import { OPEN_METEO_BASE_URL, WEATHER_CODES, CACHE_TTL_MS } from "./constants";
import { newsCache } from "./cache";

export async function fetchWeather(
  cityName: string,
  latitude: number,
  longitude: number
): Promise<RawNewsItem> {
  const cacheKey = `weather_${latitude}_${longitude}`;
  const cached = newsCache.get<RawNewsItem>(cacheKey, CACHE_TTL_MS);
  if (cached) return cached;

  const url = new URL(OPEN_METEO_BASE_URL);
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("current", "temperature_2m,weathercode");
  url.searchParams.set("timezone", "Europe/Berlin");

  const response = await fetch(url.toString(), {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo API error: ${response.status}`);
  }

  const data: OpenMeteoResponse = await response.json();

  const temp = Math.round(data.current.temperature_2m);
  const weatherDesc = WEATHER_CODES[data.current.weathercode] || "wechselhaft";

  // Create a friendly weather message
  const clothingAdvice =
    temp < 5
      ? "Ziehen Sie sich warm an, wenn Sie das Haus verlassen."
      : temp < 15
        ? "Denken Sie an eine Jacke, wenn Sie nach draußen gehen."
        : "Ein schöner Tag, um nach draußen zu gehen.";

  const weatherItem: RawNewsItem = {
    headline: `Das Wetter in ${cityName}`,
    summary: `Heute erwarten wir ${weatherDesc}. Die Temperaturen liegen bei ${temp} Grad. ${clothingAdvice}`,
    type: "wetter",
  };

  newsCache.set(cacheKey, weatherItem);
  return weatherItem;
}
