//ps. hehe di pa sha db as in hard coded palang ito so palitan q nalang sa prototype 2 

"use client";

import { useState } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";

export default function Executives() {
  const executivesByYear = {
    "AY 2025-2026": [
      {
        name: "JOLO ADAM ROQUE",
        position: "Regional Director",
        video: "/assets/logos/executives/joloacad.mp4", 
        linkedin: "https://linkedin.com/",
        email: "mailto:2240500@slu.edu.ph",
        facebook: "https://www.facebook.com/joloadam.roque",
      },
      {
        name: "JAERISH KYLE RABANG",
        position: "Internal Affairs Director",
        image: "/assets/logos/executives/jae.png", 
        linkedin: "https://linkedin.com/",
        email: "mailto:jlrabang@up.edu.ph",
        facebook: "facebooklink.com",
      },
      {
        name: "SAFFI LIMBARO",
        position: "Internal Affairs Deputy Director",
        image: "/assets/logos/executives/saffi.png", 
        linkedin: "https://linkedin.com/",
        email: "mailto:juan@email.com",
        facebook: "facebooklink.com",
      },
      {
        name: "ABBY GAIL AGUAS",
        position: "External Affairs Director",
        image: "/assets/logos/executives/abby.png", 
        linkedin: "https://linkedin.com/",
        email: "mailto:juan@email.com",
        facebook: "facebooklink.com",
      },
      {
        name: "EZRAH JANSEN DE GUZMAN",
        position: "External Affairs Deputy Director",
        image: "/assets/logos/executives/ezrah.png", 
        linkedin: "https://linkedin.com/",
        email: "mailto:juan@email.com",
        facebook: "facebooklink.com",
      },
      {
        name: "KIRZTEN AVRIL ALVAREZ",
        position: "Finance and Business Deputy",
        image: "/assets/logos/executives/krizten.png", 
        linkedin: "https://linkedin.com/",
        email: "mailto:juan@email.com",
        facebook: "facebooklink.com",
      },
      {
        name: "JOSE MARICARL ALVAREZ",
        position: "Education and Research Head",
        image: "/assets/logos/executives/jose.jpg", 
        linkedin: "https://linkedin.com/",
        email: "mailto:juan@email.com",
        facebook: "facebooklink.com",
      },
      {
        name: "YRON JOSHUA SILVA",
        position: "Education and Research Deputy",
        image: "/assets/logos/executives/yron.jpg", 
        linkedin: "https://linkedin.com/",
        email: "mailto:juan@email.com",
        facebook: "facebooklink.com",
      },
      {
        name: "KENASHII PIA",
        position: "Events and Logistics Head",
        image: "/assets/logos/executives/kenashii.png", 
        linkedin: "https://linkedin.com/",
        email: "mailto:juan@email.com",
        facebook: "facebooklink.com",
      },
    ],
    "AY 2024-2025": [
      {
        name: "FARMER GEORGE",
        position: "Regional Director",
        image: "/assets/logos/executives/delete/george.jpg",
        linkedin: "https://linkedin.com/",
        email: "mailto:maria@email.com",
        facebook: "facebooklink.com",
      },
      {
        name: "QUEEN CHARLOTTE",
        position: "Internal Affairs Director",
        image: "/assets/logos/executives/delete/charlotte.jpg",
        linkedin: "https://linkedin.com/",
        email: "mailto:maria@email.com",
        facebook: "facebooklink.com",
      },
      {
        name: "LADY DANBURY",
        position: "Internal Affairs Deputy Director",
        image: "/assets/logos/executives/delete/danbury.png",
        linkedin: "https://linkedin.com/",
        email: "mailto:maria@email.com",
        facebook: "facebooklink.com",
      },
    ],
    "AY 2023-2024": [
        {
            name: "ANTHONY BRIDGERTON",
            position: "Regional Director",
            image: "/assets/logos/executives/delete/a.jpg",
            linkedin: "https://linkedin.com/",
            email: "mailto:maria@email.com",
            facebook: "facebooklink.com",
          },
          {
            name: "BENEDICT BRIDGERTON",
            position: "Internal Affairs Director",
            image: "/assets/logos/executives/delete/b.jpg",
            linkedin: "https://linkedin.com/",
            email: "mailto:maria@email.com",
            facebook: "facebooklink.com",
          },
          {
            name: "COLIN BRIDGERTON",
            position: "Internal Affairs Deputy Director",
            image: "/assets/logos/executives/delete/c.jpg",
            linkedin: "https://linkedin.com/",
            email: "mailto:maria@email.com",
            facebook: "facebooklink.com",
          },
    ],
    "AY 2022-2023": [
        {
            name: "DAPHNE BRIDGERTON",
            position: "Regional Director",
            image: "/assets/logos/executives/delete/d.jpg",
            linkedin: "https://linkedin.com/",
            email: "mailto:maria@email.com",
            facebook: "facebooklink.com",
          },
          {
            name: "ELOISE BRIDGERTON",
            position: "Internal Affairs Director",
            image: "/assets/logos/executives/delete/e.jpg",
            linkedin: "https://linkedin.com/",
            email: "mailto:maria@email.com",
            facebook: "facebooklink.com",
          },
          {
            name: "FRANCESCA BRIDGERTON",
            position: "Internal Affairs Deputy Director",
            image: "/assets/logos/executives/delete/f.jpg",
            linkedin: "https://linkedin.com/",
            email: "mailto:maria@email.com",
            facebook: "facebooklink.com",
          },
    ],
  };

  const [selectedAY, setSelectedAY] = useState("AY 2025-2026"); 
  const executives = executivesByYear[selectedAY];

  const socialIcons = [
    { href: "linkedin", icon: "/assets/logos/linkedin.jpg", alt: "LinkedIn" },
    { href: "email", icon: "/assets/logos/gmail.jpg", alt: "Email" },
    { href: "facebook", icon: "/assets/logos/facebook1.jpg", alt: "Facebook" },
  ];

  // ayan need pala ng pang check if video amp ang arte eno papalitan din naman pag nag db na balew
  const isVideo = (src) => src && /\.(mp4)$/i.test(src);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <NavBar />
      
      <main className="flex-grow px-4 sm:px-8 lg:px-20 py-20">
        {/* title */}
        <div className="text-center mb-20">
          <h1 className="text-5xl lg:text-7xl font-black bg-gradient-to-r from-gray-900 via-black to-slate-900 bg-clip-text text-transparent mb-6">
            Our Executives
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Meet the visionary leaders shaping our organization across academic years
          </p>
        </div>

        {/* AY filter */}
        <div className="flex justify-center mb-20">
          <div className="relative">
            <select
              className="appearance-none bg-white/80 backdrop-blur-xl px-8 py-4 border-4 border-black/20 shadow-2xl rounded-3xl text-xl font-semibold text-slate-800 focus:outline-none focus:border-black/50 transition-all duration-300 hover:shadow-3xl hover:scale-[1.02] cursor-pointer min-w-[280px]"
              value={selectedAY}
              onChange={(e) => setSelectedAY(e.target.value)}
            >
              {Object.keys(executivesByYear).map((year) => (
                <option key={year}>{year}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* execs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {executives.map((exec, index) => (
            <div
              key={index}
              className="group relative bg-slate-50/30 rounded-3xl border-4 border-slate-200/60 shadow-2xl hover:shadow-4xl hover:-translate-y-3 hover:scale-[1.015] transition-all duration-500 overflow-hidden max-w-sm mx-auto"
            >
              {/* bg */}
              <div 
                className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-500"
                style={{
                  backgroundImage: 'url("/assets/logos/ACE CARDS logo.png")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              />
              
              {/* Video/Image */}
              <div className="p-8 pt-20 relative z-10">
                <div className="w-48 h-56 mx-auto overflow-hidden rounded-3xl border-8 border-white shadow-2xl group-hover:border-slate-100/80 transition-all duration-500 bg-white/95 backdrop-blur-sm">
                  {isVideo(exec.video) ? (
                    // VIDEO PLAYER
                    <video
                      src={exec.video}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : exec.image ? (
                    // IMAGE
                    <img
                      src={exec.image}
                      alt={exec.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    // PLACEHOLDER pag dili nag wowork
                    <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                      <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* name and position */}
              <div className="p-8 pb-12 relative z-20">
                <h3 className="text-3xl font-black text-slate-900 mb-3 group-hover:text-4xl transition-all duration-300 text-center leading-tight drop-shadow-sm">
                  {exec.name}
                </h3>
                <p className="text-xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent mb-10 text-center tracking-wide drop-shadow-sm">
                  {exec.position}
                </p>

                {/* socmeds */}
                <div className="flex gap-6 justify-center">
                  {socialIcons.map(({ href, icon, alt }, i) => {
                    const link = href === 'email' ? exec.email : 
                                href === 'linkedin' ? exec.linkedin : 
                                exec.facebook || '#';
                    
                    return (
                      <a
                        key={i}
                        href={link}
                        target={href !== 'email' ? "_blank" : "_self"}
                        rel={href !== 'email' ? "noopener noreferrer" : undefined}
                        className="group/social w-16 h-16 flex items-center justify-center rounded-3xl border-4 border-white/80 backdrop-blur-md bg-white/95 hover:bg-gradient-to-r hover:from-slate-900 hover:to-black hover:border-transparent hover:shadow-3xl hover:scale-125 transition-all duration-400 shadow-xl z-30"
                      >
                        <img 
                          src={icon} 
                          alt={alt} 
                          className="w-7 h-7 group-hover/social:scale-110 transition-transform duration-300 drop-shadow-sm" 
                        />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
