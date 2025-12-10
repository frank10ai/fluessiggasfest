import {
  TagesschauHomepageResponse,
  TagesschauNewsResponse,
  RawNewsItem,
} from "./types";
import { TAGESSCHAU_BASE_URL, CACHE_TTL_MS, WORLD_NEWS_COUNT } from "./constants";
import { newsCache } from "./cache";

export async function fetchWorldNews(): Promise<RawNewsItem[]> {
  const cacheKey = "world_news";
  const cached = newsCache.get<RawNewsItem[]>(cacheKey, CACHE_TTL_MS);
  if (cached) return cached;

  const response = await fetch(`${TAGESSCHAU_BASE_URL}/homepage/`, {
    headers: {
      Accept: "application/json",
      "User-Agent": "NextJS-NewsReader/1.0",
    },
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Tagesschau API error: ${response.status}`);
  }

  const data: TagesschauHomepageResponse = await response.json();

  // Filter for actual news stories (not videos, etc.)
  const newsStories = data.news
    .filter(
      (story) =>
        story.type === "story" && story.title && (story.firstSentence || story.topline)
    )
    .slice(0, WORLD_NEWS_COUNT)
    .map((story) => ({
      headline: story.title,
      summary: story.firstSentence || story.topline || "",
      type: "welt" as const,
      originalTitle: story.title,
      originalSummary: story.firstSentence || story.topline || "",
    }));

  newsCache.set(cacheKey, newsStories);
  return newsStories;
}

export async function fetchRegionalNews(
  regionId: number
): Promise<RawNewsItem | null> {
  const cacheKey = `regional_news_${regionId}`;
  const cached = newsCache.get<RawNewsItem>(cacheKey, CACHE_TTL_MS);
  if (cached) return cached;

  const response = await fetch(
    `${TAGESSCHAU_BASE_URL}/news/?regions=${regionId}`,
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "NextJS-NewsReader/1.0",
      },
      next: { revalidate: 300 },
    }
  );

  if (!response.ok) {
    throw new Error(`Tagesschau regional API error: ${response.status}`);
  }

  const data: TagesschauNewsResponse = await response.json();

  // Get the first regional story
  const story = data.news?.find(
    (s) => s.type === "story" && s.title && (s.firstSentence || s.topline)
  );

  if (!story) return null;

  const newsItem: RawNewsItem = {
    headline: story.title,
    summary: story.firstSentence || story.topline || "",
    type: "lokal",
    originalTitle: story.title,
    originalSummary: story.firstSentence || story.topline || "",
  };

  newsCache.set(cacheKey, newsItem);
  return newsItem;
}
