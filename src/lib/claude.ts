import Anthropic from "@anthropic-ai/sdk";
import { RawNewsItem, NewsItem } from "./types";
import { newsCache } from "./cache";
import { SIMPLIFIED_CACHE_TTL_MS } from "./constants";

const anthropic = new Anthropic();

// Simple hash function for cache key generation
function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

const SIMPLIFICATION_PROMPT = `Du bist ein freundlicher Nachrichtensprecher wie aus den 1980er Jahren.
Deine Aufgabe ist es, Nachrichten so umzuschreiben, dass sie für ältere Menschen leicht verständlich sind.

WICHTIGE REGELN:
- Verwende einfache, klare Sätze
- Vermeide Fremdwörter und Fachbegriffe
- Schreibe in einem ruhigen, beruhigenden Ton
- Keine Panik oder Dramatik - auch bei ernsten Themen sachlich bleiben
- Behalte alle wichtigen Informationen bei
- Die Zusammenfassung sollte 2-3 kurze Sätze lang sein
- Schreibe auf Deutsch

Du erhältst die Überschrift und Zusammenfassung einer Nachricht.
Gib NUR die vereinfachte Version zurück, ohne zusätzliche Erklärungen.

Format deiner Antwort (für jede Nachricht):
ÜBERSCHRIFT: [vereinfachte Überschrift]
ZUSAMMENFASSUNG: [vereinfachte Zusammenfassung]`;

function parseSimplifiedResponse(
  text: string,
  expectedCount: number
): Array<{ headline: string; summary: string }> {
  const results: Array<{ headline: string; summary: string }> = [];

  // Split by "Nachricht" markers or numbered sections
  const sections = text.split(/(?:Nachricht\s*\d+:|---|\n\n(?=ÜBERSCHRIFT:))/i);

  for (const section of sections) {
    const headlineMatch = section.match(/ÜBERSCHRIFT:\s*(.+?)(?:\n|$)/i);
    const summaryMatch = section.match(/ZUSAMMENFASSUNG:\s*([\s\S]+?)(?:\n\n|$)/i);

    if (headlineMatch && summaryMatch) {
      results.push({
        headline: headlineMatch[1].trim(),
        summary: summaryMatch[1].trim(),
      });
    }
  }

  // Pad with empty entries if parsing failed
  while (results.length < expectedCount) {
    results.push({ headline: "", summary: "" });
  }

  return results.slice(0, expectedCount);
}

export async function simplifyNewsItems(items: RawNewsItem[]): Promise<NewsItem[]> {
  // Separate items that need simplification from those that don't
  const itemsToSimplify = items.filter(
    (item) => item.type !== "wetter" && item.originalTitle && item.originalSummary
  );

  const weatherItems = items.filter((item) => item.type === "wetter");

  // If nothing to simplify, return as-is
  if (itemsToSimplify.length === 0) {
    return items.map((item) => ({
      headline: item.headline,
      summary: item.summary,
      type: item.type,
    }));
  }

  // Check cache for each item
  const cachedResults: Map<number, NewsItem> = new Map();
  const uncachedItems: { index: number; item: RawNewsItem }[] = [];

  itemsToSimplify.forEach((item, index) => {
    const cacheKey = `simplified_${hashContent(item.originalTitle! + item.originalSummary!)}`;
    const cached = newsCache.get<NewsItem>(cacheKey, SIMPLIFIED_CACHE_TTL_MS);

    if (cached) {
      cachedResults.set(index, cached);
    } else {
      uncachedItems.push({ index, item });
    }
  });

  // If all items are cached, return immediately
  if (uncachedItems.length === 0) {
    const results: NewsItem[] = [];
    itemsToSimplify.forEach((_, index) => {
      results.push(cachedResults.get(index)!);
    });
    return [
      ...results,
      ...weatherItems.map((item) => ({
        headline: item.headline,
        summary: item.summary,
        type: item.type,
      })),
    ];
  }

  // Batch simplify uncached items with Claude
  const newsText = uncachedItems
    .map(
      (entry, i) =>
        `Nachricht ${i + 1}:\nÜberschrift: ${entry.item.originalTitle}\nZusammenfassung: ${entry.item.originalSummary}`
    )
    .join("\n\n---\n\n");

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${SIMPLIFICATION_PROMPT}\n\nHier sind die Nachrichten:\n\n${newsText}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    // Parse the response
    const simplifiedTexts = parseSimplifiedResponse(
      content.text,
      uncachedItems.length
    );

    // Cache and merge results
    const results: NewsItem[] = [];
    let simplifiedIndex = 0;

    itemsToSimplify.forEach((item, originalIndex) => {
      if (cachedResults.has(originalIndex)) {
        results.push(cachedResults.get(originalIndex)!);
      } else {
        const simplified = simplifiedTexts[simplifiedIndex];
        const newsItem: NewsItem = {
          headline: simplified?.headline || item.headline,
          summary: simplified?.summary || item.summary,
          type: item.type,
        };

        // Cache the result
        const cacheKey = `simplified_${hashContent(item.originalTitle! + item.originalSummary!)}`;
        newsCache.set(cacheKey, newsItem);

        results.push(newsItem);
        simplifiedIndex++;
      }
    });

    // Add weather items at the end
    return [
      ...results,
      ...weatherItems.map((item) => ({
        headline: item.headline,
        summary: item.summary,
        type: item.type,
      })),
    ];
  } catch (error) {
    console.error("Error simplifying news with Claude:", error);
    // Fallback: return original text
    return items.map((item) => ({
      headline: item.headline,
      summary: item.summary,
      type: item.type,
    }));
  }
}
