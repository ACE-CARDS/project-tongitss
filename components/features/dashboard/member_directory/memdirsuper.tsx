//Ctrl+F niyo nalang "CHANGE AY" to know where mga ichchange ay kasi naka filter yan based don
"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { jsPDF, GState } from "jspdf";
import autoTable from "jspdf-autotable";
import { useUser } from "@/components/context/userContext";
import Popup from "@/components/ui/popup";
import Pagination from "@/components/ui/pagination";

type Member = {
  id: number;
  mem_fname: string;
  mem_lname: string;
  mem_minit: string;
  mem_email: string;
  mem_schol_type: string;
  mem_schol_year: number;
  school: number | string;
  comm: number | string;
  course: number | string;
  role: string;
  is_active: boolean;
  acadyear?: string;
  school_rel: { school_name: string } | null;
  course_rel: { course_name: string } | null;
};
type Committee = {
  id: number;
  comm_name: string;
};

//current acad year
const getCurrentAcademicYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // around oct siya since mostly september ang membership drive
  if (month >= 10) {
    return `AY ${year}-${year + 1}`;
  } else {
    return `AY ${year - 1}-${year}`;
  }
};

const currentAcademicYear = getCurrentAcademicYear();

const currentYear = new Date().getFullYear();

const academicYears = Array.from({ length: 4 }, (_, i) => {
  const startYear =
    new Date().getMonth() + 1 >= 10 ? currentYear - i : currentYear - 1 - i;

  return `AY ${startYear}-${startYear + 1}`;
});

