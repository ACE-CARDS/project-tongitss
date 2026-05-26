"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import Pagination from "@/components/ui/pagination";
import { useUser } from "@/components/context/userContext";
import SortIcon from "@/components/ui/sortIcon";
import TableActions from "@/components/ui/tableActions";
import SearchBar from "@/components/ui/searchBar";
import AddButton from "@/components/ui/addButton";
import Popup from "@/components/ui/popup";

interface Category {
  id: number;
  r_category_name: string;
  created_at: string;
}

type SortOrder = "asc" | "desc" | null;
type CategorySortField = "name" | "created_at" | null;

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
  usageCount: { surveys: number; theses: number };
  isDeleting: boolean;
  isCheckingUsage: boolean;
}) {
  if (!isOpen) return null;
  const hasUsage = usageCount.surveys > 0 || usageCount.theses > 0;

  if (isCheckingUsage) {
    return (
      <Popup isOpen={isOpen} title="Confirm Delete" onClose={onClose} maxWidth="md">
        <span className="form_error">{"\u200b"}</span>
        <div className="form_label text-center">Loading...</div>
      </Popup>
    );
  }

  return (
    <Popup isOpen={isOpen} title="Confirm Delete" onClose={onClose} maxWidth="md">
      <span className="form_error">{"\u200b"}</span>

      {hasUsage ? (
        <>
          <p className="text-sm text-[#475569] font-ubuntu-mono mb-4">
            Cannot delete category because it is currently in use:
          </p>
          <ul className="list-disc list-inside mb-6 text-sm text-[#475569] font-ubuntu-mono space-y-1 pl-2">
            {usageCount.surveys > 0 && (
              <li>
                {usageCount.surveys} {usageCount.surveys === 1 ? "survey" : "surveys"}
              </li>
            )}
            {usageCount.theses > 0 && (
              <li>
                {usageCount.theses} {usageCount.theses === 1 ? "thesis" : "theses"}
              </li>
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
            Are you sure you want to delete <span className="font-bold text-[#011638]">"{name}"</span>? This action cannot be undone.
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
  category,
  categories,
  isSaving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<string | null>;
  category: Category;
  categories: Category[];
  isSaving: boolean;
}) {
  const [name, setName] = useState(category.r_category_name);
  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");

  const noChange = name.trim() === category.r_category_name;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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


  const handleEdit = async () => {
    setNameError("");
    setError("");

    if (!name.trim()) {
      setNameError("Category name is required");
      return;
    }
    if (
      categories.some(
        (c) =>
          c.r_category_name.toLowerCase() === name.trim().toLowerCase() &&
          c.id !== category.id
      )
    ) {
      setNameError("This category name already exists");
      return;
    }

    const dbError = await onSave(name.trim());
    if (dbError) {
      setError(dbError);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <Popup isOpen={isOpen} title="Edit Category" onClose={onClose} maxWidth="md">
      <span className="form_error">{error || "\u200b"}</span>

      <label className="form_label">Category Name</label>
      <input
        type="text"
        value={name}
        onChange={handleInputChange}
        placeholder="e.g. Artificial Intelligence"
        maxLength={50}
        data-error={!!nameError}
        className="form_input"
      />
      <span className="form_error">
        {nameError || "\u200b"}
      </span>

      <div className="flex justify-end gap-3 mt-4">
        <button 
          onClick={onClose} 
          disabled={isSaving}
          className="form_btn-cancel"
        >
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
  categories,
  isAdding,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string) => Promise<string | null>;
  categories: Category[];
  isAdding: boolean;
}) {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [error, setError] = useState("");

  const noChange = name.trim() === "";

  useEffect(() => {
    if (isOpen) {
      setName("");
      setNameError("");
      setError("");
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleAdd = async () => {
    setNameError("");
    setError("");

    const trimmedName = name.trim();

    // Final sweep validation on Submit
    if (!trimmedName) {
      setNameError("Category name is required");
      return;
    }

    if (categories.some((c) => c.r_category_name.toLowerCase() === trimmedName.toLowerCase())) {
      setNameError("This category name already exists");
      return;
    }

    const dbError = await onAdd(trimmedName);
    if (dbError) {
      setError(dbError);
    }
  };
  if (!isOpen) return null;

  return (
    <Popup isOpen={isOpen} title="Add New Category" onClose={onClose} maxWidth="md">
      <span className="form_error">{error || "\u200b"}</span>

      <label className="form_label">Category Name</label>
      <input
        type="text"
        value={name}
        onChange={handleInputChange}
        placeholder="e.g. Data Structures"
        maxLength={50}
        data-error={!!nameError}
        className="form_input"
      />
      <span className="form_error">
        {nameError || "\u200b"}
      </span>

      <div className="flex justify-end gap-3 mt-4">
        <button 
          onClick={onClose} 
          disabled={isAdding}
          className="form_btn-cancel"
        >
          Cancel
        </button>
        <button
          onClick={handleAdd}
          disabled={isAdding || noChange}
          className="form_btn-blue"
        >
          {isAdding ? "Adding..." : "Add Category"}
        </button>
      </div>
    </Popup>
  );
}

// --- MAIN COMPONENT ---
export default function CategoryAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // State for Sorting
  const [sortField, setSortField] = useState<CategorySortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Popups & Processing States
  const [popups, setPopups] = useState({ add: false, edit: false, del: false });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [usageCount, setUsageCount] = useState({ surveys: 0, theses: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingUsage, setIsCheckingUsage] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("r_category")
      .select("*")
      .order("r_category_name");
    if (error) console.error(error);
    else setCategories(data || []);
    setLoading(false);
  };

  const handleSort = (field: Exclude<CategorySortField, null>) => {
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
    let filtered = categories.filter((item) =>
      item.r_category_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(formatDate(item.created_at || "")).toLowerCase().includes(searchTerm.toLowerCase()),
    );

    if (sortField && sortOrder) {
      filtered = [...filtered].sort((a, b) => {
        let comparison = 0;
        if (sortField === "name") {
          comparison = a.r_category_name.localeCompare(b.r_category_name);
        } else if (sortField === "created_at") {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    setFilteredCategories(filtered);
    setCurrentPage(1);
  }, [searchTerm, categories, sortField, sortOrder]);

  const checkUsage = async (id: number) => {
    const [s, t] = await Promise.all([
      supabase.from("survey").select("id", { count: "exact", head: true }).eq("r_category", id),
      supabase.from("thesis").select("id", { count: "exact", head: true }).eq("r_category", id),
    ]);
    return {
      surveys: s.count || 0,
      theses: t.count || 0,
    };
  };

  const handleAdd = async (name: string): Promise<string | null> => {
    setIsProcessing(true);
    const { data, error } = await supabase
      .from("r_category")
      .insert({ r_category_name: name })
      .select()
      .single();

    if (error) {
      setIsProcessing(false);
      return error.message;
    } else {
      await logCreateAudit(name);
      setCategories((prev) =>
        [...prev, data].sort((a, b) => a.r_category_name.localeCompare(b.r_category_name)),
      );
      setPopups((p) => ({ ...p, add: false }));
      setIsProcessing(false);
      return null;
    }
  };

  const handleEdit = async (newName: string): Promise<string | null> => {
    if (!selectedCategory) return "No category selected";
    setIsProcessing(true);

    const { error } = await supabase
      .from("r_category")
      .update({ r_category_name: newName })
      .eq("id", selectedCategory.id);

    if (error) {
      setIsProcessing(false);
      return error.message;
    } else {
      await logEditAudit(selectedCategory, newName);
      setCategories((prev) =>
        prev
          .map((c) => (c.id === selectedCategory.id ? { ...c, r_category_name: newName } : c))
          .sort((a, b) => a.r_category_name.localeCompare(b.r_category_name)),
      );
      setPopups((p) => ({ ...p, edit: false }));
      setIsProcessing(false);
      return null;
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    setIsProcessing(true);

    const { error } = await supabase.from("r_category").delete().eq("id", selectedCategory.id);

    if (error) {
      setIsProcessing(false);
      return error.message;
    } else {
      await logDeleteAudit(selectedCategory.id, selectedCategory.r_category_name);
      setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
      setPopups((p) => ({ ...p, del: false }));
      setIsProcessing(false);
      return null;
    }
  };

  // User Audit Context
  const { user } = useUser();
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  const loadCurrentUser = async (email: string) => {
    const { data } = await supabase
      .from("member")
      .select("mem_fname, mem_lname, mem_email")
      .eq("mem_email", email)
      .single();

    const fullName = data ? `${data.mem_fname || ""} ${data.mem_lname || ""}`.trim() : email;
    setCurrentUserName(fullName || email);
    setCurrentUserEmail(data?.mem_email || email);
  };

  useEffect(() => {
    if (user?.email) loadCurrentUser(user.email);
  }, [user?.email]);

  const logCreateAudit = async (itemTitle: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";
    const logEntry = {
      action: "Create",
      details: `Created a new category: "${itemTitle}"`,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "r_category",
    };
    await supabase.from("audit_log").insert([logEntry]);
  };

  const logEditAudit = async (old: Category, newName: string) => {
    if (old.r_category_name === newName) return;
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";
    const logEntry = {
      action: "Update",
      details: `Updated category "${newName}" (ID: ${old.id}). Changes: [category changed from "${old.r_category_name}" to "${newName}"]`,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "r_category",
    };
    await supabase.from("audit_log").insert([logEntry]);
  };

  const logDeleteAudit = async (recordId?: number, itemTitle?: string) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";
    const logEntry = {
      action: "Delete",
      details: `Deleted category "${itemTitle || "Unknown Title"}" (ID: ${recordId || "Unknown ID"})`,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "r_category",
    };
    await supabase.from("audit_log").insert([logEntry]);
  };

  const itemsPerPage = 5;
  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedItems = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="py-4">
      <div className="mb-6 flex flex-col md:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AddButton
          onClick={() => {
            setSelectedCategory(null);
            setIsProcessing(false);
            setPopups((p) => ({ ...p, add: true }));
          }}
          label="Add Category"
        />
      </div>

      <div className="manage_table_div">
        <table className="manage_table">
          <thead className="manage_thead">
            <tr>
              <th
                className={`w-[400px] th-sortable ${sortField === "name" ? "is-active" : ""}`}
                onClick={() => handleSort("name")}
              >
                <div>
                  Name
                  <SortIcon field="name" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th
                className={`w-[200px] th-sortable ${sortField === "created_at" ? "is-active" : ""}`}
                onClick={() => handleSort("created_at")}
              >
                <div>
                  Date Added
                  <SortIcon field="created_at" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th className="w-[200px]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="status">Loading records...</td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="status">No categories found.</td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="title">{item.r_category_name}</td>
                  <td className="date_col">{formatDate(item.created_at)}</td>
                  <td className="text-center">
                    <TableActions
                      item={item}
                      onEditClick={(cat) => {
                        setSelectedCategory(cat);
                        setPopups((p) => ({ ...p, edit: true }));
                      }}
                      onDeleteClick={async (cat) => {
                        setSelectedCategory(cat);
                        setPopups((p) => ({ ...p, del: true }));
                        setIsCheckingUsage(true);
                        try {
                          const usage = await checkUsage(cat.id);
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
        categories={categories}
        isAdding={isProcessing}
      />

      {selectedCategory && (
        <>
          <EditPopup
            key={`edit-${selectedCategory.id}`}
            isOpen={popups.edit}
            onClose={() => setPopups((p) => ({ ...p, edit: false }))}
            onSave={handleEdit}
            category={selectedCategory}
            categories={categories}
            isSaving={isProcessing}
          />
          <DeleteConfirmPopup
            key={`del-${selectedCategory.id}`}
            isOpen={popups.del}
            onClose={() => setPopups((p) => ({ ...p, del: false }))}
            onConfirm={handleDelete}
            name={selectedCategory.r_category_name}
            usageCount={usageCount}
            isDeleting={isProcessing}
            isCheckingUsage={isCheckingUsage}
          />
        </>
      )}
    </div>
  );
}