// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();

  // Si ya hay sesión, redirigir a la página principal
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const sendVerificationCode = async () => {
    if (!email) {
      setErrorMsg("Por favor ingresa tu correo electrónico");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        setErrorMsg(data.message || "Error al enviar código");
      }
    } catch (error) {
      setErrorMsg("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code) {
      setErrorMsg("Por favor ingresa el código de verificación");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        body: JSON.stringify({ email, code }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok) {
        setShowModal(true);

        setTimeout(async () => {
          setShowModal(false);
          // Usar el proveedor de credenciales con el email verificado
          const result = await signIn("credentials", {
            email: email,
            verified: "true",
            redirect: false,
            callbackUrl: "/"
          });
          
          if (result?.error) {
            setErrorMsg("Error al iniciar sesión: " + result.error);
          } else {
            router.push("/");
          }
        }, 2000);
      } else {
        setErrorMsg(data.message || "Código incorrecto o expirado");
      }
    } catch (error) {
      setErrorMsg("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#A0753A] text-black p-10 rounded-2xl shadow-lg text-center max-w-md w-full"
      >
        {step === 1 ? (
          <>
            <h2 className="text-4xl font-bold mb-8">Iniciar sesión</h2>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black mb-4"
            />
            {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
            <button
              onClick={sendVerificationCode}
              disabled={loading}
              className="w-full bg-black text-[#A0753A] py-3 rounded-xl font-semibold transition hover:scale-105 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Enviar código"}
            </button>

            <div className="my-4 text-gray-600">O</div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-black text-[#A0753A] py-3 rounded-xl font-semibold transition hover:scale-105 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Continuar con Google"}
            </button>
          </>
        ) : (
          <>
            <h2 className="text-4xl font-bold mb-8">Verifica tu correo</h2>
            <p className="text-lg mb-4">Hemos enviado un código a {email}</p>
            <input
              type="text"
              placeholder="Código de verificación"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black mb-4"
            />
            {errorMsg && <p className="text-red-500 text-sm mb-2">{errorMsg}</p>}
            <button
              onClick={verifyCode}
              disabled={loading}
              className="w-full bg-black text-[#A0753A] py-3 rounded-xl font-semibold transition hover:scale-105 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verificar"}
            </button>
            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 bg-gray-700 text-white py-3 rounded-xl font-semibold transition hover:scale-105"
            >
              Volver
            </button>
          </>
        )}
      </motion.div>

      <div className="mt-8 text-center">
        <p className="text-gray-400 text-lg">¿No tienes cuenta?</p>
        <a href="/register" className="text-[#A0753A] font-semibold text-lg hover:underline">
          Regístrate
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
            <p className="text-xl font-semibold">¡Inicio de sesión exitoso!</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}