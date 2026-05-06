import Link from 'next/link';
import NavBar from '@/components/navbar';
import Image from 'next/image';
import Footer from '@/components/footer';

export default function NotFound() {
  return (
    <>
    <NavBar />
    <div className="w-full mx-auto max-w-[1920px] bg-[#fbfaf8]"
      style={{
        backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed"
      }}>

      <div className="flex flex-col xl:flex-row items-center justify-center pb-10 min-h-screen gap-0">
        <Image
          src="/images/Search.png"
          alt="Kidla 404"
          className="w-40 sm:w-50 md:w-60 lg:w-80 xl:w-100"
          width={2048}
          height={2048}
        />
        <span className='-mt-10 text-center'>
          <h1 className="text-[60px] xl:text-[70px] font-bold font-oswald flex flex-col xl:flex-row items-center xl:items-end justify-center xl:gap-4"><span className='text-[120px] xl:pb-0 -mb-4'>404</span> Page Not Found</h1>
          <p className="mt-2 text-gray-600 text-2 md:text-2xl lg:text-3xl">Oops! The page you are looking for doesn't exist.</p>
        </span>
      </div>

    </div>
    <Footer />
    </>
  );
}