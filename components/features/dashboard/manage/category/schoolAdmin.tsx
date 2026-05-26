"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import Pagination from "@/components/ui/pagination";
import { useUser } from "@/components/context/userContext";
import SearchBar from "@/components/ui/searchBar";
import AddButton from "@/components/ui/addButton";
import TableActions from "@/components/ui/tableActions";
import Popup from "@/components/ui/popup";
import FormDropdown from "@/components/ui/formDropdown";
import SortIcon from "@/components/ui/sortIcon";

// Types
interface School {
  id: number;
  school_name: string;
  province: number;
  created_at: string;
  province_name?: string;
}

interface Province {
  id: number;
  prov_name: string;
}

type SortOrder = "asc" | "desc" | null;
type SchoolSortField = "name" | "province" | "created_at" | null;

// Helper: Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

// --- Sub-Component: Delete Confirmation ---
function DeleteConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  name,
  usageCount,
  isDeleting,
  isCheckingUsage,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  name: string;
  usageCount: {
    members: number;
    surveys: number;
    theses: number;
    organizations: number;
    executives: number;
  };
  isDeleting: boolean;
  isCheckingUsage: boolean;
}) {

  if (!isOpen) return null;
  const hasUsage = Object.values(usageCount).some((count) => count > 0);

  if (isCheckingUsage) {
    return (
      <Popup isOpen={isOpen} title="Confirm Delete" onClose={onClose} maxWidth="md">
        <span className="form_error">
          {"\u200b"}
        </span>
        <div className="form_label text-center">
          Loading...
        </div>
      </Popup>
    );
  }

  return (
    <Popup isOpen={isOpen} title="Confirm Delete" onClose={onClose} maxWidth="md">
      <span className="form_error">
        {"\u200b"}
      </span>

      {hasUsage ? (
        <>
          <p className="text-sm text-[#475569] font-ubuntu-mono mb-4">
            Cannot delete school because it is currently in use:
          </p>
          <ul className="list-disc list-inside mb-6 text-sm text-[#475569] font-ubuntu-mono space-y-1 pl-2">
            {usageCount.members > 0 && (
              <li>{usageCount.members} members</li>
            )}
            {usageCount.surveys > 0 && (
              <li>{usageCount.surveys} surveys</li>
            )}
            {usageCount.theses > 0 && (
              <li>{usageCount.theses} theses</li>
            )}
            {usageCount.organizations > 0 && (
              <li>{usageCount.organizations} organizations</li>
            )}
            {usageCount.executives > 0 && (
              <li>{usageCount.executives} executives</li>
            )}
          </ul>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="form_btn-blue"
            >
              OK
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
            Are you sure you want to delete "{name}"? This action cannot be
            undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="form_btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="form_btn-red"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </>
      )}
    </Popup>
  );
}

// --- Sub-Component: Edit Popup ---
function EditPopup({
  isOpen,
  onClose,
  onSave,
  school,
  schools,
  provinces,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, name: string, provinceId: number) => void;
  school: School;
  schools: School[];
  provinces: Province[];
  isSaving: boolean;
}) {
  console.count("Popup Render Cycle Ticker");
  const [name, setName] = useState(school.school_name);
  const [provinceId, setProvinceId] = useState<number>(school.province);

  const [nameError, setNameError] = useState("");
  const [provinceError, setProvinceError] = useState("");
  const [error, setError] = useState("");

  const noChange =
    school !== null &&
    name.trim() === school.school_name &&
    provinceId === school.province;

  useEffect(() => {
    if (isOpen && school) {
      setName(school.school_name);
      setProvinceId(school.province);
      setNameError("");
      setProvinceError("");
      setError("");
    }
  }, [isOpen, school]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);

    const trimmedValue = value.trim();

    if (value === "") {
      setNameError("");
      return;
    }

    if (trimmedValue.length > 0 && trimmedValue.length < 2) {
      setNameError("Name too short");
    } else {
      setNameError("");
    }
  };

  const handleProvinceChange = (val: string | null) => {
    const selectedId = Number(val);
    setProvinceId(selectedId);
    
    if (selectedId !== 0) {
      setProvinceError("");
    }
  };

  const handleEdit = async () => {
    setNameError("");
    setProvinceError("");
    setError("");

    let hasError = false;
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("Name is required");
      hasError = true;
    } else if (trimmedName.length < 2) {
      setNameError("Name too short");
      hasError = true;
    }

    if (provinceId === 0) {
      setProvinceError("Please select a province");
      hasError = true;
    }

    if (
      schools.some(
        (s) =>
          s.school_name.toLowerCase() === trimmedName.toLowerCase() &&
          s.id !== school?.id
      )
    ) {
      setNameError("School name already exists");
      hasError = true;
    }

    if (hasError || !school) return;

    const dbError: any = await onSave(school.id, trimmedName, provinceId);
    if (dbError) {
      setError(dbError);
    }
  };

  const dropdownOptions = useMemo(() => {
    return provinces.map((p) => ({
      label: p.prov_name,
      value: p.id.toString(),
    }));
  }, [provinces]);

  if (!isOpen || !school) return null;

  return (
    <Popup isOpen={isOpen} title="Edit School" onClose={onClose} maxWidth="md">
      <span className="form_error">
        {error || "\u200b"}
      </span>

      <label className="form_label">School Name</label>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="School Name..."
        data-error={!!nameError}
        className="form_input"
      />
      <span className="form_error">{nameError || "\u200b"}</span>

      <label className="form_label">Province</label>
      <FormDropdown
        value={provinceId.toString()}
        onChange={handleProvinceChange}
        options={dropdownOptions}
        className="mb-2"
        data-error={!!provinceError}
        placeholder="Select a Province..."
      />
      <span className="form_error">{provinceError || "\u200b"}</span>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="form_btn-cancel" disabled={isSaving}>
          Cancel
        </button>
        <button
          onClick={handleEdit}
          disabled={isSaving || noChange}
          className="form_btn-blue"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </Popup>
  );
}

