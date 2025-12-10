import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nachrichten zum Anhören",
  description: "Aktuelle Nachrichten einfach vorgelesen - für alle, die es ruhig und klar mögen.",
  keywords: ["Nachrichten", "Vorlesen", "Senioren", "Barrierefreiheit", "Audio"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>
        <a href="#main" className="skip-link">
          Zum Inhalt springen
        </a>
        {children}
      </body>
    </html>
  );
}
