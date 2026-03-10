"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import state from "../store";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState(""); // Solo para registro
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        await updateProfile(userCredential.user, { displayName: name });
      }
      router.push("/customize"); // Redirige a la página de personalización después del login/registro exitoso
      router.refresh(); // Refresca la página para actualizar el estado de autenticación
    } catch (error) {
      if (error instanceof FirebaseError) {
        const errorMessages: Record<string, string> = {
          "auth/email-already-in-use": "Este correo ya está registrado.",
          "auth/invalid-credential": "Credenciales incorrectas.",
          "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
          "auth/invalid-email": "El formato del correo no es válido.",
        };
        setError(errorMessages[error.code] || "Ocurrió un error inesperado.");
      }
    }

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
        {isLogin ? "Entrar" : "Registrarse"}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={()=> setIsLogin(!isLogin)}
        disabled={loading}
        className="mt-4 text-blue-600 hover:underline text-sm"
      >
        {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
      </motion.button>
    </motion.form>
  );
};

export default LoginForm;
