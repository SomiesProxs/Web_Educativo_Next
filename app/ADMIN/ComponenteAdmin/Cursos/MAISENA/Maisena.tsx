'use client';

import { useState } from 'react';

interface MAISENAMaisenaProps {
  onVolver: () => void;
}

export default function MAISENAMaisena({ onVolver }: MAISENAMaisenaProps) {
  const [curso, setCurso] = useState('');
  const [titulos, setTitulos] = useState([{ titulo: '', estado: 1, subtemas: [''] }]);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalMensaje, setModalMensaje] = useState('');

  const handleAddTitulo = () => setTitulos([...titulos, { titulo: '', estado: 1, subtemas: [''] }]);
  const handleRemoveTitulo = (i: number) => setTitulos(titulos.filter((_, idx) => idx !== i));
  const handleTituloChange = (i: number, value: string) => {
    const nuevos = [...titulos];
    nuevos[i].titulo = value;
    setTitulos(nuevos);
  };
  const handleEstadoChange = (i: number, value: number) => {
    const nuevos = [...titulos];
    nuevos[i].estado = value;
    setTitulos(nuevos);
  };
  const handleAddSubtema = (i: number) => {
    const nuevos = [...titulos];
    nuevos[i].subtemas.push('');
    setTitulos(nuevos);
  };
  const handleRemoveSubtema = (i: number, j: number) => {
    const nuevos = [...titulos];
    nuevos[i].subtemas.splice(j, 1);
    setTitulos(nuevos);
  };
  const handleSubtemaChange = (i: number, j: number, value: string) => {
    const nuevos = [...titulos];
    nuevos[i].subtemas[j] = value;
    setTitulos(nuevos);
  };

  const handleGuardar = async () => {
    setMensaje(null);
    if (!curso.trim() || titulos.some(t => !t.titulo.trim() || t.subtemas.some(s => !s.trim()))) {
      setMensaje('❌ Todos los campos deben estar completos');
      return;
    }

    try {
      const response = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nivel: 'MAISENA',
          curso,
          titulos,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setModalMensaje('✅ Curso creado exitosamente');
        setModalAbierto(true);
        setCurso('');
        setTitulos([{ titulo: '', estado: 1, subtemas: [''] }]);
      } else {
        setModalMensaje(`❌ Error: ${data.message}`);
        setModalAbierto(true);
      }
    } catch (err) {
      console.error(err);
      setMensaje('❌ Error en el servidor');
    }
  };

  return (
    <div className="p-8 rounded-lg max-w-3xl mx-auto">
      <button
        onClick={onVolver}
        className="mb-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
      >
        ⬅ Volver
      </button>

      <h2 className="text-3xl font-bold mb-6">TEMAS Y SUBTEMAS DE MAISENA</h2>

      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col gap-6">
        <div>
          <label className="block text-lg font-semibold mb-2">Curso</label>
          <input
            type="text"
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Ej. Matemáticas"
          />
        </div>

        {titulos.map((titulo, i) => (
          <div key={i} className="border rounded p-4 bg-gray-50 space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-lg font-semibold">Tema #{i + 1}</label>
              <button
                onClick={() => handleRemoveTitulo(i)}
                className="text-red-600 hover:underline text-sm"
              >
                Eliminar tema
              </button>
            </div>
            <input
              type="text"
              value={titulo.titulo}
              onChange={(e) => handleTituloChange(i, e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Ej. Álgebra"
            />
            <div>
              <label className="block text-sm font-medium">Estado</label>
              <select
                value={titulo.estado}
                onChange={(e) => handleEstadoChange(i, parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg"
                title="Seleccionar estado del tema"
              >
                <option value={1}>Activo</option>
                <option value={0}>Bloqueado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Subtemas</label>
              {titulo.subtemas.map((sub, j) => (
                <div key={j} className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={sub}
                    onChange={(e) => handleSubtemaChange(i, j, e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder={`Subtema ${j + 1}`}
                  />
                  <button
                    onClick={() => handleRemoveSubtema(i, j)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => handleAddSubtema(i)}
                className="text-blue-600 hover:underline text-sm mt-1"
              >
                + Agregar otro subtema
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={handleAddTitulo}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Agregar otro tema
        </button>

        <button
          onClick={handleGuardar}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Guardar curso
        </button>

        {mensaje && <div className="mt-4 text-sm text-center text-red-600">{mensaje}</div>}
      </div>

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full">
            <p className="text-lg mb-4">{modalMensaje}</p>
            <button
              onClick={() => setModalAbierto(false)}
              className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
