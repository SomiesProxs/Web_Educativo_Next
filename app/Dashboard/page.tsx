          "use client";

          import { useState, useEffect } from "react";
          import { useSession } from "next-auth/react";
          import { useRouter } from "next/navigation";
          import { motion } from "framer-motion";
          import { User, CreditCard, ClipboardList } from "lucide-react";
          import "./dashboard.css";

          const Dashboard = () => {
            const { data: session } = useSession();
            const router = useRouter();
            const [selectedSection, setSelectedSection] = useState<string>("ajustes");
            const [username, setUsername] = useState<string>(session?.user?.name || "");
            const [phone, setPhone] = useState<string>(session?.user?.phone || "");
            const [birthDate, setBirthDate] = useState<string>(session?.user?.birthDate || "");
            const [gender, setGender] = useState<string>(session?.user?.gender || "");
            
            // Estados para validación - aquí está el problema con el tipo
            const [validName, setValidName] = useState<boolean>(true);
            const [validPhone, setValidPhone] = useState<boolean>(true);
            const [isFormValid, setIsFormValid] = useState<boolean>(false);
            const [isFormComplete, setIsFormComplete] = useState<boolean>(false); // eslint-disable-line @typescript-eslint/no-unused-vars
            const [formSubmitted, setFormSubmitted] = useState<boolean>(false);

            // Al recargar, aseguramos que se mantenga en "Ajustes de la cuenta"
            useEffect(() => {
              setSelectedSection("ajustes");
            }, []);

            // Verificar si el formulario está completo y válido
            useEffect(() => {
              const isComplete = username && phone && birthDate && gender;
              setIsFormComplete(Boolean(isComplete)); // Aseguramos que sea boolean
              
              const isValid = validName && validPhone && Boolean(isComplete);
              setIsFormValid(isValid);
            }, [username, phone, birthDate, gender, validName, validPhone]);

            // Validar nombre (máximo 20 palabras, sin números)
            const validateName = (name: string) => {
              // Validación del nombre: sin números y máximo 20 palabras
              const hasNoNumbers = !/\d/.test(name);
              const wordCount = name.trim().split(/\s+/).length;
              // Asegurar que el resultado de esta expresión es un booleano
              const isValid = Boolean(hasNoNumbers && wordCount <= 20 && name.trim() !== "");
              setValidName(isValid);
            };

            // Validar teléfono (solo números, máximo 9 dígitos)
            const validatePhone = (phoneNumber: string) => {
              // Validación del teléfono: solo números y máximo 9 dígitos
              const isValid = Boolean(/^\d{1,9}$/.test(phoneNumber));
              setValidPhone(isValid);
            };

            // Manejar cambios en los campos
            const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const newName = e.target.value;
              setUsername(newName);
              validateName(newName);
            };

            const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const newPhone = e.target.value;
              setPhone(newPhone);
              validatePhone(newPhone);
            };

            const handleUpdate = async () => {
              // Verificar si todos los campos son válidos
              if (!isFormValid) return;

              try {
                const response = await fetch("/api/updateProfile", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: session?.user?.email,
                    username,
                    phone,
                    birthDate,
                    gender,
                  }),
                });
            
                if (response.ok) {
                  setFormSubmitted(true);
                  alert("Datos actualizados correctamente");
                  
                  // Refrescar sesión para reflejar cambios
                  const updatedSession = await fetch("/api/auth/session").then((res) => res.json());
                  
                  // Después de 2 segundos, volver a colores normales
                  setTimeout(() => {
                    setFormSubmitted(false);
                  }, 2000);
                } else {
                  alert("Error al actualizar los datos");
                }
              } catch (error) {
                console.error("Error al actualizar:", error);
              }
            };

            // Determinar el color del texto para los campos - asegurar que devuelve un string
            const getTextColorClass = (isValid: boolean): string => {
              if (formSubmitted) return "text-white"; // Volver a blanco después de guardado
              return isValid ? "text-green-400" : "text-red-400";
            };

            return (
              <div className="min-h-screen bg-[#1b1f38] text-white flex flex-col items-center p-6">
                {/* Barra superior */}
                <motion.header
                  className="w-full max-w-4xl flex justify-between items-center bg-black p-4 rounded-xl shadow-lg"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <motion.img
                    src="/logo.jpg"
                    alt="Logo"
                    className="w-42 h-12 cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    onClick={() => router.push("/")}
                  />
                </motion.header>

                {/* Contenido principal */}
                <motion.main
                  className="w-full max-w-4xl mt-6 grid grid-cols-1 md:grid-cols-4 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  {/* Contenedor fijo - Perfil */}
                  <motion.section
                    className="md:col-span-1 bg-[#A0753A] p-6 rounded-xl shadow-lg flex flex-col items-center"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                  >
                    <motion.div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                      <User size={40} color="#A0753A" />
                    </motion.div>
                    <span className="mt-4 text-lg font-bold text-black">{session?.user?.name || "Usuario"}</span>

                    <div className="mt-6 w-full flex flex-col gap-3">
                      {[
                        { label: "Cuenta", icon: <User size={20} />, section: "ajustes" },
                        { label: "Crédito", icon: <CreditCard size={20} />, section: "credito" },
                        { label: "Ordenes", icon: <ClipboardList size={20} />, section: "ordenes" },
                      ].map(({ label, icon, section }) => (
                        <motion.button
                          key={section}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-semibold ${
                            selectedSection === section ? "bg-black text-[#A0753A]" : "bg-[#A0753A] hover:bg-black hover:text-[#A0753A]"
                          }`}
                          onClick={() => setSelectedSection(section)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {icon} {label}
                        </motion.button>
                      ))}
                    </div>
                  </motion.section>

                  {/* Contenedor dinámico */}
                  <motion.section
                    className="md:col-span-3 bg-[#A0753A] p-6 rounded-xl shadow-lg"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                  >
                    {selectedSection === "ajustes" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                        <h2 className="text-4xl font-bold text-black">Información de tu cuenta</h2>
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Campo Usuario con validación */}
                          <motion.div
                            className="p-3 bg-black rounded-lg shadow-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            <label htmlFor="username" className="block text-sm font-semibold text-white">Usuario</label>
                            <input
                              id="username"
                              type="text"
                              value={username}
                              onChange={handleNameChange}
                              className={`w-full mt-1 p-1 bg-black rounded-md outline-none ${getTextColorClass(validName)}`}
                            />
                            {!validName && (
                              <p className="text-xs text-red-400 mt-1">Solo letras, máximo 20 palabras</p>
                            )}
                          </motion.div>

                          {/* Correo Electrónico (no editable) */}
                          <motion.div
                            className="p-3 bg-black rounded-lg shadow-lg text-white"
                            whileHover={{ scale: 1.05 }}
                          >
                            <span className="block text-sm font-semibold">Correo Electrónico</span>
                            <span className="block text-lg">{session?.user?.email || "No disponible"}</span>
                          </motion.div>

                          {/* Campo Celular con validación */}
                          <motion.div
                            className="p-3 bg-black rounded-lg shadow-lg"
                            whileHover={{ scale: 1.05 }}
                          >
                            <label htmlFor="phone" className="block text-sm font-semibold text-white">Celular</label>
                            <input
                              id="phone"
                              type="text"
                              value={phone}
                              onChange={handlePhoneChange}
                              className={`w-full mt-1 p-1 bg-black rounded-md outline-none ${getTextColorClass(validPhone)}`}
                            />
                            {!validPhone && (
                              <p className="text-xs text-red-400 mt-1">Solo números, máximo 9 dígitos</p>
                            )}
                          </motion.div>

                          {/* Fecha de Nacimiento */}
                          <motion.div
                            className="p-3 bg-black rounded-lg shadow-lg text-white"
                            whileHover={{ scale: 1.05 }}
                          >
                            <label htmlFor="birthDate" className="block text-sm font-semibold">Fecha de Nacimiento</label>
                            <input
                              id="birthDate"
                              type="date"
                              value={birthDate}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBirthDate(e.target.value)}
                              className="w-full mt-1 p-1 bg-black text-white rounded-md [&::-webkit-calendar-picker-indicator]:invert"
                            />
                          </motion.div>

                          {/* Selección de Género */}
                          <motion.div
                            className="p-3 bg-black rounded-lg shadow-lg text-white"
                            whileHover={{ scale: 1.05 }}
                          >
                            <label className="block text-sm font-semibold">Género</label>
                            <div className="flex gap-4 mt-1">
                              <label htmlFor="gender-male" className="flex items-center gap-2">
                                <input
                                  id="gender-male"
                                  type="radio"
                                  name="gender"
                                  value="Hombre"
                                  checked={gender === "Hombre"}
                                  onChange={() => setGender("Hombre")}
                                  className="accent-[#A0753A]"
                                />
                                Hombre
                              </label>
                              <label htmlFor="gender-female" className="flex items-center gap-2">
                                <input
                                  id="gender-female"
                                  type="radio"
                                  name="gender"
                                  value="Mujer"
                                  checked={gender === "Mujer"}
                                  onChange={() => setGender("Mujer")}
                                  className="accent-[#A0753A]"
                                />
                                Mujer
                              </label>
                            </div>
                          </motion.div>

                          {/* Botón para actualizar con estado de validación */}
                          <motion.button
                            className={`col-span-2 text-2xl px-7 py-2 rounded-md shadow-md font-semibold transition-all ${
                              isFormValid 
                                ? "bg-[#2c3e50] text-white hover:bg-[#262626] cursor-pointer" 
                                : "bg-gray-500 text-gray-300 cursor-not-allowed"
                            }`}
                            whileHover={isFormValid ? { scale: 1.05 } : {}}
                            whileTap={isFormValid ? { scale: 0.95 } : {}}
                            onClick={handleUpdate}
                            disabled={!isFormValid}
                          >
                            {isFormValid ? "Actualizar" : "Faltan campos por completar"}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}

                    {selectedSection === "credito" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                        <h2 className="text-xl font-bold text-black">Crédito</h2>
                        <p className="mt-2 text-black">Aquí se mostrarán los créditos disponibles.</p>
                      </motion.div>
                    )}

                    {selectedSection === "ordenes" && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                        <h2 className="text-xl font-bold text-black">Últimas Órdenes</h2>
                        <p className="mt-2 text-black">Aquí se mostrarán tus últimas órdenes.</p>
                      </motion.div>
                    )}
                  </motion.section>
                </motion.main>
              </div>
            );
          };

          export default Dashboard;