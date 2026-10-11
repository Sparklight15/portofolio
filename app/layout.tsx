import type { Metadata } from "next";
import { Poppins, Instrument_Serif, Caveat } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-caveat",
  display: "swap",
  fallback: ["Comic Sans MS", "cursive"],
});

export const metadata: Metadata = {
  title: "Portofolio",
  description: "Portofolio pribadi",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`${poppins.variable} ${instrumentSerif.variable} ${caveat.variable}`}
    >
      <body className="bg-background font-sans text-body text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}