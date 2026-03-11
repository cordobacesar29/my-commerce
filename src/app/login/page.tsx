"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useSnapshot } from "valtio";
import Canvas from "@/canvas";
import state from "@/store";
import LoginForm from "@/components/LoginForm";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

const Login = () => {
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

export default Login;
