import Image from "next/image";
import Footer from "@/components/footer";
import Link from "next/link";
import { signinWithGoogle } from "@/lib/actions";

export default function LoginPage() {
  return (
    <div>
      <main>
        <div className="flex md:flex-row flex-col">
          <section id="welcome" className="flex w-full lg:h-screen md:h-screen h-[30rem] bg-white">
            <div className="flex flex-col my-auto mx-auto w-sm">
              <Image
                src="/assets/logos/ACE CARDS logo.png"
                alt="ACE CARDS Logo"
                className="w-28 h-28 inline-block mb-4"
                width={1000}
                height={1000}
              />
              <h1 className="font-bold text-black text-3xl">Welcome to the<br/>
                <span className="text-5xl">ACE CARDS' User Area</span>
              </h1>

              <ul className="flex flex-row gap-3 lg:mt-30 md:mt-20 mt-10 ml-2 text-gray-700">
                <li>A</li>
                <li>A</li>
                <li>A</li>
                <li>A</li>
                <li>A</li>
              </ul>
            </div>
          </section>

          <section id="login-form" className="flex w-full lg:h-screen md:h-screen h-[30rem] bg-blue-500 text-white">
            <div className="flex flex-col my-auto mx-auto w-sm justify-center items-center">
              <span className="text-2xl font-medium text-center">
                Let's stay connected!<br/>
                Please sign in to continue.
              </span>
              <form action={signinWithGoogle} >
                <button type="submit" className="mt-10 bg-blue-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors cursor-pointer">
                  Sign In With Google
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
    </div>
  );
}