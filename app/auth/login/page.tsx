import Image from "next/image";
import Footer from "@/components/footer";
import Link from "next/link";
import { signinWithGoogle } from "@/lib/actions";

export default function LoginPage() {
  


  return (
    <>
      <main>
        <div className="flex xl:flex-row flex-col">
          <section id="welcome" className="flex w-full h-8/12 text-center lg:text-start lg:h-[80vh] xl:h-screen h-[30rem] bg-[#fbfaf8]"
            style={{
            backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)',
            backgroundSize: "20px 20px"
            }}
          >
            <div className="flex flex-col my-auto mx-auto w-md xl:pb-8 items-center lg:items-start">
              <Image
                src="/assets/logos/ACE CARDS logo.png"
                alt="ACE CARDS Logo"
                className="w-28 h-28 inline-block mb-4"
                width={1000}
                height={1000}
              />
              <h1 className="font-extrabold text-black text-2xl lg:text-3xl">Welcome to the<br/>
                <span className="text-[#011638]/80 text-6xl">ACE CARDS</span> <br/>
                <span className="text-4xl lg:text-5xl">User Login Area</span>
              </h1>
              <p className="mt-6 text-slate-600 text-lg max-w-sm w-full mx-auto lg:mx-0">
                Access your personalized dashboard, manage your submissions, and stay connected with the organization.
              </p>
            </div>
          </section>

          <section id="login-form" className="flex w-full xl:w-1/2 lg:h-screen xl:h-screen h-[30rem] bg-[#011638]/80 text-slate-600">
            <div className="flex flex-col my-auto mx-auto w-sm justify-center items-center rounded-3xl bg-white p-10 shadow-lg">
              <span className="text-2xl font-medium text-center">
                <span className="text-3xl font-bold text-slate-900"> Let's stay connected!</span> <br/>
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
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 20 20" 
                  fill="currentColor" 
                  className="size-6">
                  <path 
                    fillRule="evenodd"
                    d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
                    clipRule="evenodd"/>
                </svg>

                <span className="text-xl">
                  <Link href="/">or Go back to Home Page?</Link>
                </span>
              </div>
            </div>

          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}