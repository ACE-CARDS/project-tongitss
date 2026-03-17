"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/navbar";
import Footer from "@/components/footer";
import Calendar from "@/components/calendar";
import { createClient } from "@/lib/supabase/client";
import AnnounceMemberCard from "@/components/announceMemberCard"; // Check this path!

const supabase = createClient();

export default function Dashboard() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getAnnouncements() {
      try {
        const { data, error } = await supabase
          .from("announce_dash") // Ensure this table exists in your DB
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

  return (
    <div className="bg-gradient-to-br from-[#f8f9fa] to-[#eff0f2] text-[#141414] min-h-screen">
      <NavBar />
      <div className="rounded-xl bg-[green] mb-4 flex flex-col items-center justify-between gap-4 md:gap-0 md:flex-row">
        <h2 className="text-lg font-bold text-center md:text-left md:text-xl">
          dasdasdasdasdasdasd
        </h2>

        <div className="flex w-full justify-center md:justify-end gap-1 md:w-auto">
          <p>sjajdkaskjd</p>
        </div>
      </div>

      <main className="mx-auto w-[95%] lg:w-[90%] max-w-[1400px] py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Calendar */}
          <div className="w-full">
            <Calendar />
          </div>

          {/* Announcements */}
          <div className="w-full flex flex-col md:pt-3">
            <div className="shadow-2xl">
              <h2 className="text-4xl lg:text-5xl font-bold text-black text-center mb-6 mt-6">
                ANNOUNCEMENTS
              </h2>

              <div className="h-[530px] overflow-y-auto custom-scrollbar pr-4">
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

      <Footer />
    </div>
  );
}