export default function MembersPage() {
  const supabase = createClient();

  const [currentPage, setCurrentPage] = useState(1);
  const [members, setMembers] = useState<Member[]>([]);
  const [originalMembers, setOriginalMembers] = useState<Member[]>([]);
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchName, setSearchName] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [importedMembers, setImportedMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const memberData = await fetchActiveMembers();

      const { data: committeeData } = await supabase
        .from("committee")
        .select("*")
        .order("id", { ascending: true });

      if (memberData) {
        const cloned = structuredClone(memberData);

        setMembers(cloned);
        setOriginalMembers(structuredClone(cloned));
      }
      if (committeeData) setCommittees(committeeData);
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    };
    fetchData();
  }, []);

  const fetchActiveMembers = async () => {
    const { data, error } = await supabase
      .from("member")
      .select(
        `
          *,
          school_rel:school (school_name),
          course_rel:course (course_name)
        `,
      )
      .eq("acadyear", currentAcademicYear)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching active members:", error);
      return null;
    }

    return data;
  };

  useEffect(() => {
    const fetchSchools = async () => {
      const { data, error } = await supabase
        .from("school")
        .select("id, school_name")
        .order("school_name");

      if (error) {
        console.error(error);
        return;
      }

      if (data) setSchools(data);
    };

    fetchSchools();
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from("course")
        .select("id, course_name")
        .order("course_name");

      if (error) {
        console.error("Error fetching courses:", error);
        return;
      }

      if (data) setCourses(data);
    };

    fetchCourses();
  }, []);

  //keywords for committee tabs
  const committeeCategories = [
    { label: "All", key: "all" },
    { label: "Non-Committee", key: "regional" },
    { label: "Internals", key: "internal" },
    { label: "Externals", key: "external" },
    { label: "Finance and Business", key: "finance" },
    { label: "Publicity and Media", key: "publicity" },
    { label: "Education and Research", key: "education" },
    { label: "Events and Logistics", key: "logistics" },
  ];

  const filteredMembers = members.filter((m) => {
    const commName =
      typeof m.comm === "number"
        ? committees.find((c) => c.id === m.comm)?.comm_name || ""
        : m.comm;

    const committeeMatch =
      selectedFilter === "all"
        ? true
        : selectedFilter === "regional"
          ? commName.toLowerCase().includes("regional") ||
            commName.toLowerCase().includes("secretary")
          : commName.toLowerCase().includes(selectedFilter);

    const nameMatch = `${m.mem_fname} ${m.mem_lname}`
      .toLowerCase()
      .includes(searchName.toLowerCase());

    return committeeMatch && nameMatch;
  });

  const getCommName = (comm: number | string) => {
    if (typeof comm === "number") {
      return committees.find((c) => c.id === comm)?.comm_name || "";
    }
    return comm;
  };

  const normalize = (str: string) =>
    str.toLowerCase().replace(/\s+/g, " ").trim();

  // prio for listing
  const priority = [
    "Regional Director",
    "Director for Internal Affairs",
    "Deputy Director for Internal Affairs",
    "Director for External Affairs",
    "Deputy Director for External Affairs",
    "Secretary",
    "Assistant Secretary",
    "Finance and Business Committee Head",
    "Finance and Business Committee Deputy",
    "Publicity and Media Committee Head",
    "Publicity and Media Committee Deputy",
    "Education and Research Committee Head",
    "Education and Research Committee Deputy",
    "Events and Logistics Committee Head",
    "Events and Logistics Committee Deputy",
  ].map(normalize);

  const [nameSortOrder, setNameSortOrder] = useState<"asc" | "desc">("asc");

  const getPriorityIndex = (commName: string) =>
    priority.indexOf(normalize(commName));

  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const originalA =
      originalMembers.find((o) => o.id === a.id)?.comm ?? a.comm;

    const originalB =
      originalMembers.find((o) => o.id === b.id)?.comm ?? b.comm;

    const commA = getCommName(originalA);
    const commB = getCommName(originalB);

    const indexA = getPriorityIndex(commA);
    const indexB = getPriorityIndex(commB);

    const aInList = indexA !== -1;
    const bInList = indexB !== -1;

    if (aInList && bInList) return indexA - indexB;

    if (aInList) return -1;
    if (bInList) return 1;

    const nameCompare = `${a.mem_lname} ${a.mem_fname}`
      .toLowerCase()
      .localeCompare(`${b.mem_lname} ${b.mem_fname}`.toLowerCase());

    return nameSortOrder === "asc" ? nameCompare : -nameCompare;
  });

  // pagination
  const itemsPerPage = 5;
  const totalItems = sortedMembers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const paginatedItems = sortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const hasChanges =
    importedMembers.length > 0 ||
    members.some((m, i) => {
      const o = originalMembers[i];
      return !o || m.role !== o.role || m.comm !== o.comm;
    });

  const isRowEdited = (member: Member) => {
    const original = originalMembers.find((o) => o.id === member.id);
    if (!original) return false;

    return member.role !== original.role || member.comm !== original.comm;
  };

  //saving roles sa supabase
  const handleRoleChange = (id: number, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role: String(newRole) } : m)),
    );
  };

  const handleCommitteeChange = (
    id: number,
    newCommitteeId: number | string,
  ) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, comm: newCommitteeId } : m)),
    );
  };

  const handleSave = async () => {
    setShowConfirm(false);

    try {
      const importedNew = members.filter((m: any) => m.isImported);
      const existing = members.filter((m: any) => !m.isImported);
      const DEFAULT_ACADYEAR = currentAcademicYear;
      const DEFAULT_COMM = 23;
      const DEFAULT_SCHOL_TYPE = "Merit";
      const DEFAULT_SCHOL_YEAR = 2023;
      const DEFAULT_SCHOOL = 1;

      if (importedNew.length > 0) {
        const insertPayload = importedNew.map((m, index) => ({
          mem_fname: m.mem_fname,
          mem_lname: m.mem_lname,
          mem_minit: m.mem_minit,
          role: m.role,
          comm: m.comm ?? DEFAULT_COMM,
          mem_schol_type: m.mem_schol_type?.trim() || DEFAULT_SCHOL_TYPE,
          mem_schol_year: m.mem_schol_year ?? DEFAULT_SCHOL_YEAR,
          school: m.school ?? DEFAULT_SCHOOL,
          is_active: m.is_active ?? true,
          mem_email:
            m.mem_email?.trim() || `temp_${Date.now()}_${index}@example.com`,
          acadyear: m.acadyear?.trim() || DEFAULT_ACADYEAR,
        }));

        const { data, error } = await supabase
          .from("member")
          .insert(insertPayload)
          .select();

        if (error) {
          console.error("Insert error:", error);
          return;
        }
      }

      if (existing.length > 0) {
        const updates = [];
        const auditPromises = [];

        for (const m of existing) {
          const original = originalMembers.find((o: any) => o.id === m.id);

          if (!original) continue;

          const commChanged = original.comm !== m.comm;
          const roleChanged = original.role !== m.role;

          if (commChanged || roleChanged) {
            const updatePayload: any = {};
            if (commChanged) updatePayload.comm = m.comm;
            if (roleChanged) updatePayload.role = m.role;

            updates.push(
              supabase.from("member").update(updatePayload).eq("id", m.id),
            );

            const memberName =
              `${original.mem_fname || ""} ${original.mem_lname || ""}`.trim() ||
              `ID: ${m.id}`;

            auditPromises.push(
              logEditAudit(
                memberName,
                original.comm,
                m.comm,
                original.role,
                m.role,
              ),
            );
          }
        }

        if (updates.length > 0) {
          await Promise.all([...updates, ...auditPromises]);
        }
      }

      const { data } = await supabase
        .from("member")
        .select("*")
        .eq("acadyear", currentAcademicYear);

      if (data) {
        const cloned = structuredClone(data);
        setMembers(cloned);
        setOriginalMembers(structuredClone(cloned));
        setImportedMembers([]);
      }

      setShowToast(true);

      setShowSaveSuccess(true);
    } catch (error) {
      console.error(error);
    }
  };

  const logEditAudit = async (
    memberName: string,
    oldCommId: any,
    newCommId: any,
    oldRole?: string,
    newRole?: string,
  ) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const getCommitteeName = async (id: any) => {
      if (!id) return "None";
      const { data } = await supabase
        .from("committee")
        .select("comm_name")
        .eq("id", id)
        .maybeSingle();

      return data?.comm_name || `ID: ${id}`;
    };

    const details: string[] = [];

    if (oldCommId !== newCommId) {
      const oldCommName = await getCommitteeName(oldCommId);
      const newCommName = await getCommitteeName(newCommId);
      details.push(
        `Updated committee for member "${memberName}" from "${oldCommName}" to "${newCommName}"`,
      );
    }

    if (oldRole !== newRole) {
      details.push(
        `Updated role for member "${memberName}" from "${oldRole || "None"}" to "${newRole || "None"}"`,
      );
    }

    if (details.length === 0) {
      details.push(`No changes detected for member "${memberName}".`);
    }

    const detailedMessage = details.join("; ");

    const logEntry = {
      action: "Update",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "member",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write edit audit log:", error);
    }
  };

  const refreshMembers = async () => {
    const { data } = await supabase
      .from("member")
      .select("*")
      .eq("acadyear", currentAcademicYear)
      .eq("is_active", true);

    if (data) {
      const cloned = structuredClone(data);

      setMembers([...cloned]);
      setOriginalMembers(structuredClone(cloned));
    }
  };

  //yellow hehe panget but sana gets
  const getRoleStyle = (role: string) => {
    if (role === "superadmin") return "text-black-600";
    if (role === "admin") return "text-black-600";
    return "text-black-600";
  };

  //color based sa GA
  const getCommitteeStyle = (commName: string) => {
    const name = commName.toLowerCase();
    if (name.includes("internal")) return "text-purple-800";
    if (name.includes("external")) return "text-green-800";
    if (name.includes("education")) return "text-red-800";
    if (name.includes("finance")) return "text-blue-900";
    if (name.includes("publicity")) return "text-pink-800";
    if (name.includes("logistics")) return "text-yellow-600";
    if (name.includes("regional")) return "text-gray-800";
    if (name.includes("secretary")) return "text-gray-900";
    return "text-gray-600";
  };

  //role dropdwn
  const Dropdown = ({
    value,
    options,
    onChange,
    styleClass,
  }: {
    value: string | number;
    options: { label: string; value: string | number }[];
    onChange: (val: string | number) => void;
    styleClass?: string;
  }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel =
      options.find((o) => o.value === value)?.label || "Select";

    return (
      <div ref={ref} className="relative w-full my-auto">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`w-full px-3 py-2 border rounded-xl text-left shadow-sm font-normal relative cursor-pointer ${styleClass}`}
        >
          {selectedLabel}
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-700 rotate-45 transition-transform ${
              open ? "rotate-225" : "rotate-45"
            }`}
          />
        </button>

        {open && (
          <ul className="absolute z-50 mt-1 w-full bg-white border rounded-xl shadow-lg max-h-60 overflow-auto custom-scrollbar-blue">
            {options.map((o) => (
              <li
                key={o.value}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`${getRoleStyle(o.value as string)} px-3 py-2 hover:opacity-30 cursor-pointer`}
              >
                {o.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  //committee dropdwn
  const CommitteeDropdown = ({
    value,
    options,
    onChange,
  }: {
    value: string | number;
    options: { label: string; value: string | number }[];
    onChange: (val: string | number) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false);
          setSearch("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    );

    const selectedLabel =
      options.find((o) => o.value === value)?.label || "Select";

    return (
      <div ref={ref} className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full px-3 py-2 border rounded-xl text-left shadow-sm font-normal relative cursor-pointer"
        >
          {selectedLabel}
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-700 rotate-45 transition-transform ${
              open ? "rotate-225" : "rotate-45"
            }`}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 bg-white border rounded-xl shadow-lg overflow-hidden w-full">
            <div className="custom-scrollbar-blue overflow-auto w-full max-h-60">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 border-b border-gray-300 focus:outline-none"
              />
              <ul className="custom-scrollbar-blue">
                {filteredOptions.map((o) => (
                  <li
                    key={o.value}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`${getCommitteeStyle(o.label)} px-3 py-2 cursor-pointer hover:opacity-50 cursor-pointer`}
                  >
                    {o.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const SchoolDropdown = ({
    value,
    options,
    onChange,
  }: {
    value: string | number;
    options: { label: string; value: string | number }[];
    onChange: (val: string | number) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false);
          setSearch("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    );

    const selectedLabel =
      options.find((o) => o.value === value)?.label || "Select school";

    return (
      <div ref={ref} className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full px-3 py-2 border rounded-xl text-left relative cursor-pointer"
        >
          {selectedLabel}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-700 rotate-45" />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 bg-white border rounded-xl shadow-lg w-full max-h-60 overflow-hidden">
            {/* search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search school..."
              className="w-full px-3 py-2 border-b focus:outline-none"
            />

            <ul className="max-h-52 overflow-auto">
              {filteredOptions.map((o) => (
                <li
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {o.label}
                </li>
              ))}

              <li
                onClick={() => {
                  onChange("other");
                  setOpen(false);
                }}
                className="px-3 py-2 text-blue-600 hover:bg-gray-100 cursor-pointer"
              >
                Other
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  const CourseDropdown = ({
    value,
    options,
    onChange,
  }: {
    value: string | number;
    options: { label: string; value: string | number }[];
    onChange: (val: string | number) => void;
  }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node)) {
          setOpen(false);
          setSearch("");
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter((o) =>
      o.label.toLowerCase().includes(search.toLowerCase()),
    );

    const selectedLabel =
      options.find((o) => String(o.value) === String(value))?.label ||
      "Select course";

    return (
      <div ref={ref} className="relative w-full">
        <button
          type="button"
          onClick={() => setOpen((p) => !p)}
          className="w-full px-3 py-2 border rounded-xl text-left relative cursor-pointer"
        >
          {selectedLabel}
          <span
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 border-r-2 border-b-2 border-gray-700 rotate-45 transition-transform ${open ? "rotate-225" : "rotate-45"}`}
          />
        </button>

        {open && (
          <div className="absolute bottom-full mb-1 z-[9999] bg-white border rounded-xl shadow-lg w-full max-h-60 overflow-hidden">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course..."
              className="w-full px-3 py-2 border-b focus:outline-none"
            />
            <ul className="max-h-52 overflow-auto custom-scrollbar-blue">
              {filteredOptions.map((o) => (
                <li
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {o.label}
                </li>
              ))}
              <li
                onClick={() => {
                  onChange("other");
                  setOpen(false);
                }}
                className="px-3 py-2 text-blue-600 hover:bg-gray-100 cursor-pointer font-medium"
              >
                Other
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, searchName]);

  const [deleteMember, setDeleteMember] = useState<Member | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deleteMember) return;

    try {
      const { error } = await supabase
        .from("member")
        .update({ is_active: false })
        .eq("id", deleteMember.id);

      if (error) throw error;

      setMembers((prev) => prev.filter((m) => m.id !== deleteMember.id));

      setOriginalMembers((prev) =>
        prev.filter((m) => m.id !== deleteMember.id),
      );

      setDeleteMember(null);

      setShowDeleteSuccess(true);
    } catch (err) {
      console.error("Soft delete error:", err);
      alert("Failed to remove member.");
    }
  };

  //for edit
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({
    mem_fname: "",
    mem_lname: "",
    mem_minit: "",
    mem_email: "",
    school: "",
    course: "",
  });

  const [editFieldErrors, setEditFieldErrors] = useState({
    mem_fname: false,
    mem_lname: false,
    mem_minit: false,
    mem_email: false,
  });

  const handleEditSave = async () => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.mem_email);
    if (!editMember) return;

    try {
      const errors = {
        mem_fname: editForm.mem_fname.trim() === "",
        mem_lname: editForm.mem_lname.trim() === "",
        mem_minit:
          editForm.mem_minit.trim() !== "" &&
          editForm.mem_minit.trim().length > 4,
        mem_email: !emailValid,
      };

      setEditFieldErrors(errors);

      if (
        errors.mem_fname ||
        errors.mem_lname ||
        errors.mem_minit ||
        errors.mem_email
      ) {
        let msg = "Please fill in required fields correctly.";

        if (errors.mem_minit) {
          msg = "Middle Initial must not exceed 3 characters.";
        }

        if (errors.mem_email) {
          msg = "Please enter a valid email address.";
        }

        setEditErrorMessage(msg);
        setShowEditError(true);
        return;
      }

      if ((editMember as any).isImported) {
        setMembers((prev) =>
          prev.map((m) => (m.id === editMember.id ? { ...m, ...editForm } : m)),
        );

        setEditMember(null);

        setShowRenameSuccess(true);
        return;
      }

      let finalSchoolId = Number(editForm.school);
      let finalCourseId = Number(editForm.course);

      if (editForm.school === "other") {
        const normalizedCustomSchool = customSchool
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        if (!normalizedCustomSchool) {
          setCustomSchoolError(true);
          return;
        }

        const existingSchool = schools.find(
          (s) =>
            s.school_name.toLowerCase().replace(/\s+/g, " ").trim() ===
            normalizedCustomSchool,
        );

        if (existingSchool) {
          setCustomSchoolError(true);
          return;
        }

        const { data: newSchool, error: schoolError } = await supabase
          .from("school")
          .insert({
            school_name: customSchool.trim(),
          })
          .select()
          .single();

        if (schoolError || !newSchool) {
          console.error(schoolError);

          setEditErrorMessage("Failed to add school.");
          setShowEditError(true);
          return;
        }

        finalSchoolId = newSchool.id;

        setSchools((prev) => [...prev, newSchool]);
      }

      if (editForm.course === "other") {
        const normalizedCustomCourse = customCourse
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

        if (!normalizedCustomCourse) {
          setCustomCourseError(true);
          return;
        }

        const existingCourse = courses.find(
          (c) =>
            c.course_name.toLowerCase().replace(/\s+/g, " ").trim() ===
            normalizedCustomCourse,
        );

        if (existingCourse) {
          setCustomCourseError(true);
          return;
        }

        const { data: newCourse, error: courseError } = await supabase
          .from("course")
          .insert({
            course_name: customCourse.trim(),
          })
          .select()
          .single();

        if (courseError || !newCourse) {
          console.error(courseError);

          setEditErrorMessage("Failed to add course.");
          setShowEditError(true);
          return;
        }

        finalCourseId = newCourse.id;

        setCourses((prev) => [...prev, newCourse]);
      }

      const { error } = await supabase
        .from("member")
        .update({
          mem_fname: editForm.mem_fname,
          mem_lname: editForm.mem_lname,
          mem_minit: editForm.mem_minit,
          mem_email: editForm.mem_email,
          school: finalSchoolId,
          course: finalCourseId,
        })
        .eq("id", editMember.id);

      if (error) {
        console.error("Supabase update error:", error);
        setEditErrorMessage(error.message || "Failed to update member.");
        setShowEditError(true);
        return;
      }

      // audit log: track changes
      try {
        const oldData = editMember;
        const newData = {
          ...editForm,
          school: finalSchoolId,
          course: finalCourseId,
        };

        await logEditDetailAudit(
          "member",
          String(editMember.id),
          oldData,
          newData,
        );
      } catch (err) {
        console.error("Audit log failed:", err);
      }

      setMembers((prev) =>
        prev.map((m) =>
          m.id === editMember.id
            ? {
                ...m,
                ...editForm,
                school: finalSchoolId,
              }
            : m,
        ),
      );

      setOriginalMembers((prev) =>
        prev.map((m) => (m.id === editMember.id ? { ...m, ...editForm } : m)),
      );

      setEditMember(null);

      setShowRenameSuccess(true);
    } catch (err: any) {
      console.error(err);
      setEditErrorMessage(err?.message || "Unexpected error while editing.");
      setShowEditError(true);
    }
  };

  const [showExportOptions, setShowExportOptions] = useState(false);

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    const img = new Image();
    img.src = "/assets/logos/ACE CARDS logo.png";

    img.onload = () => {
      supabase
        .from("member")
        .select(
          `
          mem_fname,
          mem_lname,
          mem_minit,
          mem_email,
          mem_schol_type,
          mem_schol_year,
          school,
          comm,
          is_active,
          committee:comm (comm_name),
          school_rel:school (school_name)
        `,
        )
        .eq("acadyear", currentAcademicYear) //change ay
        .then(({ data, error }) => {
          if (error || !data) return;

          // sort
          const sorted = [...data].sort((a: any, b: any) =>
            `${a.mem_lname} ${a.mem_fname}`.localeCompare(
              `${b.mem_lname} ${b.mem_fname}`,
            ),
          );

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();

          // logo
          doc.addImage(img, "PNG", 10, 8, 20, 20);

          // titel
          doc.setTextColor(1, 22, 56);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(30);
          doc.text("MEMBERSHIP DIRECTORY", 37, 21);

          // ay
          doc.setTextColor(1, 22, 56);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(15);
          doc.text(currentAcademicYear, pageWidth - 10, 20, {
            //change AY
            align: "right",
          });

          const tableData = sorted.map((m: any) => [
            `${m.mem_lname}, ${m.mem_fname} ${m.mem_minit || ""}`,
            m.committee?.comm_name || "",
            m.mem_email,
            m.mem_schol_type,
            m.mem_schol_year,
            m.school_rel?.school_name || m.school,
          ]);

          // legend
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.setTextColor(160, 160, 160);

          doc.text(
            "* Italicized and grayed out — Inactive",
            pageWidth - 10,
            32,
            { align: "right" },
          );

          const pageNumbers: number[] = [];

          autoTable(doc, {
            startY: 35,
            margin: { left: 8, right: 8 },
            theme: "grid",

            head: [
              [
                "Name",
                "Committee",
                "Email",
                "Scholarship Type",
                "Year of Scholarship",
                "University",
              ],
            ],

            body: tableData,

            styles: {
              fontSize: 9,
              cellPadding: 3,
              textColor: 30,
              lineColor: [1, 22, 56], // borders
              lineWidth: 0.2,
            },

            headStyles: {
              fillColor: [1, 22, 56],
              textColor: 255,
              fontSize: 10,
              halign: "center",
              valign: "middle",
            },

            alternateRowStyles: {
              fillColor: [245, 247, 250],
            },

            columnStyles: {
              0: { cellWidth: 60 }, //name
              1: { cellWidth: 38 }, //comm
              2: { cellWidth: 60 }, //email
              3: { cellWidth: 35, halign: "center" }, //schol type
              4: { cellWidth: 28, halign: "center" }, //schol year
              5: { cellWidth: 60 }, // uni
            },

            didParseCell: function (data) {
              const row = data.row.index;
              const member = sorted[row];

              if (member && member.is_active === false) {
                data.cell.styles.textColor = [160, 160, 160];
                data.cell.styles.fillColor = [245, 245, 245];
                data.cell.styles.fontStyle = "italic";
              }
            },

            didDrawPage: () => {
              doc.saveGraphicsState();
              doc.setGState(new GState({ opacity: 0.06 }));

              doc.addImage(
                img,
                "PNG",
                pageWidth / 2 - 80,
                pageHeight / 2 - 75,
                160,
                160,
              );

              doc.restoreGraphicsState();

              const now = new Date();

              const formattedDateTime = now.toLocaleString("en-PH", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              });

              // footer
              doc.setFontSize(8);
              doc.setTextColor(120);

              doc.text(
                `Generated automatically from ACE CARDS Member System at ${formattedDateTime}`,
                10,
                pageHeight - 10,
              );
            },
          });

          const totalPages = doc.getNumberOfPages();

          for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);

            doc.setFontSize(8);
            doc.setTextColor(120);

            const now = new Date();

            const formattedDateTime = now.toLocaleString("en-PH", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            doc.text(
              `Generated automatically from ACE CARDS Member System at ${formattedDateTime}`,
              10,
              pageHeight - 10,
            );

            doc.text(
              `Page ${i} of ${totalPages}`,
              pageWidth - 10,
              pageHeight - 10,
              { align: "right" },
            );
          }

          doc.save(`Membership Directory (${currentAcademicYear}).pdf`);
          logExportPDFAudit();
        });
    };
  };

  const handleExportCSV = async () => {
    const { data, error } = await supabase
      .from("member")
      .select("*")
      .eq("acadyear", currentAcademicYear);

    if (error || !data) return;

    const sorted = [...data].sort((a: any, b: any) => {
      const nameA = `${a.mem_lname} ${a.mem_fname}`.toLowerCase();
      const nameB = `${b.mem_lname} ${b.mem_fname}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

    const allKeys = Object.keys(sorted[0]);

    const headers = allKeys;

    const rows = sorted.map((m: any) =>
      allKeys.map((key) => {
        const value = m[key];

        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);

        return value;
      }),
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Membership Directory (${currentAcademicYear}).csv`;
    logExportCSVAudit();
    a.click();

    URL.revokeObjectURL(url);
  };

  const [pendingImport, setPendingImport] = useState<any[]>([]);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  const handleConfirmImport = async () => {
    try {
      const { data, error } = await supabase
        .from("member")
        .upsert(pendingImport, {
          onConflict: "mem_email",
        })
        .select();

      if (error) {
        console.error(error);
        setImportErrorMessage(error.message || "Failed to import members.");
        setShowImportError(true);
        setShowImportConfirm(false);
        return;
      }

      const { data: refreshed, error: fetchError } = await supabase
        .from("member")
        .select("*")
        .eq("acadyear", currentAcademicYear)
        .eq("is_active", true);

      if (fetchError) {
        setImportErrorMessage(fetchError.message || "Failed to refresh data.");
        setShowImportError(true);
        return;
      }

      if (refreshed) {
        setMembers(structuredClone(refreshed));
        setOriginalMembers(structuredClone(refreshed));
      }

      setPendingImport([]);
      setShowImportConfirm(false);
      setShowImportSuccess(true);
      logImportAudit();
    } catch (err: any) {
      console.error(err);
      setImportErrorMessage(err?.message || "Unexpected error during import.");
      setShowImportError(true);
    }
  };

  //audit log
  const { user } = useUser();
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const loadCurrentUser = async (email: string) => {
    const { data } = await supabase
      .from("member")
      .select("mem_fname, mem_lname, mem_email")
      .eq("mem_email", email)
      .single();

    const fullName = data
      ? `${data.mem_fname || ""} ${data.mem_lname || ""}`.trim()
      : email;
    setCurrentUserName(fullName || email);
    setCurrentUserEmail(data?.mem_email || email);
  };

  useEffect(() => {
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  const logArchiveAudit = async (ay: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Archived executives for ${ay}`;

    const logEntry = {
      action: "Archive",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "member",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  const logImportAudit = async () => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Imported ${pendingImport.length} members`;

    const logEntry = {
      action: "Import",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "member",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  const logExportCSVAudit = async () => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Exported .csv member list`;

    const logEntry = {
      action: "Export",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "member",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  const logExportPDFAudit = async () => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Exported .pdf member list`;

    const logEntry = {
      action: "Export",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "member",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  const logEditDetailAudit = async (
    tableName: string,
    recordId: string,
    oldData?: any,
    newData?: any,
  ) => {
    try {
      const whoDidItName = currentUserName || user?.email || "Unknown User";
      const whoDidItEmail =
        currentUserEmail || user?.email || "unknown@email.com";

      const oldObj =
        oldData ||
        editMember ||
        originalMembers.find((o) => String(o.id) === String(recordId));
      const newObj =
        newData ||
        editForm ||
        members.find((m) => String(m.id) === String(recordId));

      const diffs: string[] = [];

      const pushField = (label: string, oldVal: any, newVal: any) => {
        const o = oldVal === null || oldVal === undefined ? "" : String(oldVal);
        const n = newVal === null || newVal === undefined ? "" : String(newVal);
        if (o !== n) diffs.push(`${label} changed to "${n}"`);
      };

      if (oldObj || newObj) {
        pushField("First Name", oldObj?.mem_fname, newObj?.mem_fname);
        pushField("Last Name", oldObj?.mem_lname, newObj?.mem_lname);
        pushField(
          "Middle Initial",
          oldObj?.mem_minit || "",
          newObj?.mem_minit || "",
        );
        pushField("Email", oldObj?.mem_email || "", newObj?.mem_email || "");

        const oldSchoolName = (() => {
          if (!oldObj) return "";
          if (typeof oldObj.school === "number")
            return (
              schools.find((s) => s.id === oldObj.school)?.school_name ||
              String(oldObj.school)
            );
          return oldObj.school || "";
        })();
        const newSchoolName = (() => {
          if (!newObj) return "";
          if (typeof newObj.school === "number")
            return (
              schools.find((s) => s.id === newObj.school)?.school_name ||
              String(newObj.school)
            );
          return newObj.school || "";
        })();
        pushField("School", oldSchoolName, newSchoolName);

        const oldCourseName = (() => {
          if (!oldObj) return "";
          if (typeof oldObj.course === "number")
            return (
              courses.find((c: any) => c.id === oldObj.course)?.course_name ||
              String(oldObj.course)
            );
          return oldObj.course || "";
        })();
        const newCourseName = (() => {
          if (!newObj) return "";
          if (typeof newObj.course === "number")
            return (
              courses.find((c: any) => String(c.id) === String(newObj.course))
                ?.course_name || String(newObj.course)
            );
          return newObj.course || "";
        })();
        pushField("Course", oldCourseName, newCourseName);
      }

      const changes =
        diffs.length > 0
          ? `Changes: [${diffs.join(", ")}]`
          : "No changes detected.";

      const memberName =
        (oldObj &&
          `${oldObj.mem_fname || ""} ${oldObj.mem_lname || ""}`.trim()) ||
        (newObj &&
          `${newObj.mem_fname || ""} ${newObj.mem_lname || ""}`.trim()) ||
        `ID: ${recordId}`;

      const detailedMessage = `Updated member "${memberName}" (ID: ${recordId}). ${changes}`;

      const logEntry = {
        action: "Update",
        details: detailedMessage,
        user: whoDidItName,
        user_email: whoDidItEmail,
        table_name: tableName,
      };

      const { error } = await supabase.from("audit_log").insert([logEntry]);
      if (error) console.error("Failed to write audit log:", error);
    } catch (err) {
      console.error("logEditDetailAudit error:", err);
    }
  };

  const [showImportSuccess, setShowImportSuccess] = useState(false);
  const [showRenameSuccess, setShowRenameSuccess] = useState(false);

  const hasEditChanges =
    editMember &&
    (editForm.mem_fname !== editMember.mem_fname ||
      editForm.mem_lname !== editMember.mem_lname ||
      editForm.mem_minit !== (editMember.mem_minit || "") ||
      editForm.mem_email !== (editMember.mem_email || "") ||
      String(editForm.school) !== String(editMember.school || "") ||
      String(editForm.course) !== String(editMember.course || ""));

  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  const [showImportError, setShowImportError] = useState(false);
  const [importErrorMessage, setImportErrorMessage] = useState("");

  const [showEditError, setShowEditError] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");

  //for import image
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const [showImagesConfirm, setShowImagesConfirm] = useState(false);
  const [showImagesSuccess, setShowImagesSuccess] = useState(false);
  const handleConfirmImagesImport = async () => {
    setShowImagesConfirm(false);
    try {
      for (const file of pendingImages) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        const baseName = file.name
          .split(".")
          .slice(0, -1)
          .join(".")
          .toLowerCase()
          .trim()
          .replace(/\s+/g, "_");
        const standardizedName = `${baseName}.${fileExtension}`;

        const { data: existingFiles, error: listError } = await supabase.storage
          .from("member-photos")
          .list("", { search: baseName });

        if (listError) throw listError;

        if (existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles
            .filter(
              (f) => f.name.split(".").slice(0, -1).join(".") === baseName,
            )
            .map((f) => f.name);

          if (filesToDelete.length > 0) {
            const { error: delError } = await supabase.storage
              .from("member-photos")
              .remove(filesToDelete);
            if (delError) throw delError;
          }
        }

        const { error: uploadError } = await supabase.storage
          .from("member-photos")
          .upload(standardizedName, file, {
            upsert: true,
            cacheControl: "0",
          });

        if (uploadError) throw uploadError;
      }

      setPendingImages([]);
      setShowImagesSuccess(true);
    } catch (err: any) {
      console.error("Image import failed:", err);
      setImportErrorMessage(
        err.message || "An unexpected error occurred during image upload.",
      );
      setShowImportError(true);
    }
  };

  //transition to new AY

  const [showTransitionConfirm, setShowTransitionConfirm] = useState(false);
  const [showTransitionSuccess, setShowTransitionSuccess] = useState(false);

  const [showTransitionError, setShowTransitionError] = useState(false);
  const [selectedTransitionYear, setSelectedTransitionYear] =
    useState(currentAcademicYear);

  const handleAYTransition = async () => {
    setShowTransitionConfirm(false);

    const targetCommitteeIds = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    ];
    const yearSuffix = selectedTransitionYear
      .replace("AY ", "")
      .replace("-", "_");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: membersToUpdate, error: fetchError } = await supabase
      .from("member")
      .select("id, mem_fname, mem_lname, mem_email")
      .eq("acadyear", selectedTransitionYear)
      .in("comm", targetCommitteeIds);

    if (fetchError) throw fetchError;
    if (!membersToUpdate || membersToUpdate.length === 0) return;
    const isCurrentUserExec = membersToUpdate.some(
      (m) => m.mem_email.toLowerCase() === user?.email?.toLowerCase(),
    );

    try {
      const { data: membersToUpdate, error: fetchError } = await supabase
        .from("member")
        .select("id, mem_fname, mem_lname")
        .eq("acadyear", selectedTransitionYear)
        .in("comm", targetCommitteeIds);

      if (fetchError) throw fetchError;

      if (!membersToUpdate || membersToUpdate.length === 0) {
        setShowTransitionSuccess(true);
        return;
      }

      const updates = membersToUpdate.map((m) => {
        const firstName = m.mem_fname.toLowerCase().replace(/\s+/g, "");
        const lastName = m.mem_lname.toLowerCase().replace(/\s+/g, "");
        const archivedEmail = `${firstName}_${lastName}-${yearSuffix}-@email.com`;

        return supabase
          .from("member")
          .update({
            mem_email: archivedEmail,
            is_active: false,
          })
          .eq("id", m.id);
      });

      await Promise.all(updates);

      logArchiveAudit(selectedTransitionYear);

      if (isCurrentUserExec) {
        await supabase.auth.signOut();
        window.location.href = "/";
        return;
      }

      const refreshed = await fetchActiveMembers();
      if (refreshed) {
        setMembers(structuredClone(refreshed));
        setOriginalMembers(structuredClone(refreshed));
      }
    } catch (err: any) {
      console.error("Transition failed:", err);
      setShowImportError(true);
    }
  };

  const YearTransitionDropdown = ({ value, options, onChange }: any) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (ref.current && !ref.current.contains(e.target as Node))
          setOpen(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedLabel =
      options.find((o: any) => o.value === value)?.label || "Select Year";

    return (
      <div ref={ref} className="relative w-full font-sans text-left">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-full bg-white px-6 py-3 border border-[#0b1763] rounded-xl text-[#0b1763] font-semibold shadow-sm hover:shadow-md transition flex justify-between items-center cursor-pointer"
        >
          {selectedLabel}
          <svg
            className={`w-5 h-5 text-[#0b1763] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {open && (
          <div className="absolute z-[60] mt-2 w-full bg-white border border-[#0b1763] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <ul className="py-2 max-h-48 overflow-y-auto">
              {options.map((o: any) => (
                <li
                  key={o.value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`px-5 py-3 cursor-pointer transition-colors text-sm font-bold ${
                    value === o.value
                      ? "bg-[#0b1763]/10 text-[#0b1763]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {o.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const isAnyModalOpen =
      showConfirm ||
      showImportConfirm ||
      showExportOptions ||
      showImportError ||
      showSaveSuccess ||
      showDeleteSuccess ||
      showRenameSuccess ||
      showImportSuccess ||
      showEditError ||
      deleteMember ||
      editMember ||
      showImagesConfirm ||
      showImagesSuccess ||
      showTransitionConfirm ||
      showTransitionSuccess ||
      showTransitionError;
  }, [
    showConfirm,
    showImportConfirm,
    showExportOptions,
    showImportError,
    showSaveSuccess,
    showDeleteSuccess,
    showRenameSuccess,
    showImportSuccess,
    showEditError,
    deleteMember,
    editMember,
    showImagesConfirm,
    showImagesSuccess,
    showTransitionConfirm,
    showTransitionSuccess,
    showTransitionError,
  ]);

  type School = {
    id: number;
    school_name: string;
  };
  
  interface Course {
    id: number;
    course_name: string;
  }

  const [schools, setSchools] = useState<School[]>([]);

  const [customSchool, setCustomSchool] = useState("");
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [customSchoolError, setCustomSchoolError] = useState(false);

  const [roleSort, setRoleSort] = useState<"asc" | "desc">("asc");

  const [courses, setCourses] = useState<Course[]>([]);
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [customCourse, setCustomCourse] = useState("");
  const [customCourseError, setCustomCourseError] = useState(false);

  //REAL MAIN PURO RETURN E ANG HIRAP HANAPIN
  return (
    <div className="w-full flex flex-col">
      <main className="flex-1">
        <div className="relative w-full">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-oswald font-bold text-[#011638]">
              Member Directory
            </h1>
            <p className="text-[#475569] font-ubuntu-mono mt-2 mb-4">
              Assign members their committees and roles
            </p>
          </div>

          {/* committee tabs */}
          <div className="flex gap-2 flex-nowrap overflow-x-auto custom-scrollbar-blue">
            {committeeCategories.map((cat) => {
              const getTabColor = (key: string) => {
                const name = key.toLowerCase();
                if (name.includes("internal")) return "text-purple-800";
                if (name.includes("external")) return "text-green-800";
                if (name.includes("education")) return "text-red-800";
                if (name.includes("finance")) return "text-blue-900";
                if (name.includes("publicity")) return "text-pink-800";
                if (name.includes("logistics")) return "text-yellow-600";
                if (name.includes("regional") || name.includes("secretary"))
                  return "text-gray-800";
                return "text-gray-600";
              };
              const colorClass = getTabColor(cat.key);
              return (
                <button
                  key={cat.key}
                  onClick={() => setSelectedFilter(cat.key)}
                  className={`flex-shrink-0 px-5 py-2 rounded-t-xl font-semibold transition-all border cursor-pointer ${
                    selectedFilter === cat.key
                      ? `bg-white shadow-md border-gray-300 border-b-transparent text-[#011638]`
                      : `${colorClass} border-gray-500 hover:shadow-sm hover:opacity-50`
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Members Table */}
          <div className="bg-white/70 backdrop-blur-xl border border-gray-300 border-t-transparent rounded-b-xl shadow-[0_15px_15px_rgba(0,0,0,0.1)] p-6 pt-4 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
              {/* Name Search */}
              <div className="w-full lg:flex-1 relative">
                <input
                  type="text"
                  placeholder="Search member..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 text-sm lg:text-base border border-[#011638] rounded-lg focus:outline-none focus:ring-[#011638] bg-[#fbfaf8] text-[#475569] font-ubuntu-mono"
                />
                <svg
                  className="w-5 h-5 text-[#011638] absolute left-3 top-1/2 transform -translate-y-1/2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Buttons */}
              <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 w-full lg:w-auto">
                {/* import */}

                <label
                  htmlFor="import-pics"
                  className=" cursor-pointer w-full lg:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
                >
                  Import Images
                  <input
                    id="import-pics"
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length === 0) return;

                      setPendingImages(files);
                      setShowImagesConfirm(true);

                      e.target.value = "";
                    }}
                  />
                </label>

                <label
                  htmlFor="import-members"
                  className="cursor-pointer w-full lg:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
                >
                  Import Members
                </label>
                <input
                  type="file"
                  id="import-members"
                  accept=".csv"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const text = await file.text();

                    const parseCSV = (text: string) => {
                      const rows: string[][] = [];
                      let current: string[] = [];
                      let value = "";
                      let insideQuotes = false;

                      for (let i = 0; i < text.length; i++) {
                        const char = text[i];
                        const next = text[i + 1];

                        if (char === '"' && insideQuotes && next === '"') {
                          value += '"';
                          i++;
                        } else if (char === '"') {
                          insideQuotes = !insideQuotes;
                        } else if (char === "," && !insideQuotes) {
                          current.push(value);
                          value = "";
                        } else if (
                          (char === "\n" || char === "\r") &&
                          !insideQuotes
                        ) {
                          if (value || current.length) {
                            current.push(value);
                            rows.push(current);
                            current = [];
                            value = "";
                          }
                        } else {
                          value += char;
                        }
                      }

                      if (value || current.length) {
                        current.push(value);
                        rows.push(current);
                      }

                      return rows.filter((r) => r.length > 1);
                    };

                    const rows = parseCSV(text);
                    const headers = rows[0].map((h) => h.trim());

                    const DEFAULT_ACADYEAR = currentAcademicYear;
                    const DEFAULT_COMM = 23;
                    const DEFAULT_SCHOL_TYPE = "Merit";
                    const DEFAULT_SCHOL_YEAR = 2023;
                    const DEFAULT_SCHOOL = 1;

                    const parsed = rows.slice(1).map((row) => {
                      const obj: any = {};

                      headers.forEach((h, i) => {
                        obj[h] = row[i]?.trim() ?? "";
                      });

                      return {
                        mem_fname: obj.mem_fname,
                        mem_lname: obj.mem_lname,
                        mem_minit: obj.mem_minit || "",
                        role: obj.role || "member",
                        comm: obj.comm ? Number(obj.comm) : DEFAULT_COMM,
                        mem_schol_type:
                          obj.mem_schol_type || DEFAULT_SCHOL_TYPE,
                        mem_schol_year: obj.mem_schol_year
                          ? Number(obj.mem_schol_year)
                          : DEFAULT_SCHOL_YEAR,
                        school: obj.school
                          ? Number(obj.school)
                          : DEFAULT_SCHOOL,
                        is_active: true,
                        mem_email: obj.mem_email?.trim(),
                        acadyear: obj.acadyear || DEFAULT_ACADYEAR,
                      };
                    });

                    setPendingImport(parsed);
                    setShowImportConfirm(true);

                    e.target.value = "";
                  }}
                />

                {/* export */}
                <button
                  onClick={() => setShowExportOptions(true)}
                  className="cursor-pointer w-full lg:w-auto bg-[#eec643] text-[#011638] px-6 py-2 rounded-lg hover:bg-[#d9b237] transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
                >
                  Export Members
                </button>

                <button
                  onClick={() => setShowTransitionConfirm(true)}
                  className="cursor-pointer w-full lg:w-auto border-2 border-[#eec643] bg-[#eec643]/30 text-[#011638] px-6 py-2 rounded-lg hover:bg-[#eec643]/60 transition-colors flex items-center justify-center gap-2 font-oswald whitespace-nowrap"
                >
                  Transition to New Academic Year
                </button>
              </div>
            </div>

            <div className="overflow-y-visible">
              {/* grid start */}
              <div className="hidden lg:grid grid-cols-[minmax(140px,1.5fr)_minmax(140px,1.5fr)_minmax(110px,1fr)_minmax(70px,0.5fr)] font-semibold text-[#011638]/70 px-4 mb-2">
                <button
                  onClick={() =>
                    setNameSortOrder((prev) =>
                      prev === "asc" ? "desc" : "asc",
                    )
                  }
                  className="flex items-center justify-center gap-1 text-center cursor-pointer select-none hover:opacity-70 transition"
                >
                  Name
                  <span className="text-[10px] font-semibold bg-[#011638]/10 px-1.5 py-0.5 rounded">
                    {nameSortOrder === "asc" ? "A-Z" : "Z-A"}
                  </span>
                </button>
                <span className="text-center">Committee</span>
                <span className="text-center">Role</span>
                <span className="text-center">Actions</span>
              </div>

              <div className="space-y-4">
                {isLoading ? (
                  <div className="min-h-[200px]"></div>
                ) : paginatedItems.length === 0 ? (
                  <p className="text-center text-gray-500 text-lg py-6">
                    No members found.
                  </p>
                ) : (
                  paginatedItems.map((member) => {
                    const commName =
                      typeof member.comm === "number"
                        ? committees.find((c) => c.id === member.comm)
                            ?.comm_name || ""
                        : member.comm;

                    return (
                      <div
                        key={member.id}
                        className={`
                        flex flex-col gap-3
                        lg:grid lg:grid-cols-[1.5fr_1.5fr_1fr_0.5fr] lg:items-start
                        px-4 py-3 rounded-xl ring shadow-0 ring-[#d7d7d7] ease-in-out duration-200 transition-all
                        hover:shadow-lg border-l-4
                        ${
                          isRowEdited(member)
                            ? "bg-yellow-50 ring-yellow-300 border-l-yellow-300"
                            : "bg-white/80 border-l-transparent"
                        }
                      `}
                      >
                        <div className="my-auto">
                          <span
                            className="font-bold text-[#141414] break-words whitespace-normal block max-w-full leading-tight"
                            title={`${member.mem_lname}, ${member.mem_fname}${
                              member.mem_minit?.trim()
                                ? ` ${member.mem_minit
                                    .replace(/\./g, "")
                                    .toUpperCase()
                                    .split("")
                                    .map((c) => `${c}.`)
                                    .join("")}`
                                : ""
                            }`}
                          >
                            {member.mem_lname.toUpperCase()},{" "}
                            {member.mem_fname
                              .toLowerCase()
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                            {member.mem_minit?.trim()
                              ? ` ${member.mem_minit
                                  .replace(/\./g, "")
                                  .toUpperCase()
                                  .split("")
                                  .map((c) => `${c}.`)
                                  .join("")}`
                              : ""}
                          </span>

                          <span className="text-xs text-gray-400 break-all mt-1 block">
                            {member.mem_email}
                          </span>

                          <span
                            className="mt-1.5 text-xs text-gray-500 break-all block"
                            title={`${member.school_rel?.school_name || member.school}${
                              member.course_rel?.course_name
                                ? ` | ${member.course_rel.course_name}`
                                : ""
                            }`}
                          >
                            {member.school_rel?.school_name || member.school}
                            {member.course_rel?.course_name
                              ? ` | ${member.course_rel.course_name}`
                              : ""}
                          </span>
                        </div>
                        <div
                          className={`${getCommitteeStyle(commName)} font-medium rounded-xl my-auto`}
                        >
                          <CommitteeDropdown
                            value={member.comm}
                            options={committees.map((c) => ({
                              label: c.comm_name,
                              value: c.id,
                            }))}
                            onChange={(val) =>
                              handleCommitteeChange(member.id, val)
                            }
                          />
                        </div>
                        <Dropdown
                          value={member.role}
                          options={[
                            { label: "Member", value: "member" },
                            { label: "Admin", value: "admin" },
                            { label: "Superadmin", value: "superadmin" },
                          ]}
                          onChange={(val) =>
                            handleRoleChange(member.id, val as string)
                          }
                          styleClass={`${getRoleStyle(member.role)} my-auto`}
                        />
                        <div className="flex flex-wrap justify-center gap-2 min-w-[70px] my-auto">
                          <button
                            onClick={() => {
                              setEditMember(member);
                              setEditForm({
                                mem_fname: member.mem_fname,
                                mem_lname: member.mem_lname,
                                mem_minit: member.mem_minit || "",
                                mem_email: member.mem_email || "",
                                school: member.school?.toString() || "",
                                course: member.course?.toString() || "",
                              });

                              setEditFieldErrors({
                                mem_fname: false,
                                mem_lname: false,
                                mem_minit: false,
                                mem_email: false,
                              });
                            }}
                            className="text-[#011638] hover:scale-110 transition-transform p-1 lg:p-0 cursor-pointer"
                          >
                            {/* edit icon */}
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>

                          <button
                            onClick={() => setDeleteMember(member)}
                            className="text-red-500 hover:scale-110 transition-transform cursor-pointer"
                          >
                            {/* delete icon */}
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />

            {/* save Changes  */}
            <div className="flex justify-end pt-4">
              <button
                disabled={!hasChanges}
                onClick={() => setShowConfirm(true)}
                className={`px-8 py-3 rounded-xl font-semibold shadow-xl transition ${
                  hasChanges
                    ? "bg-[#1e4db7] text-white hover:scale-105"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* mowdals */}
      <Popup
        isOpen={showImportError}
        title="Import Failed"
        onClose={() => setShowImportError(false)}
        maxWidth="sm"
      >
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-500 text-center mb-6">
          Failed to import members. Please check your file format and column
          names then try again.
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => setShowImportError(false)}
            className="px-4 py-2 rounded-xl bg-[#1e4db7] text-white cursor-pointer"
          >
            OK
          </button>
        </div>
      </Popup>

      {showSaveSuccess && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfaf8] rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-2 bg-[#011638]" />

            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-oswald font-bold text-[#011638] mb-2">
                Changes Saved
              </h2>

              <p className="text-[#475569] font-ubuntu-mono mb-6">
                All updates have been successfully saved.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowSaveSuccess(false)}
                  className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg hover:bg-[#0d21a1] transition-colors font-oswald cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfaf8] rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-2 bg-[#011638]" />

            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-red-200">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 12H4"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-oswald font-bold text-[#011638] mb-2">
                Delete Successful
              </h2>

              <p className="text-[#475569] font-ubuntu-mono mb-6">
                Member has been successfully removed.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowDeleteSuccess(false)}
                  className="px-6 py-2 text-[#fbfaf8] bg-red-500 rounded-lg hover:bg-red-600 transition-colors font-oswald cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRenameSuccess && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfaf8] rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-2 bg-[#011638]" />

            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-oswald font-bold text-[#011638] mb-2">
                Edit Successful
              </h2>

              <p className="text-[#475569] font-ubuntu-mono mb-6">
                Member details have been successfully updated.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowRenameSuccess(false)}
                  className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg hover:bg-[#0d21a1] transition-colors font-oswald cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImportSuccess && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfaf8] rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-2 bg-[#011638]" />

            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-oswald font-bold text-[#011638] mb-2">
                Import Successful
              </h2>

              <p className="text-[#475569] font-ubuntu-mono mb-6">
                {pendingImport.length === 0
                  ? "Members have been successfully imported and updated."
                  : "Members have been successfully imported."}
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowImportSuccess(false)}
                  className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg hover:bg-[#0d21a1] transition-colors font-oswald cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Popup
        isOpen={showImportConfirm}
        title="Confirm Import"
        onClose={() => {
          setPendingImport([]);
          setShowImportConfirm(false);
        }}
        maxWidth="sm"
      >
        <p className="text-sm text-gray-500 text-center mb-6">
          You are about to import{" "}
          <span className="font-semibold text-[#011638]">
            {pendingImport.length}
          </span>{" "}
          members into the database.
        </p>
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={() => {
              setPendingImport([]);
              setShowImportConfirm(false);
            }}
            className="px-4 py-2 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            className="px-4 py-2 rounded-xl bg-[#1e4db7] text-white cursor-pointer"
          >
            Confirm Import
          </button>
        </div>
      </Popup>

      <Popup
        isOpen={showExportOptions}
        title="Export Members"
        onClose={() => setShowExportOptions(false)}
        maxWidth="sm"
      >
        <p className="text-sm text-gray-500 text-center mb-6">
          Choose file format
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              handleExportCSV();
              setShowExportOptions(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#1e4db7] text-white hover:opacity-90 cursor-pointer"
          >
            Export as CSV
          </button>
          <button
            onClick={() => {
              handleExportPDF();
              setShowExportOptions(false);
            }}
            className="px-4 py-2 rounded-xl bg-[#1e4db7] text-white hover:opacity-90 cursor-pointer"
          >
            Export as PDF
          </button>
        </div>
        <div className="flex justify-center mt-5">
          <button
            onClick={() => setShowExportOptions(false)}
            className="text-sm text-gray-400 hover:underline cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </Popup>

      <Popup
        isOpen={!!deleteMember}
        title="Delete Member"
        onClose={() => setDeleteMember(null)}
        maxWidth="sm"
      >
        <p className="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-[#011638]">
            {deleteMember?.mem_fname} {deleteMember?.mem_lname}
          </span>
          ?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setDeleteMember(null)}
            className="px-4 py-2 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleDeleteConfirm()}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 cursor-pointer"
          >
            Delete
          </button>
        </div>
      </Popup>

      <Popup
        isOpen={!!editMember}
        title="Edit Member"
        onClose={() => setEditMember(null)}
        maxWidth="lg"
      >
        <div className="space-y-3">
          <label className="text-sm text-gray-600">Name</label>
          <div>
          <input
            maxLength={30}
            type="text"
            placeholder="First Name"
            value={editForm.mem_fname}
            onChange={(e) => {
              const value = e.target.value;
              setEditForm((prev) => ({ ...prev, mem_fname: value }));
              setEditFieldErrors((prev) => ({ ...prev, mem_fname: value.trim() === "" }));
            }}
            className={`w-full px-3 py-2 border rounded-lg transition ${editFieldErrors.mem_fname ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}`}
          />
          {editFieldErrors.mem_fname && (
              <p className="text-red-500 text-sm mt-1">
                First name is required
              </p>
            )}
          </div>

          <div>
          <input
            maxLength={20}
            type="text"
            placeholder="Last Name"
            value={editForm.mem_lname}
            onChange={(e) => {
              const value = e.target.value;
              setEditForm((prev) => ({ ...prev, mem_lname: value }));
              setEditFieldErrors((prev) => ({ ...prev, mem_lname: value.trim() === "" }));
            }}
            className={`w-full px-3 py-2 border rounded-lg transition ${editFieldErrors.mem_lname ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}`}
          />
          {editFieldErrors.mem_lname && (
              <p className="text-red-500 text-sm mt-1">
                Last name is required
              </p>
            )}
          </div>

          <div>
          <input
            type="text"
            placeholder="Middle Initial"
            value={editForm.mem_minit}
            onChange={(e) => {
              const rawValue = e.target.value.toUpperCase();

              const lettersOnly = rawValue.replace(/[^A-Z]/g, "");

              const hasInvalidChar = /[^A-Z]/.test(rawValue);
              const hasTooManyLetters = lettersOnly.length > 2;

              const cleanedValue = lettersOnly.slice(0, 2);

              setEditForm((prev) => ({...prev, mem_minit: cleanedValue,}));
              setEditFieldErrors((prev) => ({...prev, mem_minit: hasInvalidChar || hasTooManyLetters,}));
            }}
            className={`w-full px-3 py-2 border rounded-lg transition ${ editFieldErrors.mem_minit ? "border-red-500 ring-2 ring-red-200" : "border-gray-300" }`}
          />
          {editFieldErrors.mem_minit && (
            <p className="text-red-500 text-sm mt-1">
              Only letters allowed and maximum of 2 characters only
            </p>
          )}
        </div>
        </div>

        <div className="mt-5 space-y-1">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={editForm.mem_email}
            onChange={(e) => {
              const value = e.target.value;
              setEditForm((prev) => ({...prev, mem_email: value,}));
              setEditFieldErrors((prev) => ({...prev, mem_email: value.trim() === "" ||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),}));
            }}
            className={`w-full px-3 py-2 border rounded-lg transition ${editFieldErrors.mem_email ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}`}
          />
          {editFieldErrors.mem_email && (
            <p className="text-red-500 text-sm mt-1">
              Invalid email address
            </p>
          )}
        </div>

        <div className="mt-5 space-y-1">
          <label className="text-sm text-gray-600">School</label>
          <SchoolDropdown
            value={editForm.school}
            options={schools.map((s) => ({
              label: s.school_name,
              value: s.id,
            }))}
            onChange={(val) => {
              const stringVal = val?.toString() || "";
              setEditForm((prev) => ({ ...prev, school: stringVal }));

              if (val === "other") {
                setIsAddingSchool(true);
              } else {
                setIsAddingSchool(false);
                setCustomSchool("");
              }
            }}
          />
          {isAddingSchool && (
            <input
              type="text"
              placeholder="Enter new school"
              value={customSchool}
              onChange={(e) => {
                setCustomSchool(e.target.value);
                setCustomSchoolError(false);
              }}
              className={`w-full px-3 py-2 rounded-lg mt-2 border transition ${customSchoolError ? "border-red-500 ring-2 ring-red-200" : "border-gray-300"}`}
            />
          )}
          {customSchoolError && (
            <p className="text-red-500 text-sm mt-1">
              Please enter a school name
            </p>
          )}
        </div>

        <div className="mt-5 space-y-1">
        <label className="text-sm text-gray-600">Course</label>

        <CourseDropdown
          value={editForm.course}
          options={courses.map((c) => ({
            label: c.course_name,
            value: c.id,
          }))}
          onChange={(val) => {
            const stringVal = val?.toString() || "";
            setEditForm((prev) => ({ ...prev, school: stringVal }));

            if (val === "other") {
              setIsAddingCourse(true);
            } else {
              setIsAddingCourse(false);
              setCustomCourse("");
            }
          }}
        />

        {isAddingCourse && (
          <input
            type="text"
            placeholder="Enter new course"
            value={customCourse}
            onChange={(e) => {
              setCustomCourse(e.target.value);
              setCustomCourseError(false);
            }}
            className={`w-full px-3 py-2 rounded-lg mt-2 border transition ${
              customCourseError
                ? "border-red-500 ring-2 ring-red-200"
                : "border-gray-300"
            }`}
          />
        )}

        {customCourseError && (
          <p className="text-red-500 text-sm mt-1">
            Please enter a course name
          </p>
        )}
      </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={() => setEditMember(null)}
            className="px-4 py-2 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleEditSave}
            disabled={!hasEditChanges}
            className={`px-4 py-2 rounded-xl text-white transition cursor-pointer ${hasEditChanges ? "bg-[#1e4db7] hover:opacity-90" : "bg-gray-300 cursor-not-allowed"}`}
          >
            Save
          </button>
        </div>
      </Popup>

      {/* confirm  */}
      <Popup
        isOpen={showConfirm}
        title="Save Changes?"
        onClose={() => setShowConfirm(false)}
        maxWidth="sm"
      >
        <p className="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to apply all updates?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowConfirm(false)}
            className="px-4 py-2 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-[#1e4db7] text-white cursor-pointer"
          >
            Confirm
          </button>
        </div>
      </Popup>

      <Popup
        isOpen={showImagesConfirm}
        title="Confirm Picture Import"
        onClose={() => {
          setPendingImages([]);
          setShowImagesConfirm(false);
        }}
        maxWidth="sm"
      >
        <p className="text-sm text-gray-500 text-center mb-6">
          You are about to upload{" "}
          <span className="font-semibold text-[#011638]">
            {pendingImages.length}
          </span>{" "}
          images. Existing photos with the same filenames will be overwritten.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => {
              setPendingImages([]);
              setShowImagesConfirm(false);
            }}
            className="px-4 py-2 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmImagesImport}
            className="px-4 py-2 rounded-xl bg-[#1e4db7] text-white cursor-pointer"
          >
            Confirm Upload
          </button>
        </div>
      </Popup>

      {showImagesSuccess && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#fbfaf8] rounded-lg shadow-xl max-w-md w-full mx-auto overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="h-2 bg-[#011638]" />

            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-green-200">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-2xl font-oswald font-bold text-[#011638] mb-2">
                Upload Successful
              </h2>

              <p className="text-[#475569] font-ubuntu-mono mb-6">
                All pictures have been successfully imported.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setShowImagesSuccess(false)}
                  className="px-6 py-2 text-[#fbfaf8] bg-[#1e4db7] rounded-lg hover:bg-[#0d21a1] transition-colors font-oswald cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*transition to*/}
      <Popup
        isOpen={showTransitionConfirm}
        title="Transition Academic Year and Archive Current Executives"
        onClose={() => setShowTransitionConfirm(false)}
        maxWidth="lg"
      >
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Select Year to Archive:
          </label>
          <div className="flex justify-center">
            <YearTransitionDropdown
              value={selectedTransitionYear}
              options={academicYears.map((year) => ({
                label: year,
                value: year,
              }))}
              onChange={(val: string) => setSelectedTransitionYear(val)}
            />
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mb-4">
          By clicking confirm, the Executive Committee for
          <br /> <b>{selectedTransitionYear}</b> will have their emails archived
          and access disabled. They will NOT be able to access the website until
          the <b>Organization Adviser</b> imports the new batch of Executives.
        </p>

        <p className="text-xs text-red-500 font-semibold text-center mb-6 uppercase">
          This process cannot be reversed.
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setShowTransitionConfirm(false)}
            className="px-6 py-2 rounded-xl text-[#011638] font-semibold cursor-pointer hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAYTransition}
            className="px-6 py-2 rounded-xl bg-[#1e4db7] text-white font-semibold cursor-pointer hover:bg-[#0b1763] shadow-lg transition"
          >
            Confirm
          </button>
        </div>
      </Popup>

      <Popup
        isOpen={showTransitionSuccess}
        title="Archive Error"
        onClose={() => setShowTransitionSuccess(false)}
        maxWidth="sm"
      >
        <p className="text-sm text-gray-500 text-center mb-6">
          There are currently no members to be archived
        </p>
        <div className="flex justify-center">
          <button
            onClick={() => setShowTransitionSuccess(false)}
            className="px-4 py-2 rounded-xl bg-[#1e4db7] text-white cursor-pointer"
          >
            OK
          </button>
        </div>
      </Popup>
    </div>
  );
}
