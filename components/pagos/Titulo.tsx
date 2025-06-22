'use client'
// components/pagos/Titulo.tsx
export default function Titulo() {
  return (
    <div className={'bg-[#A07526] hover:scale-105 cursor-pointer rounded-lg shadow-md overflow-hidden transition-transform duration-200'}>
      {/* Contenedor principal adaptable */}
      <div className={'min-h-64 md:min-h-80 p-6 flex flex-col justify-between'}>
        <div className={'flex-grow'}>
          <h2 className={'text-3xl font-bold mb-4 text-center text-[#000000]'}>Titulo</h2>
          {/* Información del curso */}
          <div className={'space-y-3 text-white'}>
            <p className={'text-sm flex items-start'}>
              <span className={'mr-2'}>✓</span>
              <span>Acceso completo al curso</span>
            </p>
            <p className={'text-sm flex items-start'}>
              <span className={'mr-2'}>✓</span>
              <span>Videos en alta calidad</span>
            </p>
            <p className={'text-sm flex items-start'}>
              <span className={'mr-2'}>✓</span>
              <span>Ejercicios prácticos</span>
            </p>
            <p className={'text-sm flex items-start'}>
              <span className={'mr-2'}>✓</span>
              <span>Soporte 24/7</span>
            </p>
            <p className={'text-sm flex items-start'}>
              <span className={'mr-2'}>✓</span>
              <span>Certificado de finalización</span>
            </p>
            {/* Puedes agregar más elementos aquí y el contenedor se adaptará */}
            <p className={'text-sm flex items-start'}>
              <span className={'mr-2'}>✓</span>
              <span>Acceso de por vida</span>
            </p>
            <p className={'text-sm flex items-start'}>
              <span className={'mr-2'}>✓</span>
              <span>Actualizaciones gratuitas</span>
            </p>
          </div>
        </div>
        
        {/* Precio siempre al final */}
        <div className={'mt-6 flex-shrink-0'}>
          <p className={'text-4xl font-bold text-black text-center mb-2'}>$3.99</p>
        </div>
      </div>
      
      {/* Botón */}
      <div className={'p-4 bg-[#6b4a12]'}>
        <button className={'w-full bg-[#000000] hover:scale-105 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200'}>
          Comprar Titulo
        </button>
      </div>
    </div>
  );
}