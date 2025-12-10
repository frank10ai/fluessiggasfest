import { NextRequest, NextResponse } from "next/server";
import { NewsItem, NewsApiResponse, RawNewsItem } from "@/lib/types";
import { CITY_CONFIG } from "@/lib/constants";
import { fetchWorldNews, fetchRegionalNews } from "@/lib/tagesschau";
import { fetchWeather } from "@/lib/weather";
import { simplifyNewsItems } from "@/lib/claude";

// Demo fallback data (same structure as in page.tsx)
const DEMO_NEWS: NewsItem[] = [
  {
    headline: "Bundesregierung beschließt neue Maßnahmen",
    summary:
      "Die Bundesregierung hat heute in Berlin wichtige Beschlüsse gefasst. Die neuen Regelungen sollen das Leben der Bürgerinnen und Bürger verbessern und treten zum Jahreswechsel in Kraft.",
    type: "welt",
  },
  {
    headline: "Wirtschaft zeigt sich zuversichtlich",
    summary:
      "Deutsche Unternehmen blicken optimistisch in die Zukunft. Besonders der Mittelstand rechnet mit guten Geschäften im kommenden Jahr.",
    type: "welt",
  },
  {
    headline: "Kulturveranstaltungen ziehen Besucher an",
    summary:
      "Museen und Theater melden steigende Besucherzahlen. Die Menschen genießen wieder das gemeinsame Erleben von Kunst und Kultur.",
    type: "welt",
  },
];

const DEMO_LOCAL: Record<string, { headline: string; summary: string }> = {
  stuttgart: {
    headline: "Neuer Seniorentreff im Stadtteil eröffnet",
    summary:
      "Der gemütliche Treffpunkt bietet Kaffee, Kuchen und Gesellschaft für alle, die Gesellschaft suchen.",
  },
  muenchen: {
    headline: "Münchner Bäckerei verschenkt Brot an Bedürftige",
    summary:
      "Eine traditionelle Bäckerei in Schwabing gibt täglich Brot an Menschen weiter, die wenig Geld haben.",
  },
  berlin: {
    headline: "Neuer Spielplatz im Volkspark eröffnet",
    summary:
      "Die Stadt hat einen barrierefreien Spielplatz eingeweiht, der Kindern und Großeltern gemeinsames Spielen ermöglicht.",
  },
  potsdam: {
    headline: "Schloss Sanssouci begeistert Besucher",
    summary:
      "Das historische Schloss zieht wieder viele Gäste an. Die Parkanlage lädt zu gemütlichen Spaziergängen ein.",
  },
  bremen: {
    headline: "Bremer Stadtmusikanten bekommen neuen Anstrich",
    summary:
      "Die berühmte Bronzestatue wurde gereinigt und erstrahlt in neuem Glanz. Ein beliebtes Fotomotiv für Touristen.",
  },
  hamburg: {
    headline: "Ehrenamtliche Helfer räumen Elbstrand auf",
    summary:
      "Über zweihundert Freiwillige haben am Wochenende den Strand gereinigt. Die Aktion wird von vielen Bürgern gelobt.",
  },
  wiesbaden: {
    headline: "Kurpark lädt zu Frühlingskonzerten ein",
    summary:
      "Im historischen Kurpark finden wieder kostenlose Konzerte statt. Die Veranstaltungen sind für alle Altersgruppen geeignet.",
  },
  schwerin: {
    headline: "Schweriner Schloss öffnet neue Ausstellung",
    summary:
      "Das Märchenschloss zeigt historische Gemälde aus drei Jahrhunderten. Der Eintritt ist für Senioren ermäßigt.",
  },
  hannover: {
    headline: "Herrenhäuser Gärten laden zum Verweilen ein",
    summary:
      "Die barocken Gärten bieten Ruhe und Erholung. Neue Sitzbänke wurden im Schatten aufgestellt.",
  },
  duesseldorf: {
    headline: "Nachbarschaftshilfe verbindet Jung und Alt",
    summary:
      "Ein neues Projekt bringt Schüler und Senioren zusammen. Sie helfen sich gegenseitig im Alltag.",
  },
  mainz: {
    headline: "Gutenberg-Museum zeigt seltene Drucke",
    summary:
      "Das Museum präsentiert wertvolle historische Bücher. Führungen werden auch in einfacher Sprache angeboten.",
  },
  saarbruecken: {
    headline: "Deutsch-Französischer Garten blüht auf",
    summary:
      "Der grenzüberschreitende Park zeigt sich in voller Blütenpracht. Ein Ort der Begegnung für Jung und Alt.",
  },
  dresden: {
    headline: "Elbe-Radweg wird ausgebaut",
    summary:
      "Der beliebte Radweg bekommt neue Rastplätze mit Bänken und Trinkwasserbrunnen.",
  },
  magdeburg: {
    headline: "Elbauenpark startet Seniorenprogramm",
    summary:
      "Der Park bietet neue Bewegungskurse für ältere Menschen an. Die Teilnahme ist kostenlos.",
  },
  kiel: {
    headline: "Kieler Förde lädt zum Flanieren ein",
    summary:
      "Die neue Uferpromenade bietet einen schönen Blick auf die Schiffe. Viele Bänke laden zum Ausruhen ein.",
  },
  erfurt: {
    headline: "Krämerbrücke feiert Jubiläum",
    summary:
      "Die älteste bebaute Brücke Deutschlands begeht ihr Stadtfest. Handwerker zeigen traditionelles Kunsthandwerk.",
  },
};

