"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function CommitteeDirectory() {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    async function getMembers() {
      try {
        const { data, error } = await supabase
          .from("member")
          .select(
            `*,
            committee:committee (comm_name),
            school:school (school_name)`,
          )
          .order("id", { ascending: true });

        if (error) throw error;
        if (data) setMembers(data);
      } catch (error) {
        console.error("Error fetching members:", error);
      }
    }
    getMembers();
  }, []);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((person) => (
          <div
            key={person.id}
            className="bg-white rounded-xl p-6 flex flex-col items-center text-center"
          >
            <div className="w-20 h-20 bg-slate-100 rounded-full mb-4 flex items-center justify-center text-2xl overflow-hidden">
              {person.image_url ? (
                <img
                  src={person.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                ":)"
              )}
            </div>
            <h3 className="font-semibold text-slate-800">
              {person.mem_fname} {person.mem_lname}
            </h3>
            <p className="text-sm text-blue-600 font-medium">
              {person.committee?.comm_name}
            </p>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {person.school?.school_name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
