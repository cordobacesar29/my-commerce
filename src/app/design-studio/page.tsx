import type { Metadata } from "next";
import DesignStudioClient from "./components/DesignStudioClient";


export const metadata: Metadata = {
  title: "Ramón Store - Estudio de Diseño",
  description:
    "Diseñá tu remera con inteligencia artificial. Describí tu idea, visualizala en 3D y pedila. Envío en 48hs a toda Argentina.",
};

export default function DesignStudioPage() {
  return <DesignStudioClient />;
}