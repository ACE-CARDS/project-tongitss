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
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export type SortField = "title" | "type" | "created_at" | null;
export type SortOrder = "asc" | "desc" | null;

// Expandable Description
function ResourceDescription({ description }: { description: string | null }) {
  const [isOpen, setIsOpen] = useState(false);
  if (!description) return null;
  if (description.length <= 100) {
    return (
      <p className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed break-words">
        {description}
      </p>
    );
  }
  return (
    <div className="w-full">
      {!isOpen ? (
        <div className="flex flex-end flex-col">
          <p className="text-sm text-[#475569] font-ubuntu-mono line-clamp-2 break-words">
            {description}
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="text-[#0d21a1] ml-auto text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors cursor-pointer"
          >
            Read more
          </button>
        </div>
      ) : (
        <div className="flex flex-end flex-col">
          <div className="text-sm text-[#475569] font-ubuntu-mono leading-relaxed max-h-32 overflow-y-auto pr-2 break-words custom-scrollbar-blue">
            {description}
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#0d21a1] ml-auto text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors cursor-pointer"
          >
            Read less
          </button>
        </div>
      )}
    </div>
  );
}

function ResourceLink({ link }: { link: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // If link has more than 2 lines
  const lineLength = 40; // Average chars per line
  const maxLines = 2;
  const maxChars = maxLines * lineLength;
  const shouldTruncate = link.length > maxChars;

  return (
    <div className="flex flex-col items-start gap-1 w-full">
      <div 
        className={`text-sm text-[#0d21a1] font-ubuntu-mono break-all text-left w-full ${
          !isExpanded && shouldTruncate ? 'line-clamp-2' : ''
        }`}
      >
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          {link}
        </a>
      </div>
      {shouldTruncate && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="text-[#0d21a1] ml-auto text-xs font-ubuntu-mono hover:text-[#011638] mt-1 inline-block transition-colors cursor-pointer"
        >
          {isExpanded ? "Read Less" : "Read More"}
        </button>
      )}
    </div>
  );
}

function ResourceImage({ imageUrl, title }: { imageUrl: string | null; title: string }) {
  if (!imageUrl) {
    return (
      <div className="w-20 h-28 flex-shrink-0 border border-[#011638]/20 bg-[#011638] flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-[#fbfaf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-20 h-28 rounded-lg flex-shrink-0 border border-[#011638]/20 overflow-hidden mx-auto">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
    </div>
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
        Are you sure you want to delete the resource
        <span className="font-bold text-[#011638] py-2 break-words">"{title}"?</span> This action cannot be undone.
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
      (item.link || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || "").toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="manage_table_div overflow-x-auto">
        <table className="manage_table min-w-full table-fixed">
          <thead className="manage_thead">
            <tr>
              <th className="w-[120px]">Image</th>
              
              <th
                className={`w-[300px] th-sortable ${sortField === "title" ? "is-active" : ""}`}
                onClick={() => handleSort("title")}
              >
                <div>
                  Title & Description
                  <SortIcon field="title" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th
                className={`w-[130px] th-sortable ${sortField === "type" ? "is-active" : ""}`}
                onClick={() => handleSort("type")}
              >
                <div>
                  Type
                  <SortIcon field="type" sortField={sortField} sortOrder={sortOrder} />
                </div>
              </th>

              <th className="w-[180px] text-left">Link</th>

              <th
                className={`w-[130px] th-sortable ${sortField === "created_at" ? "is-active" : ""}`}
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
                <td colSpan={6} className="status">Loading resources...</td>
              </tr>
            ) : filteredResources.length === 0 ? (
              <tr>
                <td colSpan={6} className="status">No resources found.</td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                  {/* Image */}
                  <td className="align-middle text-center">
                    <ResourceImage imageUrl={item.image_url} title={item.title} />
                  </td>

                  {/* Title & Description */}
                  <td className="align-top break-words max-w-full whitespace-normal">
                    <span className="text-sm font-oswald font-semibold text-[#011638] block mb-1 break-words">
                      {item.title}
                    </span>
                    <ResourceDescription description={item.description} />
                  </td>

                  {/* Type */}
                  <td className="align-middle text-center">
                    <span className="text-sm font-ubuntu-mono text-[#011638]">
                      {formatType(item.type)}
                    </span>
                  </td>

                  {/* Link */}
                  <td className="align-middle">
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