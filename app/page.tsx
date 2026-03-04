import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
=======
          </div>

        </div>
      </section>
        
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