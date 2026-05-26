"use client";

import { useState, useEffect } from "react";
import BigCalendar from "@/components/features/dashboard/announcements/calendar";
import { createClient } from "@/utils/supabase/client";
import AnnounceMemberCard from "@/components/features/dashboard/announcements/announceMemberCard";
import { useUser } from "@/components/context/userContext";

const supabase = createClient();

export default function Dashboard() {
  const { user } = useUser();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAnnouncements() {
      try {
        const today = new Date().toISOString();
        const { data, error } = await supabase
          .from("announce_dash")
          .select("*")
          .gte("announce_dash_end", today)
          .lte("announce_dash_start", today)
          .order("announce_dash_start", { ascending: false });

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
    <div className="text-[#141414]">
      <main className="mx-auto w-[95%] lg:w-[90%] max-w-[1400px] lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Calendar */}
          <div className="w-full md:h-[750px]">
            <BigCalendar />
          </div>
          {/* Announcements */}
          <div className="w-full flex flex-col md:h-[750px] mx-auto">
            <div className="h-full flex flex-col overflow-hidden">
              <h2 className="text-2xl md:text-4xl font-bold gradient text-center mb-6 mt-6">
                ANNOUNCEMENTS
              </h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar-blue pr-4 pb-6">
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