// --- Sub-Component: Add Popup ---
function AddPopup({
  isOpen,
  onClose,
  onAdd,
  schools,
  provinces,
  isAdding,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, provinceId: number) => void;
  schools: School[];
  provinces: Province[];
  isAdding: boolean;
}) {
  const [name, setName] = useState("");
  const [provinceId, setProvinceId] = useState<number>(0);
  const [nameError, setNameError] = useState("");
  const [provinceError, setProvinceError] = useState("");
  const [error, setError] = useState("");

  const noChange = name.trim() === "" && provinceId === 0;

  useEffect(() => {
    if (isOpen) {
      setName("");
      setProvinceId(0);
      setNameError("");
      setProvinceError("");
      setError("");
    }
  }, [isOpen]);

const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setName(value);

  const trimmedValue = value.trim();

  if (value === "") {
    setNameError("");
    return;
  }

  if (trimmedValue.length > 0 && trimmedValue.length < 2) {
    setNameError("Name too short");
  } else {
    setNameError("");
  }
};

const handleProvinceChange = (val: string | null) => {
  const selectedId = Number(val);
  setProvinceId(selectedId);
  
  if (selectedId !== 0) {
    setProvinceError("");
  }
};

  const handleAdd = async () => {
    setNameError("");
    setProvinceError("");
    setError("");

    let hasError = false;
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("Name is required");
      hasError = true;
    } else if (trimmedName.length < 2) {
      setNameError("Name too short");
      hasError = true;
    }

    if (provinceId === 0) {
      setProvinceError("Please select a province");
      hasError = true;
    }

    if (
      schools.some(
        (s) =>
          s.school_name.toLowerCase() === trimmedName.toLowerCase()
      )
    ) {
      setNameError("School name already exists");
      hasError = true;
    }

    if (hasError) return;

    const dbError: any = await onAdd(trimmedName, provinceId);
    if (dbError) {
      setError(dbError);
    }
  };

  
  const dropdownOptions = useMemo(() => {
    return provinces.map((p) => ({
      label: p.prov_name,
      value: p.id.toString(),
    }));
  }, [provinces]);


  if (!isOpen) return null;

  return (
    <Popup isOpen={isOpen} title="Add School" onClose={onClose} maxWidth="md">
      <span className="form_error">
        {error || "\u200b"}
      </span>

      <label className="form_label">
        School Name
      </label>
      <input
        type="text"
        value={name}
        onChange={handleNameChange}
        placeholder="School Name..."
        data-error={!!nameError}
        className="form_input"
      />
      <span className="text-xs text-red-600 mb-2 flex">{nameError || "\u200b"}</span>

      <label className="form_label">
        Province
      </label>
      <FormDropdown
        value={provinceId === 0 ? "" : provinceId.toString()}
        onChange={handleProvinceChange}
        options={dropdownOptions}
        className="mb-2"
        data-error={!!provinceError}
        placeholder="Select a Province..."
      />
      <span className="text-xs text-red-600 mb-2 flex">{provinceError || "\u200b"}</span>

      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="form_btn-cancel">
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={isAdding || noChange}
          className="form_btn-blue"
        >
          {isAdding ? "Adding..." : "Add School"}
        </button>
      </div>

    </Popup>
  );
}

