"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Alle 16 Bundesländer mit Landeshauptstädten
const STAEDTE = [
  { id: "stuttgart", name: "Stuttgart", state: "Baden-Württemberg" },
  { id: "muenchen", name: "München", state: "Bayern" },
  { id: "berlin", name: "Berlin", state: "Berlin" },
  { id: "potsdam", name: "Potsdam", state: "Brandenburg" },
  { id: "bremen", name: "Bremen", state: "Bremen" },
  { id: "hamburg", name: "Hamburg", state: "Hamburg" },
  { id: "wiesbaden", name: "Wiesbaden", state: "Hessen" },
  { id: "schwerin", name: "Schwerin", state: "Mecklenburg-Vorpommern" },
  { id: "hannover", name: "Hannover", state: "Niedersachsen" },
  { id: "duesseldorf", name: "Düsseldorf", state: "Nordrhein-Westfalen" },
  { id: "mainz", name: "Mainz", state: "Rheinland-Pfalz" },
  { id: "saarbruecken", name: "Saarbrücken", state: "Saarland" },
  { id: "dresden", name: "Dresden", state: "Sachsen" },
  { id: "magdeburg", name: "Magdeburg", state: "Sachsen-Anhalt" },
  { id: "kiel", name: "Kiel", state: "Schleswig-Holstein" },
  { id: "erfurt", name: "Erfurt", state: "Thüringen" },
];

interface NewsItem {
  headline: string;
  summary: string;
  type: "welt" | "lokal" | "wetter";
}

type PlayerState = "idle" | "loading" | "playing" | "paused";

