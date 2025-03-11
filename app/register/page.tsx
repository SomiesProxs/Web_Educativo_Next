"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import "./register.css";

const Register = () => {
  const { data: session } = useSession(); // Verifica si el usuario está autenticado
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google");
  };

  useEffect(() => {
    if (session?.user) {
      localStorage.setItem("username", session.user.name || "Usuario");
      setShowModal(true);

      setTimeout(() => {
        setShowModal(false);
        router.push("/");
      }, 2000);
    }
  }, [session, router]);

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Registro</h2>
        <button onClick={handleGoogleSignIn} className="google-btn" disabled={loading}>
          {loading ? "Cargando..." : "Continuar con Google"}
        </button>
      </div>

      <div className="login-box">
        <p>¿Ya tienes cuenta?</p>
        <a href="/login" className="login-link">Iniciar sesión</a>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>¡Usted ya está registrado!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