// --- MAIN COMPONENT ---
export default function SchoolAdmin() {
  const [schools, setSchools] = useState<School[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // State for Sorting
  const [sortField, setSortField] = useState<SchoolSortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Popups & Processing
  const [popups, setPopups] = useState({ add: false, edit: false, del: false });
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [usageCount, setUsageCount] = useState({
    members: 0,
    surveys: 0,
    theses: 0,
    organizations: 0,
    executives: 0,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const [provRes, schoolRes] = await Promise.all([
        supabase.from("province").select("*").order("prov_name"),
        supabase.from("school").select("*").order("school_name"),
      ]);
      if (!provRes.error) setProvinces(provRes.data || []);
      if (!schoolRes.error) {
        setSchools(
          (schoolRes.data || []).map((s: any) => ({
            ...s,
            province_name: s.province?.prov_name,
          })),
        );
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleSort = (field: Exclude<SchoolSortField, null>) => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else {
      if (sortOrder === "asc") setSortOrder("desc");
      else {
        setSortField(null);
        setSortOrder(null);
      }
    }
  };

  useEffect(() => {
    let result = schools.filter((s) =>
      s.school_name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    if (sortField && sortOrder) {
      result = [...result].sort((a, b) => {
        let comp = 0;
        if (sortField === "name")
          comp = a.school_name.localeCompare(b.school_name);
        else if (sortField === "province")
          comp = (a.province_name || "").localeCompare(b.province_name || "");
        else if (sortField === "created_at")
          comp =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortOrder === "asc" ? comp : -comp;
      });
    }
    setFilteredSchools(result);
    setCurrentPage(1);
  }, [searchTerm, schools, sortField, sortOrder]);

  const checkUsage = async (id: number) => {
    const queries = [
      "member",
      "survey",
      "thesis",
      "organization",
      "executives",
    ].map((table) =>
      supabase
        .from(table)
        .select("id", { count: "exact", head: true })
        .eq("school", id),
    );
    const results = await Promise.all(queries);
    return {
      members: results[0].count || 0,
      surveys: results[1].count || 0,
      theses: results[2].count || 0,
      organizations: results[3].count || 0,
      executives: results[4].count || 0,
    };
  };

  const handleAdd = async (name: string, provinceId: number) => {
    setIsProcessing(true);
    const { data, error } = await supabase
      .from("school")
      .insert({ school_name: name, province: provinceId })
      .select()
      .single();

    if (error) {
      setIsProcessing(false);
      return error.message;
    }

    else {
      const provName = provinces.find((p) => p.id === provinceId)?.prov_name;
      await logCreateAudit(name);
      setSchools((prev) =>
        [...prev, { ...data, province_name: provName }].sort((a, b) =>
          a.school_name.localeCompare(b.school_name),
        ),
      );
      setPopups((p) => ({ ...p, add: false }));
      setIsProcessing(false);
      return null;
    }
  };

  const handleEdit = async (id: number, name: string, provinceId: number) => {
    const originalSchool = schools.find((s) => s.id === id);
    if (!originalSchool) return;

    setIsProcessing(true);
    const { error } = await supabase
      .from("school")
      .update({ school_name: name, province: provinceId })
      .eq("id", id);

    if (error) {
      setIsProcessing(false);
      return error.message;
    }

    else {
      const provName = provinces.find((p) => p.id === provinceId)?.prov_name;
      await logEditAudit(originalSchool, name, provinceId, provName || "N/A");
      setSchools((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                school_name: name,
                province: provinceId,
                province_name: provName,
              }
            : s,
        ),
      );
      setPopups((p) => ({ ...p, edit: false }));
      setIsProcessing(false);
      return null;
    }
  };

  const handleDelete = async () => {
    if (!selectedSchool) return;
    setIsProcessing(true);
    const { error } = await supabase
      .from("school")
      .delete()
      .eq("id", selectedSchool.id);

    if (error) {
      setIsProcessing(false);
      return error.message;
    }

    else {
      await logDeleteAudit(selectedSchool.id, selectedSchool.school_name);
      setSchools((prev) => prev.filter((s) => s.id !== selectedSchool.id));
      setPopups((p) => ({ ...p, del: false }));
      setIsProcessing(false);
      return null;
    }
  };

  const itemsPerPage = 5;
  const totalItems = filteredSchools.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

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

  const logCreateAudit = async (itemTitle: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Created a new school named "${itemTitle}"`;

    const logEntry = {
      action: "Create",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "school",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) {
      console.error("Failed to write audit log:", error);
    }
  };

  const provinceLookup = useMemo(() => {
    return Object.fromEntries(provinces.map((p) => [p.id, p.prov_name]));
  }, [provinces]);

  const logEditAudit = async (
    old: School,
    newName: string,
    newProvinceId: number,
    newProvinceName: string,
  ) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const changes: string[] = [];

    if (old.school_name !== newName) {
      changes.push(
        `school name changed from "${old.school_name}" to "${newName}"`,
      );
    }
    if (old.province !== newProvinceId) {
      changes.push(
        `province changed from "${provinceLookup[old.province] || "N/A"}" to "${newProvinceName}"`,
      );
    }

    if (changes.length === 0) return;

    const detailedMessage = `Updated school "${newName}" (ID: ${old.id}). Changes: [${changes.join(", ")}]`;

    const logEntry = {
      action: "Update",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "school",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) console.error("Failed to write edit audit log:", error);
  };

  const logDeleteAudit = async (recordId?: number, itemTitle?: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail =
      currentUserEmail || user?.email || "unknown@email.com";

    const detailedMessage = `Deleted school "${itemTitle || "Unknown Title"}" (ID: ${recordId || "Unknown ID"})`;

    const logEntry = {
      action: "Delete",
      details: detailedMessage,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "school",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);

    if (error) {
      console.error("Failed to log.");
    }
  };


  return (
    <div className="py-4">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AddButton 
          onClick={() => {
            setSelectedSchool(null);
            setIsProcessing(false);
            setPopups((p) => ({ ...p, add: true }));
          }} 
          label="New School" 
        />
      </div>

      <div className="manage_table_div">
        <table className="manage_table">
          <thead className="manage_thead">
            <tr>
              <th
                className={`w-[40%] th-sortable ${sortField === "name" ? "is-active" : ""}`}
                onClick={() => handleSort("name")}
              >
                <div>
                  School Name
                  <SortIcon field="name" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th
                className={`w-[20%] th-sortable ${sortField === "province" ? "is-active" : ""}`}
                onClick={() => handleSort("province")}
              >
                <div>
                  Province
                  <SortIcon field="province" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th
                className={`w-[20%] th-sortable ${sortField === "created_at" ? "is-active" : ""}`}
                onClick={() => handleSort("created_at")}
              >
                <div>
                  Date Added
                  <SortIcon field="created_at" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th className="w-[20%]">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="status"
                >
                  Loading records...
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="status"
                >
                  No schools found.
                </td>
              </tr>
            ) : (
            paginatedItems.map((school) => (
              <tr
                key={school.id}
                className="hover:bg-blue-50/50 transition-colors"
              >
                <td className="title">
                  {school.school_name}
                </td>

                <td >
                  {provinceLookup[school.province] || "N/A"}
                </td>

                <td className="date_col">
                  {formatDate(school.created_at)}
                </td>

                <td className="text-center">
                  <TableActions 
                    item={school}
                    onEditClick={() =>{
                      setSelectedSchool(school);
                      setPopups((p) => ({ ...p, edit: true }));
                    }}
                    onDeleteClick={async (school) => {
                      setSelectedSchool(school);
                      setPopups((p) => ({ ...p, del: true }));
                      setIsCheckingUsage(true);
                      
                      try {
                        const usage = await checkUsage(school.id);
                        setUsageCount(usage);
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsCheckingUsage(false);
                      }
                    }}
                  />
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      <AddPopup
        isOpen={popups.add}
        onClose={() => setPopups((p) => ({ ...p, add: false }))}
        onAdd={handleAdd}
        schools={schools}
        provinces={provinces}
        isAdding={isProcessing}
      />

      {selectedSchool && (
        <>
          <EditPopup
            key={`edit-${selectedSchool.id}`}
            isOpen={popups.edit}
            onClose={() => setPopups((p) => ({ ...p, edit: false }))}
            onSave={handleEdit}
            school={selectedSchool}
            schools={schools}
            provinces={provinces}
            isSaving={isProcessing}
          />
          <DeleteConfirmPopup
            key={`del-${selectedSchool.id}`}
            isOpen={popups.del}
            onClose={() => setPopups((p) => ({ ...p, del: false }))}
            onConfirm={handleDelete}
            name={selectedSchool?.school_name || ""}
            usageCount={usageCount}
            isDeleting={isProcessing}
            isCheckingUsage={isCheckingUsage}
          />
        </>
      )}
    </div>
  );
}
