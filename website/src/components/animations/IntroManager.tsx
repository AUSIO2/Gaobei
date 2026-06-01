"use client";
import { useState } from "react";
import IntroAnimation from "./IntroAnimation";
import Navbar from "../ui/Navbar";
import Footer from "../sections/Footer";

export default function IntroManager({ children }: { children: React.ReactNode }) {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <>
      {showIntro && <IntroAnimation key="intro" onComplete={() => setShowIntro(false)} />}
      {!showIntro && <Navbar />}
      {children}
      {!showIntro && <Footer />}
    </>
  );
}

