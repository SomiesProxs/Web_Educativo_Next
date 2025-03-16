"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useCallback } from 'react';

import "./register.css";

const Register = () => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  // Memoizamos checkIfUserExists para evitar recreaciones y bucles infinitos
  const checkIfUserExists = useCallback(async (email: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/check-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.exists) {
        // El usuario ya existe
        setModalMessage("Este correo ya está registrado. Por favor inicia sesión.");
        setShowModal(true);
        setIsRedirecting(true);
        
        // Redirigir al login después de mostrar el mensaje
        setTimeout(() => {
          setShowModal(false);
          router.push("/login");
        }, 3000);
      } else {
        // Es un nuevo usuario, continuar con el registro
        if (session?.user?.name) {
          localStorage.setItem("username", session.user.name || "Usuario");
        }
        setModalMessage("¡Usuario registrado exitosamente!");
        setShowModal(true);
        setIsRedirecting(true);
        
        setTimeout(() => {
          setShowModal(false);
          router.push("/");
        }, 2000);
      }
    } catch (err) {
      console.error("Error al verificar usuario:", err);
      setModalMessage("Ocurrió un error. Por favor intenta de nuevo.");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  }, [router, session]); // Incluimos las dependencias necesarias

  useEffect(() => {
    // Verificamos que session y session.user no sean null/undefined
    if (session?.user?.email && !isRedirecting) {
      checkIfUserExists(session.user.email);
    }
  }, [session, isRedirecting, checkIfUserExists]); // Incluimos checkIfUserExists aquí

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signIn("google", { redirect: false });
    } catch (err) {
      console.error("Error al iniciar sesión con Google:", err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-[#A0753A] text-black p-10 rounded-2xl shadow-lg text-center max-w-md w-full"
    >
      <h2 className="text-[50px] font-bold mb-8">Registro</h2>
      <button
        onClick={handleGoogleSignIn}
        className="w-full bg-black text-[#A0753A] py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition hover:scale-105"
        disabled={loading}
      >
        {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Continuar con Google"}
      </button>
    </motion.div>

    <div className="mt-8 text-center">
      <p className="text-gray-400 text-lg">¿Ya tienes cuenta?</p>
      <a href="/login" className="text-[#A0753A] font-semibold text-lg hover:underline">
        Iniciar sesión
      </a>
    </div>

    {showModal && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-[#A0753A] text-black p-8 rounded-xl shadow-xl text-center">
          <p className="text-xl font-semibold">{modalMessage}</p>
        </div>
      </motion.div>
    )}
  </div>
  );
};

export default Register;