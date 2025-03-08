"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setLoading(false);

    if (data.success) {
      router.push("/header"); // Redirigir a la vista de header.tsx
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Iniciar Sesión</h2>

        <input type="text" name="username" placeholder="Usuario" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />

        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
};

export default Login;
