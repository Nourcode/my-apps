import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Helio",
  description: "Your personal app hub",
  other: {
    // Tells Dark Reader the site manages its own dark mode — prevents it from
    // injecting data-darkreader-* attributes that cause React hydration mismatches
    "darkreader-lock": "",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={geist.className} suppressHydrationWarning>
      <body>
        {/* Adds .dark to <html> before React mounts so CSS sets the correct background immediately */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}` }} />
        {children}
      </body>
    </html>
  );
}
