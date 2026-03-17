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

      {/* Name and Committee etcetera*/}
      <div className="rounded-xl bg-[f9f9f9] flex flex-col items-center justify-between md:flex-row shadow-sm w-[80%] mx-auto mt-8 max-w-[1400px]">
        <div className="m-3 p-2">
          <h2 className="text-lg font-bold text-center md:text-left md:text-4xl">
            Marionne T. Villagracia
          </h2>
          <p className="text-xs text-center md:text-left md:text-xl">
            Internals Committee
          </p>
          <div className="mt-3 flex w-full justify-center md:justify-start md:w-auto md:text-">
            <p>University of the Philippines Baguio</p>
          </div>
        </div>

        <div className="md:m-3 p-2 text-sm md:self-end">
          <p>Current Total Members: 69420</p>
        </div>
      </div>

      <main className="mx-auto w-[95%] lg:w-[90%] max-w-[1400px] lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Calendar */}
          <div className="w-full">
            <Calendar />
          </div>

          {/* Announcements */}
          <div className="w-full flex flex-col md:pt-3">
            <div className="shadow-2xl">
              <h2 className="text-2xl lg:text-4xl font-bold text-black text-center mb-6 mt-6">
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
