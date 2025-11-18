'use client';

import Footer from "@/components/footer/footer";
import Features from "@/components/landing-features/features";
import Hero from "@/components/landing_hero/hero";
import NavBar from "@/components/navbar/navbar";

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen w-screen animate-float-in"
      style={{
        background: "linear-gradient(180deg, #080609 20%, #2F1926 50%, #080609 90%)",
      }}
    >
      {/* Nav Bar */}
      <NavBar />

      <div className="flex flex-col items-center justify-center flex-grow">
        {/* Main content of your app goes here */}
        <Hero />    
        <Features />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

