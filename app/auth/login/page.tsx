import Image from "next/image";
import Footer from "@/components/layout/footer";
import Link from "next/link";
import { signinWithGoogle } from "@/utils/actions";
import { BsSuitSpadeFill } from "react-icons/bs";
import BackButton from "@/components/ui/backButton";
import GoogleSignInButton from "@/components/ui/auth/google-signin-button";

export default function LoginPage() {
  return (
    <>
    <div className="max-w-[1920px] mx-auto relative overflow-hidden">
      <div className="flex md:flex-row flex-col w-full min-h-dvh md:min-h-screen bg-white text-slate-600 py-15 items-center justify-center"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}>
          
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <BsSuitSpadeFill className="absolute top-[-5%] right-[-5%] rotate-12 size-40 md:size-64 text-slate-600/70" />
            
            <BsSuitSpadeFill className="absolute top-8/12 -left-20 -rotate-12 size-60 md:size-96 text-slate-600/70" />
            
            <BsSuitSpadeFill className="absolute top-1/4 left-10 rotate-[13deg] size-40 text-slate-600/70" />
            
            <BsSuitSpadeFill className="absolute top-1/12 left-[40%] rotate-[-15deg] size-30 text-slate-600/70" />

            <BsSuitSpadeFill className="absolute top-1/5 right-[18%] rotate-[-15deg] size-60 text-slate-600/70" />

            <BsSuitSpadeFill className="absolute top-2/4 right-10 rotate-[13deg] size-28 text-slate-600/70" />

            <BsSuitSpadeFill className="absolute top-3/4 right-32 -rotate-[6deg] size-40 text-slate-600/70" />
          </div>

          <div className="
          flex flex-col md:flex-row
          md:w-[700px] sm:w-[450px] w-[300px]
          justify-center
          rounded-3xl shadow-2xl 
          overflow-hidden z-10">
            

            <section className="md:w-[400px] relative w-full flex flex-col 
            items-center text-center md:items-start md:text-left
            bg-[#011638]/80 h-full md:p-10 p-5 sm:p-8 md:p-10">
              <BackButton href="/" className="absolute top-4 right-4"/>
              <Image
                src="/assets/logos/ACE CARDS logo.png"
                alt="ACE CARDS Logo"
                className="md:size-28 size-20 inline-block mb-4"
                width={1000}
                height={1000}
              />
              <h1 className="font-extrabold text-white text-2xl md:text-3xl ">Welcome to the<br/>
                <span className="text-[#d9b237] text-6xl">ACE CARDS</span> <br/>
                <span className="text-4xl md:text-5xl">Login Area</span>
              </h1>
              <p className="mt-6 text-white max-w-sm mx-auto w-full md:mx-0 text-sm sm:text-[18px] xl:text-md">
                Access your personalized dashboard, manage your submissions, and stay connected with the organization.
              </p>
            </section>

            <section className="md:w-[300px] relative bg-[#eff0f2] w-full md:p-10 p-5 sm:p-8 md:p-10 flex flex-col items-center justify-center md:items-start md:text-left">
              
              <span className="md:text-2xl text-xl font-medium">
                <span className="md:text-3xl text-2xl font-bold text-slate-900">
                  Let's stay connected!
                </span>
                <br/>
                Please sign in to continue.
              </span>
              <GoogleSignInButton/>
              <div className="flex flex-row hover:underline hover:cursor-pointer items-center mt-5">


              </div>
            </section>

          </div>

      </div>
    </div>
    <Footer />
    </>
  );
}