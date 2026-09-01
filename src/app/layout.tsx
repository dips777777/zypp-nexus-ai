import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zypp Nexus AI - EV Fleet Operating System",
  description: "AI-powered EV fleet operating system for managing Zypp Electric delivery hubs across Delhi NCR",
};

export const viewport: Viewport = {
  themeColor: "#f9fafb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  userScalable: false,
};

const forceLightMode = `
(() => {
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = 'light';
  document.documentElement.style.backgroundColor = '#f9fafb';
  document.body.style.backgroundColor = '#f9fafb';
})();
`;

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light" />
        <meta name="theme-color" content="#f9fafb" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect width='1' height='1' fill='transparent'/%3E%3C/svg%3E" />
        <script dangerouslySetInnerHTML={{ __html: forceLightMode }} />
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 sm:bg-gray-50 lg:bg-gray-50" style={{ backgroundColor: '#f9fafb' }}>
        {children}
      </body>
    </html>
  );
}
