export default function AboutOrg() {
  return (
    <section id="about-org" className="bg-[#eff0f2] min-h-screen flex flex-col pt-16">

      <div className="w-full h-[40vh] lg:h-[50vh] relative shadow-md overflow-hidden">
        <img  
          src="/org-group.jpg"  
          alt="A group photograph of organization members posing in a forest with a flag"
          className="w-full h-full object-cover" 
        />
      </div>

      <div className="flex-1 flex flex-col items-center text-center px-10 py-16">
        <h1 
          className="text-[#011638] text-6xl lg:text-8xl font-extrabold uppercase tracking-tight" 
          style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.1)' }}
        >
          THE ORG
        </h1>
        
        <div className="mt-8 text-lg lg:text-xl text-gray-700 max-w-4xl leading-relaxed">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </div>
      </div>

    </section>
  );
}