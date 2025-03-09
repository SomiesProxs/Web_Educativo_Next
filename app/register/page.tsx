"use client";

import { signIn } from "next-auth/react";

const Register = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">Registro</h2>
        <button
          onClick={() => signIn("google")}
          className="w-full bg-red-500 text-white p-2 rounded"
        >
          Continuar con Google
        </button>
      </div>
    </div>
  );
};

export default Register;
