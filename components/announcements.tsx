"use client";

import { useState, useEffect } from "react";
import Calendar from "@/components/calendar";
import { createClient } from "@/lib/supabase/client";
import AnnounceMemberCard from "@/components/announceMemberCard";
import { useUser } from "@/components/context/userContext";

const supabase = createClient();

export default function Dashboard() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAnnouncements() {
      try {
        const { data, error } = await supabase
          .from("announce_dash")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;
        if (data) setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      } finally {
        setLoading(false);
      }
    }

    getAnnouncements();
  }, []);

  console.log(user);

  return (
    <div className="text-[#141414] min-h-screen">
      <main className="mx-auto w-[95%] lg:w-[90%] max-w-[1400px] lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Calendar */}
          <div className="w-full">
            <Calendar />
          </div>

          {/* Announcements */}
          <div className="w-[90%] mb-12 md:w-full flex flex-col mx-auto ">
            <div className="shadow-2xl border-1 border-[#d7d7d7] rounded-xl bg-white">
              <h2 className="text-2xl md:text-4xl font-bold text-black text-center mb-6 mt-6 ">
                ANNOUNCEMENTS
              </h2>

              <div className="h-[300] md:h-[525.5px] overflow-y-auto custom-scrollbar pr-4 ">
                {loading ? (
                  <div className="flex h-64 w-full items-center justify-center">
                    <p>Loading...</p>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="flex h-64 w-full items-center justify-center">
                    <p className="text-gray-500 italic">
                      No announcements found.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {announcements.map((item) => (
                      <AnnounceMemberCard key={item.id} announce_dash={item} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
