"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSnapshot } from "valtio";
import { useState } from "react";
import Canvas from "../canvas";
import state from "../store";
import LoginForm from "@/components/LoginForm";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

const backdropVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.6 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.4 },
  },
};

const containerVariants = {
  hidden: { opacity: 0, y: -80 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.15,
    },
  },
  exit: {
    scale: 0.85,
    opacity: 0,
    transition: { duration: 0.4 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 12,
    },
  },
};

// const shakeAnimation = {
//   x: [0, -10, 10, -8, 8, -5, 5, 0],
//   transition: { duration: 0.6 },
// };
const Home = () => {
  const snap = useSnapshot(state);

  return (
    <main className="relative w-full h-screen overflow-hidden">
      <AnimatePresence>
        {snap.intro && (
          <motion.section
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-fit xl:h-full flex xl:justify-between justify-start items-start flex-col xl:py-8 xl:px-36 sm:p-8 p-6 max-xl:gap-7 absolute z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 xl:justify-center justify-start flex flex-col gap-8"
            >
              <h2 className="text-4xl font-black text-white">Bienvenido 👋</h2>
              <LoginForm />
              <GoogleLoginButton />
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      <Canvas />
    </main>
  );
};

export default Home;