const DEMO_WEATHER: Record<string, { temp: string; beschreibung: string }> = {
  stuttgart: { temp: "6", beschreibung: "wechselhaft" },
  muenchen: { temp: "4", beschreibung: "sonnig aber kühl" },
  berlin: { temp: "7", beschreibung: "bewölkt mit gelegentlichen Aufhellungen" },
  potsdam: { temp: "7", beschreibung: "leicht bewölkt" },
  bremen: { temp: "8", beschreibung: "windig mit Schauern" },
  hamburg: { temp: "9", beschreibung: "leichter Regen" },
  wiesbaden: { temp: "9", beschreibung: "mild und freundlich" },
  schwerin: { temp: "6", beschreibung: "wechselhaft" },
  hannover: { temp: "7", beschreibung: "bedeckt" },
  duesseldorf: { temp: "9", beschreibung: "leicht bewölkt" },
  mainz: { temp: "10", beschreibung: "sonnig" },
  saarbruecken: { temp: "8", beschreibung: "teilweise bewölkt" },
  dresden: { temp: "4", beschreibung: "sonnig" },
  magdeburg: { temp: "5", beschreibung: "trocken und kühl" },
  kiel: { temp: "7", beschreibung: "frisch mit Böen" },
  erfurt: { temp: "5", beschreibung: "neblig am Morgen" },
};

function getDemoNews(city: string): NewsItem[] {
  const cityConfig = CITY_CONFIG[city];
  const cityName = cityConfig?.name || city;
  const local = DEMO_LOCAL[city] || DEMO_LOCAL.berlin;
  const weather = DEMO_WEATHER[city] || DEMO_WEATHER.berlin;

  return [
    ...DEMO_NEWS,
    {
      headline: local.headline,
      summary: local.summary,
      type: "lokal",
    },
    {
      headline: `Das Wetter in ${cityName}`,
      summary: `Heute erwarten wir ${weather.beschreibung}. Die Temperaturen liegen bei ${weather.temp} Grad. Denken Sie an warme Kleidung, wenn Sie das Haus verlassen.`,
      type: "wetter",
    },
  ];
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<NewsApiResponse>> {
  const searchParams = request.nextUrl.searchParams;
  const city = searchParams.get("city") || "berlin";

  // Validate city
  const cityConfig = CITY_CONFIG[city];
  if (!cityConfig) {
    // Fallback to Berlin if unknown city
    return NextResponse.json({ news: getDemoNews("berlin"), isLive: false });
  }

  try {
    // Fetch all data in parallel
    const [worldNewsResult, regionalNewsResult, weatherResult] =
      await Promise.allSettled([
        fetchWorldNews(),
        fetchRegionalNews(cityConfig.regionId),
        fetchWeather(cityConfig.name, cityConfig.latitude, cityConfig.longitude),
      ]);

    const rawItems: RawNewsItem[] = [];
    let isLive = true;

    // Process world news
    if (worldNewsResult.status === "fulfilled") {
      rawItems.push(...worldNewsResult.value);
    } else {
      console.error("World news fetch failed:", worldNewsResult.reason);
      isLive = false;
      // Add demo world news as fallback
      rawItems.push(
        ...DEMO_NEWS.map((n) => ({
          ...n,
          originalTitle: n.headline,
          originalSummary: n.summary,
        }))
      );
    }

    // Process regional news
    if (regionalNewsResult.status === "fulfilled" && regionalNewsResult.value) {
      rawItems.push(regionalNewsResult.value);
    } else {
      console.error("Regional news fetch failed or empty");
      const local = DEMO_LOCAL[city] || DEMO_LOCAL.berlin;
      rawItems.push({
        headline: local.headline,
        summary: local.summary,
        type: "lokal",
        originalTitle: local.headline,
        originalSummary: local.summary,
      });
    }

    // Process weather
    if (weatherResult.status === "fulfilled") {
      rawItems.push(weatherResult.value);
    } else {
      console.error("Weather fetch failed:", weatherResult.reason);
      const weather = DEMO_WEATHER[city] || DEMO_WEATHER.berlin;
      rawItems.push({
        headline: `Das Wetter in ${cityConfig.name}`,
        summary: `Heute erwarten wir ${weather.beschreibung}. Die Temperaturen liegen bei ${weather.temp} Grad.`,
        type: "wetter",
      });
    }

    // Simplify news text with Claude
    const simplifiedNews = await simplifyNewsItems(rawItems);

    return NextResponse.json({ news: simplifiedNews, isLive });
  } catch (error) {
    console.error("Error in news API:", error);
    // Complete fallback to demo data
    return NextResponse.json({ news: getDemoNews(city), isLive: false });
  }
}
