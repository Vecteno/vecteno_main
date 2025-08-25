import { Inter, Roboto_Mono } from "next/font/google";
import "../globals.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";
import LoadingBar from "./components/LoadingBar";
import { Suspense } from "react"; // <-- add

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export default function UsersLayout({ children }) {
  return (
    <div className={`${inter.variable} ${robotoMono.variable}`}>
      <Navbar className='z-75'/>
      <LoadingBar />
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<div>Loading...</div>}> 
        {children}
      </Suspense>
      <Footer />
    </div>
  );
}
