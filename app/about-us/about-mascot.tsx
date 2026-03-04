export default function AboutMascot() {
  return (
    <section id="about-mascot" className="relative bg-white h-screen flex flex-col lg:flex-row items-center justify-center overflow-hidden px-10 lg:px-20">
      
      <div className="flex-1 text-center lg:text-left z-10">
        <h2 className="text-3xl lg:text-5xl font-bold text-blue-500 mb-2">MEET</h2>
        <h1 className="text-6xl lg:text-[120px] leading-none font-extrabold text-[#011638] mb-6">
          THE <br/> MASCOT
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vitae elit libero, a pharetra augue. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Curabitur blandit tempus porttitor. Nullam id dolor id nibh ultricies vehicula ut id elit.
        </p>
        <button className="px-10 py-3 border-2 border-[#011638] text-[#011638] font-bold rounded-full hover:bg-[#011638] hover:text-white transition cursor-pointer">
          Say Hello →
        </button>
      </div>

      <div className="flex-1 flex justify-center mt-10 lg:mt-0 relative z-20">
        <img 
          src="/placeholder1.jpg" 
          className="w-[300px] h-[300px] lg:w-[500px] lg:h-[500px] object-cover rounded-3xl shadow-2xl" 
          alt="Ace Cards Mascot" 
        />
      </div>

    </section>
  );
}