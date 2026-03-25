"use client";
import { useProtectedNavigation } from "@/hooks/useProtectedNavigation";
import Icon from "./ui/AppIcon";

export const CTABannerButton = () => {
  const { navigateTo } = useProtectedNavigation();
  return (
    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
      <button
        onClick={() => navigateTo("/design-studio")}
        className="group relative flex items-center gap-2 bg-[#C8A96E] hover:bg-[#B6965D] text-black font-bold py-4 px-10 transition-all duration-300"
      >
        <span className="uppercase tracking-wider text-sm">
          Crear mi diseño ahora
        </span>
        <Icon name="SparklesIcon" size={18} variant="solid" />
      </button>
    </div>
  );
};
