"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      router.push("/"); // Si ya está logueado, redirigir a la portada
    }
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    setLoading(false);

    if (data.success) {
      alert("Código enviado a tu correo");
      setStep(2);
    } else {
      alert(data.message);
    }
  };

  const handleCodeVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const response = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
  
    const data = await response.json();
    setLoading(false);
  
    if (data.success) {
      console.log("✅ Usuario autenticado:", data.username); 
      localStorage.setItem("username", data.username || "Usuario");
      router.push("/");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">
          {step === 1 ? "Iniciar Sesión" : "Verificar Código"}
        </h2>

        {step === 1 ? (
          <form onSubmit={handleEmailSubmit}>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
              {loading ? "Enviando..." : "Enviar Código"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeVerification}>
            <input
              type="text"
              placeholder="Código de verificación"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              required
            />
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
