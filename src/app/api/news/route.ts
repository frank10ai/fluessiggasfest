import { NextRequest, NextResponse } from "next/server";
import Parser from "rss-parser";
import Anthropic from "@anthropic-ai/sdk";

const parser = new Parser();

// RSS-Feeds für deutsche Nachrichten
const NEWS_FEEDS = [
  "https://www.tagesschau.de/xml/rss2/",
  "https://rss.sueddeutsche.de/rss/Topthemen",
];

// Wetter-Daten (in einer echten App würde man eine Wetter-API nutzen)
const WETTER_DATEN: Record<string, { temp: string; beschreibung: string }> = {
  berlin: { temp: "7", beschreibung: "bewölkt mit gelegentlichen Aufhellungen" },
  hamburg: { temp: "9", beschreibung: "leichter Regen" },
  muenchen: { temp: "4", beschreibung: "sonnig aber kühl" },
  koeln: { temp: "10", beschreibung: "bedeckt" },
  frankfurt: { temp: "8", beschreibung: "neblig am Morgen, später freundlich" },
  stuttgart: { temp: "6", beschreibung: "wechselhaft" },
  duesseldorf: { temp: "9", beschreibung: "leicht bewölkt" },
  leipzig: { temp: "5", beschreibung: "trocken und kühl" },
  dortmund: { temp: "8", beschreibung: "bedeckt" },
  dresden: { temp: "4", beschreibung: "sonnig" },
};

// Lokale positive Nachrichten (in einer echten App aus lokalen RSS-Feeds)
const LOKALE_NACHRICHTEN: Record<string, { headline: string; summary: string }> = {
  berlin: {
    headline: "Neuer Spielplatz im Volkspark eröffnet",
    summary: "Die Stadt hat einen barrierefreien Spielplatz eingeweiht, der Kindern und Großeltern gemeinsames Spielen ermöglicht.",
  },
  hamburg: {
    headline: "Ehrenamtliche Helfer räumen Elbstrand auf",
    summary: "Über zweihundert Freiwillige haben am Wochenende den Strand gereinigt. Die Aktion wird von vielen Bürgern gelobt.",
  },
  muenchen: {
    headline: "Münchner Bäckerei verschenkt Brot an Bedürftige",
    summary: "Eine traditionelle Bäckerei in Schwabing gibt täglich Brot an Menschen weiter, die wenig Geld haben.",
  },
  koeln: {
    headline: "Kölner Dom erhält neue Glocken",
    summary: "Nach aufwendiger Restaurierung läuten die historischen Glocken wieder in voller Pracht.",
  },
  frankfurt: {
    headline: "Stadtbibliothek startet Vorlesestunden für Senioren",
    summary: "Jeden Donnerstag lesen junge Freiwillige älteren Menschen aus Büchern vor. Das Angebot ist kostenlos.",
  },
  stuttgart: {
    headline: "Neuer Seniorentreff im Stadtteil eröffnet",
    summary: "Der gemütliche Treffpunkt bietet Kaffee, Kuchen und Gesellschaft für alle, die Gesellschaft suchen.",
  },
  duesseldorf: {
    headline: "Nachbarschaftshilfe verbindet Jung und Alt",
    summary: "Ein neues Projekt bringt Schüler und Senioren zusammen. Sie helfen sich gegenseitig im Alltag.",
  },
  leipzig: {
    headline: "Historischer Marktplatz erstrahlt in neuem Glanz",
    summary: "Nach der Renovierung lädt der Platz wieder zum Verweilen ein. Neue Bänke wurden aufgestellt.",
  },
  dortmund: {
    headline: "Tierpark freut sich über Nachwuchs",
    summary: "Im städtischen Zoo sind zwei Rehkitze geboren worden. Besucher können sie ab nächster Woche sehen.",
  },
  dresden: {
    headline: "Elbe-Radweg wird ausgebaut",
    summary: "Der beliebte Radweg bekommt neue Rastplätze mit Bänken und Trinkwasserbrunnen.",
  },
};

interface NewsItem {
  headline: string;
  summary: string;
  type: "welt" | "lokal" | "wetter";
}

async function fetchRSSNews(): Promise<{ title: string; content: string }[]> {
  const allItems: { title: string; content: string }[] = [];

  for (const feedUrl of NEWS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      const items = feed.items.slice(0, 3).map((item) => ({
        title: item.title || "Ohne Titel",
        content: item.contentSnippet || item.content || item.description || "",
      }));
      allItems.push(...items);
    } catch (error) {
      console.error(`Fehler beim Laden von ${feedUrl}:`, error);
    }
  }

  return allItems.slice(0, 5); // Maximal 5 Nachrichten
}

