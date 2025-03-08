"use client";

import { useState } from "react";

const Register = () => {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    dni: "",
    phone: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    alert(data.message);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Registro</h2>

        <input type="text" name="username" placeholder="Usuario" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <input type="email" name="email" placeholder="Correo" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <input type="text" name="dni" placeholder="DNI" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />
        <input type="text" name="phone" placeholder="Teléfono" onChange={handleChange} className="w-full p-2 border rounded mb-2" required />

        <button type="submit" className="w-full bg-green-500 text-white p-2 rounded">
          Registrarse
        </button>
      </form>
    </div>
  );
};

export default Register;
