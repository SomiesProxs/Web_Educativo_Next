"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import "./fondocargar.css";

// Tipado de usuario
interface User {
  _id: string;
  username: string;
  email: string;
  phone: number;
  stars: number;
  theme?: number; // por si editás el theme en el admin también
}

const AdminDashboard = () => {
//crear cursos:   
const [titulo, setTitulo] = useState("");
const [curso, setCurso] = useState("Matemática");
const [modalVisible, setModalVisible] = useState(false);
const [modalMessage, setModalMessage] = useState("");
  
  
  const [activeTab, setActiveTab] = useState("usuarios");
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const usersPerPage = 5;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const setDarkMode = useState(false)[1];

  const { data: session, update } = useSession();
  const sessionUser = session?.user; 

  const [localTheme, setLocalTheme] = useState<0 | 1 | null>(null);

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: 0,
    stars: 0,
  });

  // Cargar usuarios
  const fetchUsers = async (page: number, query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users?page=${page}&search=${query}`);
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
        setTotalPages(Math.ceil(data.totalUsers / usersPerPage));
      } else {
        console.error("Error al cargar usuarios:", data.error);
      }
    } catch (error) {
      console.error("Error de red:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  // Buscador
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => setCurrentPage(page);

  const openModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      phone: user.phone,
      stars: user.stars,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "phone" || name === "stars" ? Number(value) : value,
    }));
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    const res = await fetch(`/api/users/${selectedUser._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editForm),
    });

    const result = await res.json();

    if (res.ok) {
      fetchUsers(currentPage, searchQuery);
      closeModal();
    } else {
      alert(result.message || "Error al actualizar");
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    const confirmed = window.confirm("¿Estás seguro de eliminar este usuario?");
    if (!confirmed) return;

    const res = await fetch(`/api/users/${selectedUser._id}`, {
      method: "DELETE",
    });

    const result = await res.json();

    if (res.ok) {
      fetchUsers(currentPage, searchQuery);
      closeModal();
    } else {
      alert(result.message || "Error al eliminar usuario");
    }
  };

  // Cargar el tema desde la sesión
  useEffect(() => {
    if (sessionUser?.theme === 0 || sessionUser?.theme === 1) {
      setLocalTheme(sessionUser.theme);
    }
  }, [sessionUser]);

  // Aplicar clase 'dark' al html
  useEffect(() => {
    if (localTheme !== null) {
      const isDark = localTheme === 1;
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [localTheme]);

  // Cambiar tema (y guardar en la base de datos)
  const toggleTheme = async () => {
    if (!sessionUser?.id) return;

    setLoading(true);
    const newTheme = localTheme === 0 ? 1 : 0;
    setLocalTheme(newTheme);

    try {
      const res = await fetch(`/api/users/${sessionUser.id}/theme`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: newTheme }),
      });

      if (!res.ok) throw new Error("Error actualizando theme");

      await update();
    } catch (err) {
      console.error(err);
      setLocalTheme(localTheme === 0 ? 1 : 0); // revertir
    } finally {
      setLoading(false);
    }
  };
  if (localTheme === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800">
        <div className="w-16 h-16 border-8 border-t-transparent border-white border-solid rounded-full animate-spin"></div>
      </div>
    );
  }
  const crearActividad = async () => {
    // Realizar la solicitud para crear la actividad
    const res = await fetch("/api/actividad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nivel: "inicial", // Asegúrate de pasar el nivel correcto aquí
        curso,
        titulo,
      }),
    });
  
    const data = await res.json();
  
    if (res.ok) {
      // Verifica el tipo de mensaje del servidor
      if (data.message === "Actividad creada") {
        // Si la respuesta es "Actividad creada", significa que el curso ya existía
        setModalMessage("Actividad creada");
      } else {
        // Si el mensaje es "Curso y actividad creados"
        setModalMessage("Curso y actividad creados");
      }
  
      // Mostrar el modal
      setModalVisible(true);
      setTitulo(""); // Limpiar el campo título después de crear la actividad
    } else {
      // Si hay un error, muestra el mensaje en el modal
      setModalMessage("Error: " + data.message);
      setModalVisible(true);
    }
  };
  



  return (
    <div className={`flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300 ${localTheme === 1 ? "bg-red-600 text-white" : "bg-blue-600 text-black"}`}>
      {/* Sidebar */}

      <button
        type="button"
        onClick={toggleTheme}
        title="Cambiar tema"
        aria-label="Cambiar tema"
        disabled={loading}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-lg transition-all duration-300 z-50 disabled:opacity-50 
          ${localTheme === 1 ? "bg-black text-white" : "bg-white text-black"}`}
      >
        {localTheme === 1 ? "🌙" : "☀️"}
      </button>

<aside className={`w-full md:w-64 ${localTheme === 1 ? "bg-gray-950 text-white" : "bg-[#bee1e5] text-black"}`}>

        <div className="p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Panel de Admin</h1>
            
          </div>
        </div>
        <nav className="mt-6">
          {["usuarios", "inicial", "ordenes", "configuracion"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2 ${
                localTheme === 1
                  ? `hover:bg-gray-700 ${activeTab === tab ? "bg-gray-700" : ""}`
                  : `hover:bg-[#e6faff] ${activeTab === tab ? "bg-[#e6faff]" : ""}`
              }`}
              
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className={`flex-1 p-4 sm:p-6 ${localTheme === 1 ? "bg-gray-900 text-white" : "bg-[#effcfa] text-black"}`}>

        {activeTab === "usuarios" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>

            <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input
                type="text"
                placeholder="Buscar por nombre o email"
                value={searchQuery}
                onChange={handleSearchChange}
                className={`p-2 border border-gray-300 dark:border-gray-700 rounded-md w-full sm:w-1/3 ${localTheme === 1 ? "bg-gray-800 text-white" : "bg-[#d0f0fd] text-black"}`}

              />
              {isLoading && <span className="text-gray-500 dark:text-gray-400">Cargando...</span>}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className={`w-full shadow rounded text-sm ${localTheme === 1 ? "bg-gray-800" : "bg-[#c8e8f4]"}`}>

                <thead className={`${localTheme === 1 ? "bg-gray-700" : "bg-[#80bace]"}`}>

                  <tr>
                    <th className="p-2 text-left">#</th>
                    <th className="p-2 text-left">Nombre</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Teléfono</th>
                    <th className="p-2 text-center">Estrellas</th>
                    <th className="p-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <tr key={user._id} className={`${localTheme === 1 ? "hover:bg-gray-700" : "hover:bg-[#add2db]"}`}>

                        <td className="p-2">{(currentPage - 1) * usersPerPage + index + 1}</td>
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.phone}</td>
                        <td className="p-2 text-center">{user.stars}</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => openModal(user)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal */}
            {showModal && selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 space-y-4 shadow-xl">
                  <h3 className="text-lg font-semibold dark:text-white">Editar Usuario</h3>
                  <input
                    type="text"
                    name="username"
                    value={editForm.username}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    placeholder="Nombre"
                  />
                  <input
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    placeholder="Email"
                  />
                  <input
                    type="number"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    placeholder="Teléfono"
                  />
                  <input
                    type="number"
                    name="stars"
                    value={editForm.stars}
                    onChange={handleEditChange}
                    className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-black dark:text-white border-gray-300 dark:border-gray-600"
                    placeholder="Estrellas"
                  />
                  <div className="flex justify-between">
                    <button
                      onClick={handleUpdateUser}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                    >
                      Eliminar
                    </button>
                    <button
                      onClick={closeModal}
                      className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-white px-4 py-2 rounded"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded disabled:opacity-50"
                >
                  Primero
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="px-3 py-1 dark:text-white">Página {currentPage} de {totalPages}</span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded disabled:opacity-50"
                >
                  Siguiente
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded disabled:opacity-50"
                >
                  Último
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "inicial" && (
           <div>
           <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md">
             <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
               Gestión Inicial
             </h2>
     
             <label
               htmlFor="titulo"
               className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
             >
               Título de la Actividad
             </label>
             <input
               id="titulo"
               className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white p-2 mb-4 w-full rounded"
               placeholder="Ej. Sumas Básicas"
               value={titulo}
               onChange={(e) => setTitulo(e.target.value)}
             />
     
             <label
               htmlFor="curso"
               className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
             >
               Selecciona un Curso
             </label>
             <select
               id="curso"
               value={curso}
               onChange={(e) => setCurso(e.target.value)}
               className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white p-2 mb-4 w-full rounded"
             >
               <option value="Matemática">Matemática</option>
               <option value="Comunicación">Comunicación</option>
               {/* Agrega más cursos si es necesario */}
             </select>
     
             <button
               onClick={crearActividad}
               className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition"
             >
               Crear Actividad
             </button>
           </div>
     
           {/* Modal */}
           {modalVisible && (
             <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
               <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-lg w-full">
                 <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                   {modalMessage}
                 </h3>
                 <button
                   onClick={() => setModalVisible(false)}
                   className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                 >
                   Cerrar
                 </button>
               </div>
             </div>
           )}
         </div>
        )}

        {activeTab === "ordenes" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestión de Órdenes</h2>
            <p className="dark:text-gray-300">Aquí va la lógica de órdenes.</p>
          </div>
        )}

        {activeTab === "configuracion" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Actividades Creadas</h2>
            <p className="dark:text-gray-300">Aquí van las Actividades Creadas.</p>
          </div>
        )}
        
      </main>
      
    </div>
    
  );
};

export default AdminDashboard;