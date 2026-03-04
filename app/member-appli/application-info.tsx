export default function ApplicationInfo() {
  return (
    <section className="py-24 bg-[#eff0f2] px-5 relative overflow-hidden border-y-4 border-[#011638]">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-12 lg:gap-20 items-center justify-center relative">

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white border-2 border-[#011638] rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#011638] mb-6 text-center">General Reminders</h3>
            <ul className="space-y-4 text-lg text-gray-700 font-medium">
              <li className="flex items-start gap-3">
                <span className="text-2xl">📌</span> 
                <span>Ensure all application documents are fully completed and signed.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">📌</span> 
                <span>Double-check your contact information before submitting.</span>
              </li>
            </ul>
          </div>

          <div className="absolute -bottom-16 -left-12 rotate-[-15deg] pointer-events-none hidden md:block opacity-50">
            <div className="w-32 h-40 border-2 border-[#011638] rounded-lg absolute bg-transparent"></div>
            <div className="w-32 h-40 border-2 border-[#011638] rounded-lg absolute left-10 top-5 rotate-12 bg-transparent"></div>
          </div>
        </div>

        <div className="w-full max-w-md relative z-10 mt-10 lg:mt-32">
          <div className="absolute -top-20 -right-12 rotate-[15deg] pointer-events-none hidden md:block opacity-50">
            <div className="w-32 h-40 border-2 border-[#011638] rounded-lg absolute bg-transparent"></div>
            <div className="w-32 h-40 border-2 border-[#011638] rounded-lg absolute right-10 top-5 -rotate-12 bg-transparent"></div>
          </div>

          <div className="bg-white border-2 border-[#011638] rounded-3xl p-8 shadow-lg">
            <h3 className="text-2xl font-bold text-[#011638] mb-6 text-center">Instructions</h3>
            <ul className="list-disc list-inside space-y-3 text-lg text-gray-700 font-medium ml-4">
              <li>Insert</li>
              <li>Here</li>
              <li>Do</li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}