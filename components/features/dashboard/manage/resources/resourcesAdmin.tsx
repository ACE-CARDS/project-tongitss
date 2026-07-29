"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Pagination from "@/components/ui/pagination";
import { useUser } from "@/components/context/userContext";
import SortIcon from "@/components/ui/sortIcon";
import TableActions from "@/components/ui/tableActions";
import SearchBar from "@/components/ui/searchBar";
import AddButton from "@/components/ui/addButton";
import Popup from "@/components/ui/popup";
import FormActions from "@/components/ui/FormActions";

interface ResourceItem {
  id: number;
  title: string;
  link: string;
  type: string | null;
  created_at: string;
}

export type SortField = "title" | "type" | "created_at" | null;
export type SortOrder = "asc" | "desc" | null;

function ResourceLink({ link }: { link: string }) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-[#0d21a1] font-ubuntu-mono hover:underline break-all"
    >
      {link}
    </a>
  );
}

function DeleteConfirmPopup({
  isOpen,
  onClose,
  onConfirm,
  title,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting: boolean;
}) {
  if (!isOpen) return null;

  return (
    <Popup 
      isOpen={isOpen} 
      title="Confirm Delete" 
      onClose={isDeleting ? () => {} : onClose}
      maxWidth="md"
    >
      <span className="form_error">{"\u200b"}</span>
      <p className="text-sm text-[#475569] font-ubuntu-mono mb-6">
        Are you sure you want to delete the resource "<span className="font-bold text-[#011638]">{title}</span>?" This action cannot be undone.
      </p>
      <FormActions
        onCancelClick={onClose}
        onSubmitClick={onConfirm}
        isStatus={isDeleting}
        variant="red"
        showBorder={false}
        submitLabel="Delete"
        submittingLabel="Deleting..."
      />
    </Popup>
  );
}

export default function ResourcesAdmin() {
  const supabase = createClient();
  const router = useRouter();

  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [filteredResources, setFilteredResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePopupOpen, setDeletePopupOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // User State
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
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  // Fetch resource types from enum
  const fetchResourceTypes = async () => {
    try {
      // Get enum values from RPC func
      const { data, error } = await supabase
        .rpc('get_resources_types');
      
      if (error) {
        console.error("RPC Error:", error);
        const { data: typeData, error: typeError } = await supabase
          .from("downloads")
          .select("type")
          .not("type", "is", null);
        
        if (typeError) throw typeError;
        
        const types = new Set<string>();
        typeData.forEach(item => {
          if (item.type) {
            types.add(item.type);
          }
        });
        
        if (types.size === 0) {
          setAvailableTypes(['document', 'form', 'guide', 'merch', 'module', 'publication', 'report', 'other']);
        } else {
          setAvailableTypes(Array.from(types).sort());
        }
      } else if (data && data.length > 0) {
        setAvailableTypes(data.sort());
      } else {
        setAvailableTypes(['document', 'form', 'guide', 'merch', 'module', 'publication', 'report', 'other']);
      }
    } catch (err) {
      console.error("Error fetching resource types:", err);
      // Final fallback
      setAvailableTypes(['document', 'form', 'guide', 'merch', 'module', 'publication', 'report', 'other']);
    }
  };

  const logDeleteAudit = async (recordId?: number, itemTitle?: string | null) => {
    const whoDidItName = currentUserName || user?.email || "Unknown User";
    const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";

    const logEntry = {
      action: "Delete",
      details: `Deleted resource "${itemTitle || "Unknown Title"}" (ID: ${recordId || "Unknown ID"})`,
      user: whoDidItName,
      user_email: whoDidItEmail,
      table_name: "downloads",
    };

    const { error } = await supabase.from("audit_log").insert([logEntry]);
    if (error) console.error("Failed to write audit log", error);
  };

  useEffect(() => {
    fetchResources();
    fetchResourceTypes();
  }, []);

  useEffect(() => {
    let filtered = resources.filter((item) =>
      (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.link || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortField && sortOrder) {
      filtered.sort((a, b) => {
        let aValue = "";
        let bValue = "";
        
        if (sortField === "title") {
          aValue = (a.title || "").toLowerCase();
          bValue = (b.title || "").toLowerCase();
        } else if (sortField === "type") {
          aValue = (a.type || "").toLowerCase();
          bValue = (b.type || "").toLowerCase();
        } else if (sortField === "created_at") {
          aValue = new Date(a.created_at).getTime().toString();
          bValue = new Date(b.created_at).getTime().toString();
        }
        
        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }
    setFilteredResources(filtered);
    setCurrentPage(1);
  }, [searchTerm, resources, sortField, sortOrder]);

  const fetchResources = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("downloads")
      .select("*")
      .order("created_at", { ascending: false });
    setResources(data || []);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!selectedResource) return;
    setIsDeleting(true);

    try {
      await logDeleteAudit(selectedResource.id, selectedResource.title);
      const { error } = await supabase.from("downloads").delete().eq("id", selectedResource.id);

      if (error) {
        console.error("Delete failed:", error);
        return;
      }

      setResources((prev) => prev.filter((item) => item.id !== selectedResource.id));
      setDeletePopupOpen(false);
      setSelectedResource(null);
    } catch (err) {
      console.error("Unexpected removal error:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSort = (field: SortField) => {
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

  const totalItems = filteredResources.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
  
  const paginatedItems = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    return filteredResources.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredResources, validCurrentPage, itemsPerPage]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatType = (type: string | null) => {
    if (!type) return "Document";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-oswald font-bold text-[#011638]">
          Resources Management
        </h1>
        <p className="text-[#475569] font-ubuntu-mono mt-1">
          Manage downloadable resources, forms, and documents
        </p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <AddButton
          href="/dashboard/add/resource?from=admin"
          label="Add Resource"
        />
      </div>

      {/* Table */}
      <div className="manage_table_div">
        <table className="manage_table">
          <thead className="manage_thead">
            <tr>
              <th
                className={`w-[300px] th-sortable ${sortField === "title" ? "is-active" : ""}`}
                onClick={() => handleSort("title")}
              >
                <div>
                  Title
                  <SortIcon field="title" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th
                className={`w-[200px] th-sortable ${sortField === "type" ? "is-active" : ""}`}
                onClick={() => handleSort("type")}
              >
                <div>
                  Type
                  <SortIcon field="type" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th className="w-[300px]">
                Link
              </th>

              <th
                className={`w-[150px] th-sortable ${sortField === "created_at" ? "is-active" : ""}`}
                onClick={() => handleSort("created_at")}
              >
                <div>
                  Date Added
                  <SortIcon field="created_at" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th className="w-[100px]">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="status">Loading resources...</td>
              </tr>
            ) : filteredResources.length === 0 ? (
              <tr>
                <td colSpan={5} className="status">No resources found.</td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  {/* Title */}
                  <td className="align-middle break-words max-w-full whitespace-normal text-center">
                    <span className="text-sm font-oswald font-semibold text-[#011638] block break-words">
                      {item.title}
                    </span>
                  </td>

                  {/* Type */}
                  <td className="align-middle text-center">
                    <span className="text-sm font-ubuntu-mono text-[#011638]">
                      {formatType(item.type)}
                    </span>
                  </td>

                  {/* Link */}
                  <td className="align-top break-words max-w-full whitespace-normal">
                    <ResourceLink link={item.link} />
                  </td>

                  {/* Date */}
                  <td className="date_col text-center align-middle">
                    {formatDate(item.created_at)}
                  </td>

                  {/* Actions */}
                  <td className="text-center">
                    <TableActions
                      item={item}
                      editHref={`/dashboard/edit/resource?id=${item.id}&from=admin`}
                      onDeleteClick={(targetItem) => {
                        setSelectedResource(targetItem);
                        setDeletePopupOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={validCurrentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />

      <DeleteConfirmPopup
        isOpen={deletePopupOpen}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) {
            setDeletePopupOpen(false);
            setSelectedResource(null);
          }
        }}
        onConfirm={handleDelete}
        title={selectedResource?.title || "this resource"}
      />
    </div>
  );
}