async function simplifyNewsWithClaude(
  newsItems: { title: string; content: string }[]
): Promise<NewsItem[]> {
  // Prüfe ob API-Key vorhanden
  if (!process.env.ANTHROPIC_API_KEY) {
    // Fallback: Verwende die Nachrichten ohne KI-Vereinfachung
    return newsItems.map((item) => ({
      headline: item.title,
      summary: item.content.slice(0, 200) + (item.content.length > 200 ? "..." : ""),
      type: "welt" as const,
    }));
  }

  const client = new Anthropic();

  const newsText = newsItems
    .map((item, i) => `Nachricht ${i + 1}:\nTitel: ${item.title}\nInhalt: ${item.content}`)
    .join("\n\n");

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Du bist ein freundlicher Nachrichtensprecher im Stil der klassischen Tagesschau aus den 1980er Jahren.

Fasse die folgenden ${newsItems.length} Nachrichten zusammen. Für jede Nachricht:
- Schreibe eine kurze, klare Überschrift (maximal 10 Wörter)
- Schreibe eine Zusammenfassung in 2-3 einfachen Sätzen
- Verwende einfaches, klares Deutsch
- Vermeide Anglizismen und Fachbegriffe
- Schreibe ruhig und sachlich, nicht sensationell

Antworte im folgenden JSON-Format:
[
  {"headline": "Überschrift hier", "summary": "Zusammenfassung hier"},
  ...
]

Die Nachrichten:

${newsText}`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    // Extrahiere JSON aus der Antwort
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as { headline: string; summary: string }[];
      return parsed.map((item) => ({
        ...item,
        type: "welt" as const,
      }));
    }
  } catch (error) {
    console.error("Claude API Fehler:", error);
  }

  // Fallback bei Fehler
  return newsItems.map((item) => ({
    headline: item.title,
    summary: item.content.slice(0, 200) + (item.content.length > 200 ? "..." : ""),
    type: "welt" as const,
  }));
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get("city") || "berlin";

  try {
    // 1. Hole RSS-Nachrichten
    const rssNews = await fetchRSSNews();

    // 2. Vereinfache mit Claude
    const simplifiedNews = await simplifyNewsWithClaude(rssNews);

    // 3. Füge lokale Nachricht hinzu
    const lokalNews = LOKALE_NACHRICHTEN[city] || LOKALE_NACHRICHTEN["berlin"];
    const lokalItem: NewsItem = {
      ...lokalNews,
      type: "lokal",
    };

    // 4. Füge Wetter hinzu
    const wetterData = WETTER_DATEN[city] || WETTER_DATEN["berlin"];
    const cityNames: Record<string, string> = {
      berlin: "Berlin",
      hamburg: "Hamburg",
      muenchen: "München",
      koeln: "Köln",
      frankfurt: "Frankfurt",
      stuttgart: "Stuttgart",
      duesseldorf: "Düsseldorf",
      leipzig: "Leipzig",
      dortmund: "Dortmund",
      dresden: "Dresden",
    };
    const wetterItem: NewsItem = {
      headline: `Das Wetter in ${cityNames[city] || city}`,
      summary: `Heute erwarten wir ${wetterData.beschreibung}. Die Temperaturen liegen bei ${wetterData.temp} Grad. Denken Sie an warme Kleidung, wenn Sie das Haus verlassen.`,
      type: "wetter",
    };

    // 5. Kombiniere alle Nachrichten
    // Reihenfolge: 2-3 Weltnachrichten, lokale Nachricht, restliche Weltnachrichten, Wetter
    const weltNachrichten = simplifiedNews.slice(0, 3);
    const restNachrichten = simplifiedNews.slice(3);

    const allNews: NewsItem[] = [
      ...weltNachrichten,
      lokalItem,
      ...restNachrichten,
      wetterItem,
    ];

    return NextResponse.json({
      news: allNews,
      city: city,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("API Fehler:", error);

    // Fallback-Nachrichten wenn alles fehlschlägt
    const fallbackNews: NewsItem[] = [
      {
        headline: "Nachrichten werden vorbereitet",
        summary: "Wir bereiten gerade die aktuellen Nachrichten für Sie vor. Bitte versuchen Sie es in wenigen Augenblicken erneut.",
        type: "welt",
      },
      {
        headline: `Das Wetter in Ihrer Stadt`,
        summary: "Heute wird es herbstlich mit Temperaturen um die acht Grad. Ziehen Sie sich warm an.",
        type: "wetter",
      },
    ];

    return NextResponse.json({
      news: fallbackNews,
      city: city,
      generatedAt: new Date().toISOString(),
    });
  }
}
