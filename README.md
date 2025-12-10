# Nachrichten zum Anhören

Eine barrierefreie Nachrichten-Webseite für ältere Menschen. Einfach zuhören, ohne komplizierte Bedienung.

## Vision: "Die Digital Vergessenen"

Diese Anwendung wurde für Menschen entwickelt, die:
- Schwierigkeiten beim Lesen kleiner Texte haben
- Von komplexen Webseiten überfordert sind
- Das vertraute Gefühl einer Radiosendung oder der "guten alten Tagesschau" vermissen
- Am gesellschaftlichen Leben teilhaben möchten

## Features

### Der "Ein-Knopf"-Zugang
Ein einziger, riesiger Play-Button startet die Nachrichten. Keine verwirrende Navigation, keine Cookie-Banner.

### KI-gestützte Vereinfachung
Nachrichten werden automatisch in einfachem, ruhigem Deutsch zusammengefasst - im Stil eines freundlichen Nachrichtensprechers aus den 80er Jahren.

### Lokaler Bezug
Neben Weltnachrichten hören Sie immer auch eine positive Nachricht aus Ihrer Region und den lokalen Wetterbericht.

### Natürliche Sprachausgabe
Die Nachrichten werden mit einer klaren, verständlichen Stimme vorgelesen. Die Geschwindigkeit ist optimal für gutes Verstehen eingestellt.

## Design-Prinzipien

- **Warme Farben**: Creme-Hintergrund (#FDFBF7) statt blendendem Weiß
- **Große Schrift**: Mindestens 24px für beste Lesbarkeit
- **Riesige Buttons**: Mindestens 80x80px mit 3D-Effekt
- **Kein Scrollen**: Alles Wichtige ist sofort sichtbar

## Schnellstart

```bash
# Abhängigkeiten installieren
npm install

# Umgebungsvariablen einrichten
cp .env.example .env.local
# Fügen Sie Ihren ANTHROPIC_API_KEY ein

# Entwicklungsserver starten
npm run dev
```

Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

## Umgebungsvariablen

| Variable | Beschreibung |
|----------|--------------|
| `ANTHROPIC_API_KEY` | API-Key für die KI-Vereinfachung der Nachrichten |

## Technologie

- **Next.js 15** - React-Framework
- **TypeScript** - Typsicherheit
- **Tailwind CSS** - Styling
- **Claude API** - KI-Vereinfachung
- **Web Speech API** - Text-to-Speech im Browser

## Lizenz

MIT
