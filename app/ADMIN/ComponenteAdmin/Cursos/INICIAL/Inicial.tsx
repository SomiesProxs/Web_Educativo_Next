'use client';

import { useState } from 'react';

type Subtema = string;

interface InicialProps {
  onVolver: () => void;
}

export default function Inicial({ onVolver }: InicialProps) {
  const [tema, setTema] = useState<string>('');
  const [curso, setCurso] = useState<string>('');
  const [subtemas, setSubtemas] = useState<Subtema[]>(['']);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');

  const handleAddSubtema = () => {
    setSubtemas([...subtemas, '']);
  };

  const handleSubtemaChange = (index: number, value: string) => {
    const nuevos = [...subtemas];
    nuevos[index] = value;
    setSubtemas(nuevos);
  };

  const handleGuardar = async () => {
    setMensaje(null);

    if (!tema.trim() || !curso.trim() || subtemas.some((subtema) => !subtema.trim())) {
      setMensaje('❌ Todos los campos deben ser completos');
      return;
    }

    try {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nivel: 'INICIAL',
          curso,
          titulo: tema,
          subtemas,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalMensaje('✅ Curso creado exitosamente');
        setModalAbierto(true);
        setTema('');
        setCurso('');
        setSubtemas(['']);
      } else {
        setModalMensaje(`❌ Error: ${data.message}`);
        setModalAbierto(true);
      }
    } catch (error) {
      setMensaje('❌ Error en el servidor');
      console.error(error);
    }
  };

  return (
    <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
  {/* Botón Volver */}
  <button
    onClick={onVolver}
    className="mb-4 bg-gray-400 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded text-sm sm:text-base hover:bg-gray-500 transition flex items-center"
  >
    <span className="mr-1">⬅</span> Volver
  </button>

  <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left">TEMAS Y SUBTEMAS DE INICIAL</h2>

  <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
    <div>
      <label className="block text-base sm:text-lg font-semibold mb-1 sm:mb-2">Curso</label>
      <input
        type="text"
        value={curso}
        onChange={(e) => setCurso(e.target.value)}
        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
        placeholder="Escribe el nombre del curso"
      />
    </div>

    <div>
      <label className="block text-base sm:text-lg font-semibold mb-1 sm:mb-2">Crear tema</label>
      <input
        type="text"
        value={tema}
        onChange={(e) => setTema(e.target.value)}
        className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
        placeholder="Escribe el nombre del tema"
      />
    </div>

    <div>
      <label className="block text-base sm:text-lg font-semibold mb-1 sm:mb-2">Crear subtemas</label>
      {subtemas.map((sub, index) => (
        <input
          key={index}
          type="text"
          value={sub}
          onChange={(e) => handleSubtemaChange(index, e.target.value)}
          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 mb-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
          placeholder={`Subtema ${index + 1}`}
        />
      ))}
      <button
        onClick={handleAddSubtema}
        className="text-blue-500 hover:underline text-sm mt-1 flex items-center"
      >
        <span className="mr-1">+</span> Agregar otro subtema
      </button>
    </div>

    <button
      onClick={handleGuardar}
      className="mt-3 sm:mt-4 bg-blue-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto sm:self-end"
    >
      Guardar
    </button>

    {mensaje && <div className="mt-3 sm:mt-4 text-sm text-center">{mensaje}</div>}
  </div>

  {modalAbierto && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg text-center w-full max-w-xs sm:max-w-sm">
        <p className="text-base sm:text-lg mb-3 sm:mb-4">{modalMensaje}</p>
        <button
          onClick={() => setModalAbierto(false)}
          className="mt-1 sm:mt-2 bg-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded hover:bg-blue-700 transition"
        >
          Cerrar
        </button>
      </div>
    </div>
  )}
    </div>
  );
}
