import { useEffect, useRef, useState, useMemo } from "react";
import FormDropdown from "@/components/ui/formDropdown";
import FilterDropdown from "@/components/ui/filterDropdown";
import { createClient } from "@/utils/supabase/client";

interface School {
  id: number;
  name: string;
  memberCount: number;
}

export default function Province({ id }: { id?: string }) {
  const supabase = createClient();
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [provinceMembers, setProvinceMembers] = useState(0);

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
  const [selectedAY, setSelectedAY] = useState(CURRENT_AY);

  const currentYear = new Date().getFullYear();
  const academicYears = useMemo(() => {
    const month = new Date().getMonth() + 1;
    return Array.from({ length: 4 }, (_, i) => {
      const startYear = month >= 10 ? currentYear - i : currentYear - 1 - i;
      return `AY ${startYear}-${startYear + 1}`;
    });
  }, [currentYear]);

  // Map Academic Years for the FilterDropdown Component
  const ayOptions = useMemo(() => {
    return academicYears.map((year) => ({
      label: year,
      value: year,
    }));
  }, [academicYears]);

  const [provinces, setProvinces] = useState<string[]>([]);

  // Map Provinces for the FormDropdown Component
  const provinceOptions = useMemo(() => {
    return provinces.map((prov) => ({
      label: prov,
      value: prov,
    }));
  }, [provinces]);

  useEffect(() => {
    const fetchProvinceMembers = async () => {
      if (!selectedProvince) return;

      const { count, error } = await supabase
        .from("member")
        .select("*", { count: "exact", head: true })
        .eq("province", selectedProvince)
        .eq("acadyear", selectedAY);

      if (!error) {
        setProvinceMembers(count || 0);
      }
    };

    fetchProvinceMembers();
  }, [selectedProvince, selectedAY]);

  const [provinceStatus, setProvinceStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    console.log("Fetching active provinces for AY: " + selectedAY);
    const fetchAllActiveProvinces = async () => {
      const { data, error } = await supabase
        .from("member")
        .select("school(province (prov_name))")
        .eq("acadyear", selectedAY)
        .eq("is_active", true);

      console.log("Fetched provinces data:", data);

      if (!error && data) {
        const statusMap = data.reduce((acc: Record<string, boolean>, curr: any) => {
          const name = curr.school?.province?.prov_name;
          if (name) {
            acc[name] = true;
          }
          return acc;
        }, {});

        console.log("Mapped Status Map:", statusMap);
        setProvinceStatus(statusMap);
      }
    };

    fetchAllActiveProvinces();
  }, [selectedAY]);

  const provincesNames = [
    { name: "Abra", left: "38%", top: "43%", translate: "-translate-x-1/2 -translate-y-1/2" },
    { name: "Apayao", left: "52%", top: "27%", translate: "" },
    { name: "Kalinga", left: "58%", top: "46%", translate: "" },
    { name: "Benguet", left: "31%", top: "72%", translate: "" },
    { name: "Ifugao", left: "50%", top: "63%", translate: "" },
    { name: "Mountain Province", left: "53%", top: "56%", translate: "" },
  ];

  const [provinceSchools, setProvinceSchools] = useState<School[]>([]);

  useEffect(() => {
    const fetchProvinceData = async () => {
      let query = supabase
        .from("school")
        .select(`
          id, 
          school_name,
          member!inner(id) 
        `)
        .eq("member.acadyear", selectedAY);

      if (selectedProvince) {
        const { data: prov } = await supabase
          .from("province")
          .select("id")
          .eq("prov_name", selectedProvince)
          .single();

        if (prov) query = query.eq("province", prov.id);
      }

      const { data, error } = await query;

      if (!error && data) {
        const formatted = data.map((s) => ({
          id: s.id,
          name: s.school_name,
          memberCount: s.member.length,
        }));

        const total = formatted.reduce((acc, curr) => acc + curr.memberCount, 0);

        setProvinceMembers(total);
        setProvinceSchools(formatted);
      }
    };

    fetchProvinceData();
  }, [selectedProvince, selectedAY]);

  const handleReset = () => {
    setSelectedProvince(null);
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      const { data, error } = await supabase
        .from("province")
        .select("prov_name")
        .order("prov_name", { ascending: true });

      if (!error && data) {
        setProvinces(data.map((p) => p.prov_name));
      }
    };
    fetchProvinces();
  }, []);

  const [provinceDisplayCount, setProvinceDisplayCount] = useState(0);
  const provinceSectionRef = useRef(null);
  const [provinceAnimKey, setProvinceAnimKey] = useState(0);

  useEffect(() => {
    let start = 0;
    setProvinceDisplayCount(0);
    const end = provinceMembers;
    if (end === 0) return;

    const duration = 1000;
    const incrementTime = 20;
    const step = Math.ceil(end / (duration / incrementTime));

    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setProvinceDisplayCount(end);
        clearInterval(timer);
      } else {
        setProvinceDisplayCount(start);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [provinceMembers]);

  useEffect(() => {
    setProvinceDisplayCount(0);
    setProvinceAnimKey((prev) => prev + 1);
  }, [selectedProvince, selectedAY]);

  return (
    <section
      id={id}
      key={provinceAnimKey}
      ref={provinceSectionRef}
      className="py-10 sm:py-12 xl:py-8 px-4 sm:px-6 xl:px-24 w-full mx-auto bg-gradient-to-br from-[#0a1a3a] to-[#011638] relative"
    >
      {/* Background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(#eec643 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Decorative blur elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#eec643]/10 rounded-full blur-3xl" />

      <div className="w-full mx-auto relative z-10">
        <div className="flex flex-col xl:flex-row items-start lg:items-start justify-between gap-8 lg:gap-16">
          {/* LEFT COLUMN */}
          <div className="flex-1 w-full text-center my-auto xl:text-left">
            {/* Province label */}
            <div className="inline-block lg:inline-block">
              <p className="text-sm sm:text-base tracking-[0.3em] uppercase text-[#eec643] font-semibold mb-2">
                {selectedProvince ? "Province" : "Region"}
              </p>
            </div>

            {/* Province name */}
            <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-white leading-none mb-6">
              {selectedProvince
                ? selectedProvince.toUpperCase()
                : "CORDILLERA ADMINISTRATIVE REGION"}
            </h1>

            {/* Total count and school list */}
            <div className="flex flex-col xl:flex-row items-center xl:items-start gap-6 xl:gap-12">
              {/* Mobile custom dropdown wrappers */}
              <div className="xl:hidden w-full mb-4 flex gap-3 flex-col sm:flex-row z-[30]">
                {/* Province Dropdown */}
                <div className="flex-1 text-left z-5">
                  <FormDropdown
                    placeholder="All Provinces"
                    options={provinceOptions}
                    value={selectedProvince || ""}
                    onChange={(val) => setSelectedProvince(val || null)}
                    className="w-full"
                    selectablePlaceholder={true}
                  />
                </div>

                {/* AY Dropdown */}
                <div className="flex-1 text-left z-4">
                  <FilterDropdown
                    options={ayOptions}
                    value={selectedAY}
                    onChange={(val) => setSelectedAY(val)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Count Display */}
              <div className="text-center xl:text-left w-[180px]">
                <h1 className="text-7xl sm:text-8xl xl:text-9xl font-black text-white tracking-tight tabular-nums scale-y-110 [text-shadow:0_1px_0_rgba(0,0,0,0.8),0_2px_0_rgba(0,0,0,0.6),0_3px_6px_rgba(0,0,0,0.8)]">
                  {provinceDisplayCount}
                </h1>
                <p className="text-[#eec643] font-semibold mt-2">Total Members</p>
                <p className="text-white/60 tracking-widest uppercase text-sm leading-tight mt-1">
                  {selectedAY}
                </p>
              </div>

              {/* School List*/}
              <div className="mb-0 text-center xl:text-left block xl:hidden">
                <p className="text-white/60 text-xs tracking-widest uppercase">
                  {selectedProvince
                    ? `Showing all Schools in ${selectedProvince}`
                    : "Showing all schools across CAR"}
                </p>
              </div>

              <div className="xl:w-[420px] h-[400px] flex-shrink-0">
                <div className="space-y-3 max-h-[360px] sm:max-h-[435px] overflow-y-auto overflow-x-visible px-2 py-2 pr-2 custom-scrollbar-white-nobg">
                  {provinceSchools.length > 0 ? (
                    provinceSchools.map((school) => (
                      <div
                        key={school.id}
                        className="justify-between group border border-white/10 rounded-2xl py-3 sm:py-4 px-4 sm:px-6 flex justify-between items-center bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                      >
                        <div className="flex-1 pr-4 text-left">
                          <span className="font-semibold text-base sm:text-lg text-white group-hover:text-[#eec643] transition-colors leading-snug break-words whitespace-normal">
                            {school.name}
                          </span>
                        </div>
                        <span className="text-lg sm:text-xl font-bold text-[#eec643] shrink-0">
                          {school.memberCount}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-white/60">
                      {selectedProvince
                        ? "No members found in this province"
                        : "Select a province to view schools"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="hidden xl:block relative z-10 flex-1 mt-10 xl:mt-0">
            <div className="relative group">
              {/* Desktop AY Dropdown */}
              <div className="absolute top-15 right-4 z-50">
                <FilterDropdown
                  options={ayOptions}
                  value={selectedAY}
                  onChange={(val) => setSelectedAY(val)}
                />
              </div>

              {/* Map Container */}
              <div
                className="relative w-full mx-auto xl:mx-0
                          aspect-[4/5] 
                          sm:aspect-[4/5]
                          md:aspect-[4/5]
                          xl:aspect-[4/5]
                          min-h-[320px]
                          sm:min-h-[380px]
                          md:min-h-[450px]
                          xl:min-h-[520px]"
              >
                <img
                  src="/assets/logos/webcarmap.png"
                  alt="CAR map"
                  className="absolute inset-0 w-full h-full object-contain"
                />

                {/* Reset Button */}
                {selectedProvince && (
                  <button
                    onClick={handleReset}
                    className="absolute bottom-30 right-10 group flex items-center gap-2 bg-white/90 backdrop-blur-md hover:bg-white shadow-lg pl-3 pr-2 py-2 rounded-full border border-white/50 hover:scale-105 transition-all duration-200 z-50 cursor-pointer"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="max-w-0 overflow-hidden whitespace-nowrap text-[#011638] font-semibold text-sm group-hover:max-w-xs transition-all duration-300 ease-in-out">
                      Reset
                    </span>
                  </button>
                )}

                {/* Map Markers */}
                {provincesNames.map((p) => (
                  <button
                    key={p.name}
                    onClick={() => setSelectedProvince(p.name)}
                    className={`absolute ${p.translate} group cursor-pointer transition-all duration-300 hover:scale-125 z-20`}
                    style={{
                      left: p.left,
                      top: p.top,
                    }}
                  >
                    <div className="relative">
                      <div
                        className={`w-5 h-5 ${provinceStatus[p.name] ? "bg-[#eec643]" : "bg-[#eec643]/35"} rounded-full shadow-lg ring-4 ring-white/60 ${selectedProvince === p.name ? "ring-[#eec643]/50" : ""}`}
                      />
                      {provinceStatus[p.name] && (
                        <div className="absolute inset-0 w-5 h-5 rounded-full bg-[#eec643] animate-ping opacity-75" />
                      )}
                    </div>
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#011638] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap z-50 pointer-events-none">
                      {p.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}