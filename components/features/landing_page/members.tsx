import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import GradientLine from "@/components/ui/gradientLine";

export default function Members({id}: {id?: string}) {
  const supabase = createClient();
  const [memberDisplayCount, setMemberDisplayCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);
  const memberSectionRef = useRef(null);
  const [hasMemberAnimated, setHasMemberAnimated] = useState(false);
  const hasMembersAnimated = useRef(false);

  useEffect(() => {
    setMemberDisplayCount(0);
    setHasMemberAnimated(false);
  }, []);

  const getCurrentAcademicYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    //around oct siya since mostly september ang membership drive
    if (month >= 10) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  };

  const CURRENT_AY = `AY ${getCurrentAcademicYear()}`;
  const FIXED_MEMBER_AY = CURRENT_AY; //here ichchange current year for member section

  // fetch member count for current AY
  useEffect(() => {
    const fetchCounts = async () => {
      const { count: memberTotal } = await supabase
        .from("member")
        .select("*", { count: "exact", head: true })
        .eq("acadyear", FIXED_MEMBER_AY);

      setMemberCount(memberTotal || 0);
    };

    fetchCounts();
  }, []);

  // count animation for members
  useEffect(() => {
    // 1. Wait until we actually have a count to animate to
    if (memberCount === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        // 2. Only run once
        if (hasMembersAnimated.current) return;
        
        // Double check count is valid
        if (memberCount > 0) {
          hasMembersAnimated.current = true;

          let start = 0;
          const target = memberCount;
          const duration = 500;
          const increment = target / (duration / 16);

          const interval = setInterval(() => {
            start += increment;

            if (start >= target) {
              setMemberDisplayCount(target);
              clearInterval(interval);
            } else {
              setMemberDisplayCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.5 },
    );

    if (memberSectionRef.current) observer.observe(memberSectionRef.current);

    return () => observer.disconnect();
    // Dependency on memberCount ensures this restarts once data is fetched
  }, [memberCount]);

  return (
    <section
      id={id}
      ref={memberSectionRef}
      className="py-8 px-6 lg:px-24 relative w-full mx-auto bg-[#fbfaf8] justify-center items-center"
      style={{
        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 1px)`,
        backgroundSize: "20px 20px",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="w-full mx-auto mb-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-20">
          {/* img */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="/assets/logos/ga.jpg"
                alt="Members"
                className="w-full max-w-lg lg:max-w-3xl rounded-3xl object-cover shadow-2xl ring-8 ring-white/70 hover:scale-105 transition-all duration-700 hover:shadow-4xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#011638]/20 to-transparent rounded-3xl"></div>
            </div>
          </div>

          {/* txt */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left relative">
            <h1 className="text-9xl lg:text-[180px] font-black text-[#011638] tracking-tight drop-shadow-2xl leading-none">
              {memberDisplayCount}
            </h1>
            
            <span className="header">
              Current Members
            </span>

            <GradientLine start />

            <p className="mt-8 text-[#141414]/80 text-lg leading-relaxed backdrop-blur-sm bg-white/70 px-8 py-6 rounded-2xl shadow-xl">
              A growing network of DOST CAR scholars committed to academic <br />
              excellence and servant leadership.
            </p>

            <div className="flex lg:flex-row flex-col justify-center lg:justify-start gap-6 mt-12">
              <Link
                href="/committee"
                onClick={() =>
                  sessionStorage.setItem(
                    "returnToHomeSection",
                    "members-section",
                  )
                }
                className="btn-blue"
              >
                Committees→
              </Link>

              <Link
                href="/executives"
                onClick={() =>
                  sessionStorage.setItem(
                    "returnToHomeSection",
                    "members-section",
                  )
                }
                className="btn-blue"
              >
                Executives→
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
};