// Demo-Nachrichten für GitHub Pages (wo keine API verfügbar ist)
const DEMO_NACHRICHTEN: NewsItem[] = [
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

// Lokale Nachrichten pro Landeshauptstadt
const LOKALE_NACHRICHTEN: Record<string, { headline: string; summary: string }> =
  {
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

// Wetter-Daten
const WETTER_DATEN: Record<string, { temp: string; beschreibung: string }> = {
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

const CITY_NAMES: Record<string, string> = {
  stuttgart: "Stuttgart",
  muenchen: "München",
  berlin: "Berlin",
  potsdam: "Potsdam",
  bremen: "Bremen",
  hamburg: "Hamburg",
  wiesbaden: "Wiesbaden",
  schwerin: "Schwerin",
  hannover: "Hannover",
  duesseldorf: "Düsseldorf",
  mainz: "Mainz",
  saarbruecken: "Saarbrücken",
  dresden: "Dresden",
  magdeburg: "Magdeburg",
  kiel: "Kiel",
  erfurt: "Erfurt",
};

// Generiere Demo-Nachrichten für eine Stadt
function getDemoNews(city: string): NewsItem[] {
  const lokal = LOKALE_NACHRICHTEN[city] || LOKALE_NACHRICHTEN["berlin"];
  const wetter = WETTER_DATEN[city] || WETTER_DATEN["berlin"];
  const cityName = CITY_NAMES[city] || city;

  return [
    ...DEMO_NACHRICHTEN,
    {
      headline: lokal.headline,
      summary: lokal.summary,
      type: "lokal" as const,
    },
    {
      headline: `Das Wetter in ${cityName}`,
      summary: `Heute erwarten wir ${wetter.beschreibung}. Die Temperaturen liegen bei ${wetter.temp} Grad. Denken Sie an warme Kleidung, wenn Sie das Haus verlassen.`,
      type: "wetter" as const,
    },
  ];
}

export default function Home() {
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  const [selectedCity, setSelectedCity] = useState("berlin");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean | null>(null);

  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voicesLoadedRef = useRef(false);

  // Lade deutsche Stimme
  const getGermanVoice = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    // Priorität: Deutsche Stimme mit "female" oder "male" im Namen für natürlicheren Klang
    const germanVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("de") && v.name.toLowerCase().includes("female")
      ) ||
      voices.find(
        (v) => v.lang.startsWith("de") && v.name.toLowerCase().includes("male")
      ) ||
      voices.find((v) => v.lang.startsWith("de")) ||
      voices[0];
    return germanVoice;
  }, []);

  // Initialisiere Stimmen
  useEffect(() => {
    const loadVoices = () => {
      voicesLoadedRef.current = true;
    };

    if (window.speechSynthesis.getVoices().length > 0) {
      voicesLoadedRef.current = true;
    }

    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
      window.speechSynthesis.cancel();
    };
  }, []);

  // Spreche Nachricht
  const speakNews = useCallback(
    (newsItem: NewsItem, index: number, allNews: NewsItem[]) => {
      window.speechSynthesis.cancel();

      // Typ-Einleitung
      let intro = "";
      if (newsItem.type === "wetter") {
        intro = "Und nun zum Wetter: ";
      } else if (newsItem.type === "lokal") {
        intro = "Aus Ihrer Region: ";
      } else if (index === 0) {
        intro = "Guten Tag. Hier sind die Nachrichten. ";
      }

      const textToSpeak = `${intro}${newsItem.headline}. ${newsItem.summary}`;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.voice = getGermanVoice();
      utterance.rate = 0.85; // Etwas langsamer für bessere Verständlichkeit
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        if (index < allNews.length - 1) {
          // Kurze Pause zwischen Nachrichten
          setTimeout(() => {
            setCurrentNewsIndex(index + 1);
            speakNews(allNews[index + 1], index + 1, allNews);
          }, 1000);
        } else {
          // Ende erreicht
          const outro = new SpeechSynthesisUtterance(
            "Das waren die Nachrichten. Vielen Dank fürs Zuhören."
          );
          outro.voice = getGermanVoice();
          outro.rate = 0.85;
          outro.onend = () => {
            setPlayerState("idle");
            setCurrentNewsIndex(0);
          };
          window.speechSynthesis.speak(outro);
        }
      };

      utterance.onerror = (event) => {
        console.error("Speech error:", event);
        setError("Die Sprachausgabe wurde unterbrochen.");
        setPlayerState("idle");
      };

      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [getGermanVoice]
  );

  // Starte Nachrichten
  const startNews = async () => {
    setError(null);
    setPlayerState("loading");
    setCurrentNewsIndex(0);
    setIsLive(null);

    try {
      // Versuche zuerst die API zu erreichen
      const response = await fetch(`/api/news?city=${selectedCity}`);
      if (!response.ok) {
        throw new Error("API nicht erreichbar");
      }

      const data = await response.json();
      setNews(data.news);
      setIsLive(data.isLive ?? false);
      setPlayerState("playing");
      speakNews(data.news[0], 0, data.news);
    } catch {
      // Fallback auf Demo-Daten (z.B. auf GitHub Pages)
      console.log("API nicht verfügbar, verwende Demo-Daten");
      const demoNews = getDemoNews(selectedCity);
      setNews(demoNews);
      setIsLive(false);
      setPlayerState("playing");
      speakNews(demoNews[0], 0, demoNews);
    }
  };

  // Pause/Fortsetzen
  const togglePause = () => {
    if (playerState === "playing") {
      window.speechSynthesis.pause();
      setPlayerState("paused");
    } else if (playerState === "paused") {
      window.speechSynthesis.resume();
      setPlayerState("playing");
    }
  };

  // Stoppen
  const stopNews = () => {
    window.speechSynthesis.cancel();
    setPlayerState("idle");
    setCurrentNewsIndex(0);
    setNews([]);
  };

  // Nächste Nachricht
  const nextNews = () => {
    if (currentNewsIndex < news.length - 1) {
      window.speechSynthesis.cancel();
      const nextIndex = currentNewsIndex + 1;
      setCurrentNewsIndex(nextIndex);
      speakNews(news[nextIndex], nextIndex, news);
    }
  };

  // Vorherige Nachricht
  const previousNews = () => {
    if (currentNewsIndex > 0) {
      window.speechSynthesis.cancel();
      const prevIndex = currentNewsIndex - 1;
      setCurrentNewsIndex(prevIndex);
      speakNews(news[prevIndex], prevIndex, news);
    }
  };

  return (
    <main
      id="main"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        gap: "40px",
      }}
    >
      {/* Hauptüberschrift */}
      <header style={{ textAlign: "center", marginBottom: "20px" }}>
        <h1
          style={{
            fontSize: "clamp(32px, 6vw, 48px)",
            fontWeight: 700,
            color: "var(--primary)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Deine Nachrichten vom{" "}
          {new Date().toLocaleDateString("de-DE", {
            day: "numeric",
            month: "long",
          })}
        </h1>
        <p
          style={{
            fontSize: "clamp(20px, 4vw, 28px)",
            color: "#666",
            marginTop: "12px",
            fontWeight: 300,
          }}
        >
          Einfach anhören und entspannen
        </p>
      </header>

      {/* Hauptbereich - je nach Status */}
      {playerState === "idle" && (
        <>
          {/* Stadt-Auswahl */}
          <div style={{ textAlign: "center" }}>
            <label
              htmlFor="city-select"
              style={{
                display: "block",
                fontSize: "20px",
                marginBottom: "12px",
                color: "#666",
              }}
            >
              Ihre Stadt:
            </label>
            <select
              id="city-select"
              className="simple-select"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              {STAEDTE.map((stadt) => (
                <option key={stadt.id} value={stadt.id}>
                  {stadt.name} ({stadt.state})
                </option>
              ))}
            </select>
          </div>

          {/* Der Magic Button */}
          <button
            className="magic-button"
            onClick={startNews}
            aria-label="Nachrichten starten"
          >
            <span className="play-icon" aria-hidden="true">
              ▶
            </span>
            <span className="button-text">Starten</span>
          </button>

          {/* Fehlermeldung */}
          {error && (
            <div
              role="alert"
              style={{
                padding: "20px 32px",
                background: "#FFF5F5",
                border: "2px solid #E53935",
                borderRadius: "12px",
                color: "#C62828",
                fontSize: "20px",
                maxWidth: "500px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}
        </>
      )}

      {playerState === "loading" && (
        <div style={{ textAlign: "center" }} role="status" aria-live="polite">
          <div
            className="loading"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "var(--primary)",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{ fontSize: "48px", color: "white" }}
              aria-hidden="true"
            >
              ⏳
            </span>
          </div>
          <p style={{ fontSize: "28px", color: "var(--foreground)" }}>
            Nachrichten werden geladen...
          </p>
          <p style={{ fontSize: "20px", color: "#666", marginTop: "8px" }}>
            Einen Moment bitte
          </p>
        </div>
      )}

      {(playerState === "playing" || playerState === "paused") && (
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          {/* Live/Demo Badge */}
          {isLive !== null && (
            <div style={{ textAlign: "center" }}>
              <span className={isLive ? "live-badge" : "demo-badge"}>
                {isLive ? "Live" : "Demo"}
              </span>
            </div>
          )}

          {/* Aktuelle Nachricht */}
          {news[currentNewsIndex] && (
            <article className="news-card" aria-live="polite">
              <div
                style={{
                  fontSize: "16px",
                  color: "var(--accent)",
                  fontWeight: 600,
                  marginBottom: "8px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                {news[currentNewsIndex].type === "wetter"
                  ? "Wetter"
                  : news[currentNewsIndex].type === "lokal"
                    ? "Aus Ihrer Region"
                    : "Nachrichten"}
              </div>
              <h2>{news[currentNewsIndex].headline}</h2>
              <p>{news[currentNewsIndex].summary}</p>
            </article>
          )}

          {/* Fortschrittsanzeige */}
          <div style={{ textAlign: "center" }}>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width: `${((currentNewsIndex + 1) / news.length) * 100}%`,
                }}
              />
            </div>
            <p className="status-text" style={{ marginTop: "12px" }}>
              Nachricht {currentNewsIndex + 1} von {news.length}
            </p>
          </div>

          {/* Player-Steuerung */}
          <div className="player-controls">
            <button
              className="control-button control-button-secondary"
              onClick={previousNews}
              disabled={currentNewsIndex === 0}
              aria-label="Vorherige Nachricht"
              style={{ opacity: currentNewsIndex === 0 ? 0.5 : 1 }}
            >
              ⏮
            </button>

            <button
              className="control-button control-button-primary"
              onClick={togglePause}
              aria-label={playerState === "playing" ? "Pause" : "Fortsetzen"}
              style={{ width: "100px", height: "100px", fontSize: "40px" }}
            >
              {playerState === "playing" ? "⏸" : "▶"}
            </button>

            <button
              className="control-button control-button-secondary"
              onClick={nextNews}
              disabled={currentNewsIndex === news.length - 1}
              aria-label="Nächste Nachricht"
              style={{
                opacity: currentNewsIndex === news.length - 1 ? 0.5 : 1,
              }}
            >
              ⏭
            </button>
          </div>

          {/* Stoppen-Button */}
          <button
            className="big-button big-button-secondary"
            onClick={stopNews}
            style={{
              alignSelf: "center",
              fontSize: "24px",
              padding: "16px 40px",
            }}
          >
            Beenden
          </button>
        </div>
      )}

      {/* Footer mit Datum */}
      <footer
        style={{
          marginTop: "auto",
          paddingTop: "40px",
          textAlign: "center",
          color: "#999",
          fontSize: "18px",
        }}
      >
        <time dateTime={new Date().toISOString().split("T")[0]}>
          {new Date().toLocaleDateString("de-DE", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </time>
      </footer>
    </main>
  );
}
