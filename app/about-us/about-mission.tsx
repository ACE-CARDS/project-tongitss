export default function AboutMission() {
  return (
    <section id="about-mission" className="relative flex flex-col justify-center items-center text-center py-20 bg-[#2b6fed] h-screen overflow-hidden">
      
      <div className="max-w-4xl px-5 z-10 p-8 rounded-3xl backdrop-blur-sm bg-black/5">
        <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 tracking-wide">
          [ OUR MISSION ]
        </h1>
        <p className="text-white text-lg lg:text-2xl leading-relaxed font-medium shadow-sm">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa.
        </p>
      </div>

      <div className="absolute top-10 left-10 -rotate-12 transition-transform duration-300 hover:-translate-y-4 hover:scale-105 hover:z-20 hidden lg:block">
        <img src="/placeholder1.jpg" className="w-72 h-96 object-cover rounded-xl shadow-2xl border-8 border-white bg-white" alt="Mission Card 1" />
      </div>

      <div className="absolute bottom-10 left-24 rotate-6 transition-transform duration-300 hover:-translate-y-4 hover:scale-105 hover:z-20 hidden lg:block">
        <img src="/placeholder1.jpg" className="w-72 h-96 object-cover rounded-xl shadow-2xl border-8 border-white bg-white" alt="Mission Card 2" />
      </div>

      <div className="absolute top-10 right-10 rotate-12 transition-transform duration-300 hover:-translate-y-4 hover:scale-105 hover:z-20 hidden lg:block">
        <img src="/placeholder1.jpg" className="w-72 h-96 object-cover rounded-xl shadow-2xl border-8 border-white bg-white" alt="Mission Card 3" />
      </div>

      <div className="absolute bottom-10 right-24 -rotate-6 transition-transform duration-300 hover:-translate-y-4 hover:scale-105 hover:z-20 hidden lg:block">
        <img src="/placeholder1.jpg" className="w-72 h-96 object-cover rounded-xl shadow-2xl border-8 border-white bg-white" alt="Mission Card 4" />
      </div>

    </section>
  );
}