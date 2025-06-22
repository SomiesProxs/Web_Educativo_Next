          "use client";
          import { useState, useEffect, useRef } from "react";
          import { useSession } from "next-auth/react";
          import { useRouter } from "next/navigation";
          import { motion } from "framer-motion";
          import Image from 'next/image';
          import { User, CreditCard, ClipboardList, Pencil } from "lucide-react";
          
          const Dashboard = () => {
            const { data: session, update } = useSession(); // Importar update
            const router = useRouter();
            const [selectedSection, setSelectedSection] = useState<string>("ajustes");
            const [username, setUsername] = useState<string>(session?.user?.name || "");
            const [phone, setPhone] = useState<string>(
              session?.user?.phone !== undefined ? String(session?.user?.phone) : ""
            );
            const [birthDate, setBirthDate] = useState<string>(session?.user?.birthDate || "");
            const [gender, setGender] = useState<string>(session?.user?.gender || "");
            
            // Estados para validación - aquí está el problema con el tipo
            const [validName, setValidName] = useState<boolean>(true);
            const [validPhone, setValidPhone] = useState<boolean>(true);
            const [isFormValid, setIsFormValid] = useState<boolean>(false);
            const [isFormComplete, setIsFormComplete] = useState<boolean>(false); // eslint-disable-line @typescript-eslint/no-unused-vars
            const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
            const [showModal, setShowModal] = useState(false);


            const [isHovered, setIsHovered] = useState(false);
            const [image, setImage] = useState<string | null>(null);
            const fileInputRef = useRef<HTMLInputElement>(null);
            
         // Theme para el fondo
const [localTheme, setLocalTheme] = useState<0 | 1 | null>(null);
const sessionUser = session?.user;
const [loading, setLoading] = useState(false);

useEffect(() => {
  async function setUserTheme() {
    if (!sessionUser) return;

    if (sessionUser.theme === 0 || sessionUser.theme === 1) {
      setLocalTheme(sessionUser.theme);
      return;
    }

    const userId = (sessionUser as any)._id;
    try {
      const res = await fetch(`/api/users/${userId}`);
      const user = await res.json();
      if (user.theme === 0 || user.theme === 1) {
        setLocalTheme(user.theme);
      } else {
        setLocalTheme(0);
      }
    } catch (err) {
      console.error('Fallo al obtener theme:', err);
      setLocalTheme(0);
    }
  }

  setUserTheme();
}, [sessionUser]);

useEffect(() => {
  if (localTheme !== null) {
    document.documentElement.classList.toggle('dark', localTheme === 1);
  }
}, [localTheme]);

// Cambiar tema (y guardar en la base de datos)
const toggleTheme = async () => {
  if (!sessionUser) return;

  setLoading(true);
  const newTheme = localTheme === 0 ? 1 : 0;
  const previousTheme = localTheme; // Guardar el tema anterior para revertir si hay error
  
  // Actualizar el tema localmente primero para mejor UX
  setLocalTheme(newTheme);

  try {
    // Usar el ID correcto del usuario
    const userId = (sessionUser as any)._id || sessionUser.id;
    const res = await fetch(`/api/users/${userId}/theme`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: newTheme }),
    });

    if (!res.ok) {
      throw new Error(`Error actualizando theme: ${res.status} ${res.statusText}`);
    }

    // Si tienes una función update() para actualizar la sesión, úsala
    if (typeof update === 'function') {
      await update();
    }
  } catch (err) {
    console.error('Error al guardar tema:', err);
    // Revertir al tema anterior si hay error
    setLocalTheme(previousTheme);
    // Opcional: mostrar un mensaje de error al usuario
    alert('Error al guardar el tema. Inténtalo de nuevo.');
  } finally {
    setLoading(false);
  }
};


  // ✅ Abrir la galería o archivos al hacer clic en el círculo
