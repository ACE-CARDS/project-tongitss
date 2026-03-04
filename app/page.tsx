import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <main className="">

        <section id="wow" className="justify-center items-center text-center py-20 bg-blue-500 h-screen">
          <h1 className="text-3xl font-bold">[NEWS AND MEDIA]</h1>
        </section>

        <section className="relative bg-white h-screen flex items-center justify-center overflow-hidden">

          <div className="text-center z-10">
            <h1 className="text-[200px] font-bold text-[#011638]">67</h1>
            <h1 className="text-9xl font-bold text-[#011638]">EVENTS</h1>
            <button className="mt-7 px-15 py-2 border border-gray-900 rounded-full hover:bg-gray-100 transition">
              →
            </button>
          </div>

          <div className="absolute top-10 left-15 rotate-12 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute top-15 left-90 -rotate-3 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute top-15 right-90 -rotate-3 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute top-15 right-20 rotate-3 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute bottom-15 left-30 rotate-3 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>

          <div className="absolute bottom-16 right-35 -rotate-12 transition-transform duration-300 hover:-translate-y-4">
            <img
              src="/placeholder1.jpg"
              width={150} 
              height={220} 
              className="w-60 h-80 object-cover rounded-lg shadow-xl"
            />
          </div>
        </section>
      </main>
    </div>
  );
}