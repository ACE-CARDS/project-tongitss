import Image from "next/image";
import Footer from "@/components/layout/footer";
import Link from "next/link";
import { signinWithGoogle } from "@/utils/actions";
import { BsSuitSpadeFill } from "react-icons/bs";
import BackButton from "@/components/ui/backButton";

export default function LoginPage() {
  return (
    <>
    <div className="max-w-[1920px] mx-auto relative overflow-hidden">
      <div className="flex md:flex-row flex-col w-full min-h-screen max-h-fit bg-white text-slate-600 py-15 items-center justify-center"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          backgroundAttachment: "fixed",
        }}>
          
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <BsSuitSpadeFill className="absolute top-[-5%] right-[-5%] rotate-12 size-40 md:size-64 text-slate-600/70" />
            
            <BsSuitSpadeFill className="absolute top-8/12 -left-20 -rotate-12 size-60 md:size-96 text-slate-600/70" />
            
            <BsSuitSpadeFill className="absolute top-1/4 left-10 -rotate-[13deg] size-32 text-slate-600/70" />

            <BsSuitSpadeFill className="absolute top-1/12 left-[40%] rotate-[-13deg] size-30 text-slate-600/70" />

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
            bg-[#011638]/80 h-full md:p-10 p-8">
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
              <p className="mt-6 text-white text-lg max-w-sm mx-auto w-full md:mx-0 text-[18px] xl:text-md">
                Access your personalized dashboard, manage your submissions, and stay connected with the organization.
              </p>
            </section>

            <section className="md:w-[300px] relative bg-[#eff0f2] w-full md:p-10 p-8 flex flex-col items-center justify-center md:items-start md:text-left">
              
              <span className="md:text-2xl text-xl font-medium">
                <span className="md:text-3xl text-2xl font-bold text-slate-900">
                  Let's stay connected!
                </span>
                <br/>
                Please sign in to continue.
              </span>
              <form action={signinWithGoogle}>
                <button 
                  type="submit" 
                  className="w-full mt-10 cursor-pointer flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 shadow-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                  </svg>
                  Sign in with Google
                </button>
              </form>
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