const handleClick = () => {
  fileInputRef.current?.click(); // ✅ Abrir el selector de imágenes al hacer clic
};

  const updateProfileImage = async (imageUrl: string) => {
    try {
      const response = await fetch("/api/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email, // 📌 Identifica al usuario
          image: imageUrl, // 📌 Enviar la URL de la imagen
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        console.log("✅ Imagen actualizada correctamente en MongoDB");
      } else {
        console.error("❌ Error al actualizar la imagen:", data.error);
      }
    } catch (error) {
      console.error("❌ Error en la petición:", error);
    }
  };
  
  


  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "Somiesproxs"); // ✅ Asegurar el preset correcto
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
  
      const data = await response.json();
  
      if (data.secure_url) {
        setImage(data.secure_url); // ✅ Guarda la imagen en el estado
        await updateProfileImage(data.secure_url); // ✅ Guarda la URL en MongoDB
      } else {
        console.error("❌ Error al subir la imagen:", data);
      }
    } catch (error) {
      console.error("❌ Error al subir la imagen:", error);
    }
  };
  
  useEffect(() => {
    const fetchProfileImage = async () => {
      try {
        const response = await fetch(`/api/getUser?email=${session?.user?.email}`);
        const data = await response.json();
  
        if (response.ok && data.image) {
          setImage(data.image); // ✅ Cargar la imagen desde la base de datos
        }
      } catch (error) {
        console.error("❌ Error al obtener la imagen:", error);
      }
    };
  
    if (session?.user?.email) {
      fetchProfileImage();
    }
  }, [session?.user?.email]);
  
  
    
  

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

            const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const newName = e.target.value;
            
              // Solo permite letras y espacios, y recorta si supera los 10 caracteres
              if (/^[a-zA-Z\s]*$/.test(newName) && newName.length <= 25) {
                setUsername(newName);
                validateName(newName);
              }
            };
            

            const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const newPhone = e.target.value;
              setPhone(newPhone);
              validatePhone(newPhone);
            };

            const handleUpdate = async () => {
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
            
                if (!response.ok) {
                  throw new Error("Error al actualizar los datos");
                }
            
                setFormSubmitted(true);
                setShowModal(true); // Mostrar el modal
            
                // 🔄 Actualizar sesión
                await update({
                  user: {
                    ...session?.user,
                    name: username,
                    phone,
                    birthDate,
                    gender,
                  },
                });
            
                // Cerrar modal después de 2 segundos
                setTimeout(() => {
                  setFormSubmitted(false);
                  setShowModal(false);
                }, 2000);
              } catch (error) {
                console.error("❌ Error al actualizar:", error);
              }
            };
            
            

            // Determinar el color del texto para los campos - asegurar que devuelve un string
            const getTextColorClass = (isValid: boolean): string => {
              if (formSubmitted) return "text-white"; // Volver a blanco después de guardado
              return isValid ? "text-green-400" : "text-red-400";
            };


            
            return (
              <div className="min-h-screen bg-[#1b1f38] text-white flex flex-col items-center p-6">

      
      {/* Header */}
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

      {/* Main content - Row on desktop, column on mobile */}
      <motion.main
        className="w-full max-w-4xl mt-6 flex flex-col md:flex-row gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Profile section - Side by side on desktop, stacked on mobile */}
        <motion.section
          className="w-full md:w-1/4 bg-[#A0753A] p-6 rounded-xl shadow-lg flex flex-col items-center"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >




<div className="relative">
  {/* 🔥 Círculo con animación y selector de imagen */}
  <motion.div 
    className="w-20 h-20 bg-black rounded-full flex items-center justify-center cursor-pointer overflow-hidden"
    onMouseEnter={() => setIsHovered(true)} 
    onMouseLeave={() => setIsHovered(false)}
    onClick={handleClick} // 📌 Al hacer clic, abre el selector de imágenes
  >
{image ? (
  <Image 
    src={image} 
    alt="Foto de perfil" 
    width={80}  // ✅ Ajusta según necesitess
    height={80} // ✅ Ajusta según necesites
    className="w-full h-full object-cover rounded-full"
  />
) : (
  <motion.div 
    key={isHovered ? "pencil" : "user"}
    initial={{ opacity: 0, scale: 0.8 }} 
    animate={{ opacity: 1, scale: 1 }} 
    exit={{ opacity: 0, scale: 0.8 }} 
    transition={{ duration: 0.2 }}
  >
    {isHovered ? <Pencil size={40} color="#A0753A" /> : <User size={40} color="#A0753A" />}
  </motion.div>
)}

  </motion.div>

  {/* 🖼️ Input oculto para seleccionar imagen */}
  <input 
    type="file" 
    accept="image/*" 
    className="hidden"
    ref={fileInputRef} 
    onChange={handleImageChange} 
    title="Selecciona una imagen de perfil" // ✅ Agregamos un título accesible
    aria-label="Selecciona una imagen de perfil"
  />
</div>



    
          <span className="mt-4 text-lg font-bold text-black break-words whitespace-normal leading-tight max-w-full block">
            {session?.user?.name || "Usuario"}
          </span>

          <div className="mt-6 w-full flex flex-col gap-3">
  {[
    { label: "Cuenta", icon: <User size={20} />, section: "ajustes" },
    { label: "Crédito", icon: <CreditCard size={20} />, section: "credito" },
    { label: "Ordenes", icon: <ClipboardList size={20} />, section: "ordenes" },
    { 
      label: "Tema", 
      icon: loading ? (
        <div className="animate-spin">⟳</div>
      ) : (
        <span className="text-xl">{localTheme === 1 ? "🌙" : "☀️"}</span>
      ), 
      section: "tema",
      onClick: toggleTheme,
      disabled: loading
    },
  ].map(({ label, icon, section, onClick, disabled = false }) => (
    <motion.button
      key={section}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 border-2 shadow-md ${
        section === "tema" 
          ? `${localTheme === 1 
              ? "bg-gray-900 text-white border-gray-700 hover:bg-gray-800 hover:border-gray-600 shadow-gray-900/20" 
              : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50 hover:border-gray-400 shadow-gray-300/20"
            }`
          : selectedSection === section 
            ? "bg-black text-[#A0753A] border-[#A0753A] shadow-[#A0753A]/20" 
            : "bg-[#A0753A] text-white border-[#A0753A] hover:bg-black hover:text-[#A0753A] hover:border-black shadow-[#A0753A]/20"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"}`}
      onClick={onClick ? onClick : () => setSelectedSection(section)}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      {icon} {label}
    </motion.button>
  ))}
</div>
        </motion.section>

        {/* Dynamic content section */}
        <motion.section
          className="w-full md:w-3/4 bg-[#A0753A] p-6 rounded-xl shadow-lg"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          {selectedSection === "ajustes" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
              <h2 className="text-4xl font-bold text-black">Información de tu cuenta</h2>
              
              {/* Form fields - 2 columns on desktop, 1 column on mobile */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username field with validation */}
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
                    <p className="text-xs text-red-400 mt-1">Solo letras, máximo 25 palabras</p>
                  )}
                </motion.div>

                {/* Email (not editable) */}
                <motion.div
                  className="p-3 bg-black rounded-lg shadow-lg text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="block text-sm font-semibold">Correo Electrónico</span>
                  <span className="block text-lg">{session?.user?.email || "No disponible"}</span>
                </motion.div>

                {/* Phone field with validation */}
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

                {/* Birth date */}
                <motion.div
                  className="p-3 bg-black rounded-lg shadow-lg text-white"
                  whileHover={{ scale: 1.05 }}
                >
                  <label htmlFor="birthDate" className="block text-sm font-semibold">Fecha de Nacimiento</label>
                  <input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full mt-1 p-1 bg-black text-white rounded-md [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </motion.div>

                {/* Gender selection */}
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

                {/* Update button with validation state - Full width on both desktop and mobile */}
                <motion.button
                  className={`col-span-1 md:col-span-2 text-2xl px-7 py-2 rounded-md shadow-md font-semibold transition-all ${
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
          {showModal && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }} 
              transition={{ duration: 0.3 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4"
            >
              <div className="bg-black p-6 rounded-2xl shadow-lg flex flex-col items-center gap-3 w-full max-w-sm">
                <User className="w-12 h-12 text-[#A0753A]" />
                <h2 className="text-xl font-semibold text-white text-center">¡Datos Actualizados!</h2>
                <p className="text-sm text-[#A0753A] text-center">Tu perfil ha sido actualizado correctamente.</p>
              </div>
            </motion.div>
          )}



       {selectedSection === "credito" && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8 }}
    className=" bg-gradient-to-br  p-6"
  >
    {/* Header con animación */}
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="text-center mb-8"
    >
      <h1 className="text-5xl font-black text-black mb-2">
        Tu Cartera Digital
      </h1>
      <div className="w-24 h-1 bg-[#A0753A] mx-auto rounded-full"></div>
    </motion.div>

    {/* Tarjeta principal de balance */}
    <motion.div
      initial={{ rotateX: -15, opacity: 0 }}
      animate={{ rotateX: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.8 }}
      className="max-w-md mx-auto mb-8"
    >
      <div className="relative bg-gradient-to-br from-black via-gray-900 to-black rounded-3xl p-8 shadow-2xl transform hover:scale-105 transition-all duration-300 border border-[#A0753A]/20">
        {/* Decoración de fondo */}
        <div className="absolute inset-0 bg-[#A0753A]/5 rounded-3xl"></div>
        <div className="absolute top-4 right-4 w-20 h-20 bg-[#A0753A]/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-[#A0753A]/10 rounded-full blur-lg"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[#A0753A] text-sm font-medium">Balance Total</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-[#A0753A] rounded-full animate-pulse"></div>
              <span className="text-[#A0753A]/80 text-xs">Activo</span>
            </div>
          </div>
          
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
              className="text-6xl font-black text-[#A0753A] mb-2 drop-shadow-lg"
            >
              {session?.user?.stars || 0}
            </motion.div>
            <div className="text-white/90 text-xl font-semibold">Somicoins</div>
          </div>
          
          <div className="mt-6 pt-4 border-t border-[#A0753A]/30">
            <button 
              onClick={() => window.location.href = '/Pagar'}
              className="flex justify-center items-center px-6 py-3 bg-gradient-to-r from-[#A0753A] to-[#B8864A] text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:from-[#8B6532] hover:to-[#A0753A] transform hover:scale-105 transition-all duration-300 ease-in-out"
            >
              <span>Consigue más</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>

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