"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// Deutsche Städte für lokale Nachrichten
const STAEDTE = [
  { id: "berlin", name: "Berlin" },
  { id: "hamburg", name: "Hamburg" },
  { id: "muenchen", name: "München" },
  { id: "koeln", name: "Köln" },
  { id: "frankfurt", name: "Frankfurt" },
  { id: "stuttgart", name: "Stuttgart" },
  { id: "duesseldorf", name: "Düsseldorf" },
  { id: "leipzig", name: "Leipzig" },
  { id: "dortmund", name: "Dortmund" },
  { id: "dresden", name: "Dresden" },
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

// Lokale Nachrichten pro Stadt
const LOKALE_NACHRICHTEN: Record<string, { headline: string; summary: string }> =
  {
    berlin: {
      headline: "Neuer Spielplatz im Volkspark eröffnet",
      summary:
        "Die Stadt hat einen barrierefreien Spielplatz eingeweiht, der Kindern und Großeltern gemeinsames Spielen ermöglicht.",
    },
    hamburg: {
      headline: "Ehrenamtliche Helfer räumen Elbstrand auf",
      summary:
        "Über zweihundert Freiwillige haben am Wochenende den Strand gereinigt. Die Aktion wird von vielen Bürgern gelobt.",
    },
    muenchen: {
      headline: "Münchner Bäckerei verschenkt Brot an Bedürftige",
      summary:
        "Eine traditionelle Bäckerei in Schwabing gibt täglich Brot an Menschen weiter, die wenig Geld haben.",
    },
    koeln: {
      headline: "Kölner Dom erhält neue Glocken",
      summary:
        "Nach aufwendiger Restaurierung läuten die historischen Glocken wieder in voller Pracht.",
    },
    frankfurt: {
      headline: "Stadtbibliothek startet Vorlesestunden für Senioren",
      summary:
        "Jeden Donnerstag lesen junge Freiwillige älteren Menschen aus Büchern vor. Das Angebot ist kostenlos.",
    },
    stuttgart: {
      headline: "Neuer Seniorentreff im Stadtteil eröffnet",
      summary:
        "Der gemütliche Treffpunkt bietet Kaffee, Kuchen und Gesellschaft für alle, die Gesellschaft suchen.",
    },
    duesseldorf: {
      headline: "Nachbarschaftshilfe verbindet Jung und Alt",
      summary:
        "Ein neues Projekt bringt Schüler und Senioren zusammen. Sie helfen sich gegenseitig im Alltag.",
    },
    leipzig: {
      headline: "Historischer Marktplatz erstrahlt in neuem Glanz",
      summary:
        "Nach der Renovierung lädt der Platz wieder zum Verweilen ein. Neue Bänke wurden aufgestellt.",
    },
    dortmund: {
      headline: "Tierpark freut sich über Nachwuchs",
      summary:
        "Im städtischen Zoo sind zwei Rehkitze geboren worden. Besucher können sie ab nächster Woche sehen.",
    },
    dresden: {
      headline: "Elbe-Radweg wird ausgebaut",
      summary:
        "Der beliebte Radweg bekommt neue Rastplätze mit Bänken und Trinkwasserbrunnen.",
    },
  };

// Wetter-Daten
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

const CITY_NAMES: Record<string, string> = {
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

    try {
      // Versuche zuerst die API zu erreichen
      const response = await fetch(`/api/news?city=${selectedCity}`);
      if (!response.ok) {
        throw new Error("API nicht erreichbar");
      }

      const data = await response.json();
      setNews(data.news);
      setPlayerState("playing");
      speakNews(data.news[0], 0, data.news);
    } catch {
      // Fallback auf Demo-Daten (z.B. auf GitHub Pages)
      console.log("API nicht verfügbar, verwende Demo-Daten");
      const demoNews = getDemoNews(selectedCity);
      setNews(demoNews);
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
            fontSize: "clamp(36px, 8vw, 56px)",
            fontWeight: 700,
            color: "var(--primary)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Nachrichten
        </h1>
        <p
          style={{
            fontSize: "clamp(20px, 4vw, 28px)",
            color: "#666",
            marginTop: "12px",
            fontWeight: 300,
          }}
        >
          Einfach zuhören
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
                  {stadt.name}
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
