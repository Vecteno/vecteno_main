// /app/layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./components/Providers";
import PreloaderDemo from "./components/PreloaderDemo";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Vecteno - Graphic Resources",
  description: "Download high-quality graphic resources, templates, and designs",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <Providers>
          <PreloaderDemo />
          <Toaster position="top-center" reverseOrder={false} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
