import Link from 'next/link';

const Bienvenida = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-6">Bienvenido a Mi App</h1>
      
      <div className="flex space-x-4">
        <Link href="/register">
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">Registro</button>
        </Link>
        <Link href="/login">
          <button className="bg-green-500 text-white px-4 py-2 rounded-lg">Iniciar Sesión</button>
        </Link>
      </div>
    </div>
  );
};

export default Bienvenida;
    