"use client"
import { motion } from "framer-motion";
import { useState } from "react";
import state from "../store";
import {auth} from "@/lib/firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError(true);
      return;
    }

    setError(false);
    setLoading(true);

    setTimeout(() => {
      state.triggerSpin = true;

      setTimeout(() => {
        state.triggerSpin = false;
        state.intro = false;
      }, 1200);
    }, 800);
  };

  return (
    <motion.form
      onSubmit={handleLogin}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.15 } },
      }}
      className="flex flex-col gap-5 w-80"
    >
      <motion.input
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 },
        }}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-md"
        // onFocus={() => (state.shirtScale = 1.1)}
        // onBlur={() => (state.shirtScale = 1)}
      />

      <motion.input
        variants={{
          hidden: { opacity: 0, y: 20 },
          show: { opacity: 1, y: 0 },
        }}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-4 py-3 rounded-xl bg-white/20 text-white placeholder-gray-300 outline-none focus:ring-2 focus:ring-red-500 backdrop-blur-md"
        // onFocus={() => (state.shirtScale = 1.1)}
        // onBlur={() => (state.shirtScale = 1)}
      />

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm"
        >
          Completá todos los campos.
        </motion.p>
      )}

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-all"
      >
        {loading ? "Cargando..." : "Login"}
      </motion.button>
    </motion.form>
  );
};

export default LoginForm;
