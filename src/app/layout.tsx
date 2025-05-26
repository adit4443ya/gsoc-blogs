import { ThemeProvider } from "@/lib/ThemeContext";
import "./globals.css";

export const metadata = {
  title: {
    default: "GSOC Blog",
    template: "%s | GSOC Blog",
  },
  description: "Documenting my professional journey through Google Summer of Code with weekly updates and insights.",
  openGraph: {
    title: "GSOC Blog",
    description: "Documenting my professional journey through Google Summer of Code with weekly updates and insights.",
    url: "https://adit4443ya.github.io/gsoc-blogs/",
    siteName: "GSOC Blog",
    images: [
      {
        url: "https://adit4443ya.github.io/gsoc-blogs/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GSOC Blog",
    description: "Documenting my professional journey through Google Summer of Code with weekly updates and insights.",
    images: ["https://adit4443ya.github.io/gsoc-blogs/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Roboto:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
