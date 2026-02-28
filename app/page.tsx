import Image from "next/image";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="">
      <NavBar />
      <main className="">
        <section id="hero" className="justify-center items-center text-center py-20 bg-white h-screen">
          <h1 className="text-3xl font-bold text-black">Welcome to ACE CARDS!</h1>
          <p className="text-lg mt-4 text-black">This is the home page of our card game application.</p>
        </section>
        
        <section id="wow" className="justify-center items-center text-center py-20 bg-yellow-500 h-screen">
          <h1 className="text-3xl font-bold">Welcome to ACE CARDS!</h1>
          <p className="text-lg mt-4">This is the home page of our card game application.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
