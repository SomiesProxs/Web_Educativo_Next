"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

const PruebaTheme = () => {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [localTheme, setLocalTheme] = useState(session?.user.theme || 0);

  const user = session?.user;

  const toggleTheme = async () => {
    if (!user?.id) return;

    setLoading(true);
    const newTheme = localTheme === 0 ? 1 : 0; // Cambiar el theme localmente antes de enviar la solicitud

    setLocalTheme(newTheme); // Actualizar la UI inmediatamente

    try {
      // Enviar la solicitud PATCH solo para actualizar la base de datos
      const res = await fetch(`/api/users/${user.id}/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });

      if (!res.ok) throw new Error("Error actualizando theme");

      // Actualizar la sesión después de que la base de datos haya sido actualizada (opcional si es necesario para otras cosas)
      await update();

    } catch (err) {
      console.error(err);
      // Si hay un error, revertimos al valor anterior
      setLocalTheme(localTheme === 0 ? 1 : 0);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p>Cargando sesión...</p>;

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${localTheme === 1 ? "bg-red-600 text-white" : "bg-blue-600 text-black"}`}>

      <div className="text-center">
        <h1 className="text-3xl mb-4">Hola, {user.name}</h1>
        <p className="mb-4">Modo actual: {localTheme === 1 ? "🌙 Oscuro" : "☀️ Claro"}</p>
        <button
  type="button"
  onClick={toggleTheme}
  title="Cambiar tema"
  aria-label="Cambiar tema"
  disabled={loading}
  className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 disabled:opacity-50 
    ${localTheme === 1 ? "bg-black text-white " : "bg-white text-black "}`}
>
  {localTheme === 1 ? "🌙" : "☀️"}
</button>
      </div>
    </div>
  );
};

export default PruebaTheme;
