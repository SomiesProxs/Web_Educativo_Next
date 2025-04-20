"use client";
import React, { useState, useEffect } from "react";

// Tipado de usuario
interface User {
  _id: string;
  username: string;
  email: string;
  phone: number;
  stars: number;
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("usuarios");
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const usersPerPage = 5;

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: 0,
    stars: 0,
  });

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

  // Effect para controlar el modo oscuro
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Función para alternar entre modo oscuro y claro
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-gray-800 dark:bg-gray-950 text-white">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Panel de Admin</h1>
            <button
              onClick={toggleDarkMode}
              className="text-sm px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white"
            >
              {darkMode ? "☀️ Claro" : "🌙 Oscuro"}
            </button>
          </div>
        </div>
        <nav className="mt-6">
          {["usuarios", "productos", "ordenes", "configuracion"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left px-4 py-2 hover:bg-gray-700 ${
                activeTab === tab ? "bg-gray-700" : ""
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 bg-gray-100 dark:bg-gray-900">
        {activeTab === "usuarios" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>

            <div className="mb-4 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <input
                type="text"
                placeholder="Buscar por nombre o email"
                value={searchQuery}
                onChange={handleSearchChange}
                className="p-2 border border-gray-300 dark:border-gray-700 rounded-md w-full sm:w-1/3 bg-white dark:bg-gray-800 text-black dark:text-white"
              />
              {isLoading && <span className="text-gray-500 dark:text-gray-400">Cargando...</span>}
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="w-full bg-white dark:bg-gray-800 shadow rounded text-sm">
                <thead className="bg-gray-200 dark:bg-gray-700">
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
                      <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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

        {activeTab === "productos" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Gestión de Productos</h2>
            <p className="dark:text-gray-300">Aquí va la lógica de productos.</p>
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
            <h2 className="text-xl font-semibold mb-4">Configuración</h2>
            <p className="dark:text-gray-300">Aquí van los ajustes generales.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;