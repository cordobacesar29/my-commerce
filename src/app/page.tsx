import CTABanner from '@/components/CTABanner';
import HeroSection from '@/components/HeroSection';
import HowItWorks from '@/components/HowItWorks';
import { Metadata } from 'next';

export const metadata: Metadata = {
title: "Ramón Store - Home",
description:
  "Describí tu idea, nuestra IA la convierte en diseño único. Visualizalo en 3D y pedí tu remera personalizada. Envío en 48hs a toda Argentina.",
keywords: "remeras personalizadas, diseño con IA, remeras 3D, Argentina",
};

export const HomePage = () => {
  return (
    <div className="relative min-h-screen text-white">
      <HeroSection />
      <HowItWorks />
      <CTABanner />
    </div>
  )
}

export default HomePage;