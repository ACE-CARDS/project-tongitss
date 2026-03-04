=======
export default function Footer() {
  return (
    <footer className="w-full bg-[#011638] text-white py-8">
      <div className="container mx-auto flex justify-center items-center text-sm">
        &copy; {new Date().getFullYear()} ACE CARDS. All rights reserved.
      </div>
    </footer>
  );
}
