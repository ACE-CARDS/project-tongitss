export default function ApplicationHero() {
  return (
    <section className="relative pt-40 pb-20 px-5 flex flex-col items-center justify-center text-center overflow-hidden min-h-[60vh]">
      
      <div 
        className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#011638 2px, transparent 2px)', backgroundSize: '30px 30px' }}
      ></div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <h1 className="text-5xl lg:text-7xl font-extrabold text-[#011638] uppercase border-b-8 border-[#011638] pb-4 mb-4 inline-block tracking-tight">
          MEMBER<br />APPLICATION
        </h1>
        
        <p className="text-red-500 font-bold tracking-widest uppercase mb-12 text-lg">
          STATUS: OPEN
        </p>

        <div className="w-full max-w-2xl border-4 border-[#011638] rounded-3xl py-16 px-5 bg-white shadow-[8px_8px_0px_0px_rgba(1,22,56,1)] transition-transform hover:-translate-y-1 hover:shadow-[12px_12px_0px_0px_rgba(1,22,56,1)]">
          <h2 className="text-4xl lg:text-6xl font-bold text-[#011638] tracking-widest">
            DEADLINE
          </h2>
          <p className="mt-4 text-xl text-gray-600 font-medium">To Be Announced</p>
        </div>
      </div>
    </section>
  );
}