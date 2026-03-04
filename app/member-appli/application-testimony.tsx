export default function ApplicationTestimony() {
  return (
    <section className="relative py-32 px-5 flex flex-col items-center justify-center overflow-hidden min-h-screen">
      
      <div 
        className="absolute inset-0 z-0 opacity-30 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#011638 2px, transparent 2px)', backgroundSize: '30px 30px' }}
      ></div>

      <div className="relative z-10 w-full max-w-5xl text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-[#011638] uppercase border-b-4 border-[#011638] inline-block pb-2 mb-20 tracking-wide">
          Testimony from Scholar
        </h2>

        <div className="relative w-full max-w-3xl mx-auto aspect-video bg-white border-4 border-[#011638] shadow-2xl flex items-center justify-center rounded-xl overflow-hidden">
          <span className="text-6xl font-extrabold text-[#011638] z-10">VID</span>
          
          <svg className="absolute inset-0 w-full h-full text-[#011638]/20 pointer-events-none" preserveAspectRatio="none">
            <line x1="0" y1="0" x2="100%" y2="100%" stroke="currentColor" strokeWidth="4" />
            <line x1="100%" y1="0" x2="0" y2="100%" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>
        <div className="absolute top-40 left-10 lg:left-20 text-xl font-bold text-[#011638]/40 -rotate-12 select-none">quotes</div>
        <div className="absolute top-52 right-10 lg:right-20 text-xl font-bold text-[#011638]/40 rotate-12 select-none">quotes</div>
        <div className="absolute bottom-40 left-5 lg:left-32 text-xl font-bold text-[#011638]/40 rotate-6 select-none">quotes</div>
        <div className="absolute bottom-20 right-10 lg:right-40 text-xl font-bold text-[#011638]/40 -rotate-6 select-none">quotes</div>
        <div className="absolute bottom-10 left-20 lg:left-64 text-xl font-bold text-[#011638]/40 rotate-12 select-none">quotes</div>
      </div>

      <div className="absolute bottom-0 right-0 z-20 w-48 h-48 lg:w-72 lg:h-72 drop-shadow-2xl">
        <img 
        src="/mascot.png" 
        alt="Ace Cards Mascot" 
        className="w-full h-full object-contain" 
        />
      </div>

    </section>
  );
}