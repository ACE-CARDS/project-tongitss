"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import NavBar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import LoadingState from "@/components/ui/loading/mainLoadingState";
import { useUser } from "@/components/context/userContext";
import BackButton from "@/components/ui/backButton";

interface ResourceItem {
  id: number;
  title: string;
  link: string;
  type: string | null;
  created_at: string;
}

function EditResourceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resourceId = searchParams.get("id");
  const from = searchParams.get("from");
  const supabase = createClient();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string>("");
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);

  // Form States
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    type: "",
  });

  const [initialFormData, setInitialFormData] = useState({
    title: "",
    link: "",
    type: "",
  });

  // Error states
  const [linkError, setLinkError] = useState("");
  const [titleError, setTitleError] = useState("");

  // User audit state
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  // Check if any changes were made
  const isUnchanged = useMemo(() => {
    return JSON.stringify(formData) === JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  // Fetch resource types from enum
  useEffect(() => {
    const fetchResourceTypes = async () => {
      try {
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
            setResourceTypes(['document', 'form', 'guide', 'merch', 'module', 'publication', 'report', 'other']);
          } else {
            const sortedTypes = Array.from(types).sort();
            const otherIndex = sortedTypes.indexOf('other');
            if (otherIndex !== -1) {
              sortedTypes.splice(otherIndex, 1);
              sortedTypes.push('other');
            }
            setResourceTypes(sortedTypes);
          }
        } else if (data && data.length > 0) {
          const sortedData = data.sort();
          const otherIndex = sortedData.indexOf('other');
          if (otherIndex !== -1) {
            sortedData.splice(otherIndex, 1);
            sortedData.push('other');
          }
          setResourceTypes(sortedData);
        } else {
          // Fallbacks
          setResourceTypes(['document', 'form', 'guide', 'merch', 'module', 'publication', 'report', 'other']);
        }
      } catch (err) {
        console.error("Error fetching resource types:", err);
        setResourceTypes(['document', 'form', 'guide', 'merch', 'module', 'publication', 'report', 'other']);
      }
    };
    
    fetchResourceTypes();
  }, []);

  // Load current user for audit
  useEffect(() => {
    if (user?.email) {
      loadCurrentUser(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    if (resourceId) {
      fetchResourceData();
    } else {
      router.push("/dashboard");
    }
  }, [resourceId]);

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

  const fetchResourceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("downloads")
        .select("*")
        .eq("id", resourceId)
        .single();

      if (error) throw error;

      if (data) {
        const fetchedFields = {
          title: data.title || "",
          link: data.link || "",
          type: data.type || "document",
        };

        setFormData(fetchedFields);
        setInitialFormData(fetchedFields);
      } else {
        setError("Resource not found.");
      }
    } catch (err) {
      console.error("Error fetching resource:", err);
      setError("Failed to load resource. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear errors on change
    if (name === "title" && titleError) {
      setTitleError("");
    }
    if (name === "link" && linkError) {
      setLinkError("");
    }
  };

  const validateTitle = (): boolean => {
    const title = formData.title?.trim() || "";
    if (!title) {
      setTitleError("Title is required.");
      return false;
    }
    setTitleError("");
    return true;
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const checkDuplicateLink = async (url: string, currentId: string) => {
    if (!url || url === initialFormData.link) return true;

    const { data } = await supabase
      .from("downloads")
      .select("id")
      .eq("link", url)
      .neq("id", currentId)
      .maybeSingle();

    if (data) {
      setLinkError(
        "This link is already in use. Please provide a unique link.",
      );
      return false;
    }
    setLinkError("");
    return true;
  };

  const getChangesString = () => {
    const changes: string[] = [];

    if (initialFormData.title !== formData.title) {
      changes.push(`title to "${formData.title}"`);
    }
    if (initialFormData.link !== formData.link) {
      changes.push(`link to "${formData.link}"`);
    }
    if (initialFormData.type !== formData.type) {
      changes.push(`type to "${formData.type}"`);
    }

    return changes.length > 0 ? changes.join(", ") : "No changes";
  };

  const logEditAudit = async (recordId: string) => {
  const whoDidItName = currentUserName || user?.email || "Unknown User";
  const whoDidItEmail = currentUserEmail || user?.email || "unknown@email.com";
  
  let changes = [];
  
  if (initialFormData.title !== formData.title) {
    changes.push(`Title changed from "${initialFormData.title}" to "${formData.title}"`);
  }
  if (initialFormData.link !== formData.link) {
    changes.push(`Link changed from "${initialFormData.link}" to "${formData.link}"`);
  }
  if (initialFormData.type !== formData.type) {
    changes.push(`Type changed from "${initialFormData.type}" to "${formData.type}"`);
  }

  const changesString = changes.join(", ");
  const detailedMessage = `Updated resource "${formData.title}": ${changesString}`;

  const logEntry = {
    action: "Update",
    details: detailedMessage,
    user: whoDidItName,
    user_email: whoDidItEmail,
    table_name: "downloads",
  };

  const { error } = await supabase.from("audit_log").insert([logEntry]);
  if (error) {
    console.error("Failed to write audit log:", error);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setLinkError("");
    setTitleError("");

    // Validate title
    if (!validateTitle()) {
      return;
    }

    // Validate URL format
    if (!validateUrl(formData.link)) {
      setSubmitError(
        "Please enter a valid URL.",
      );
      return;
    }

    setSaving(true);

    try {
      // Check duplicate link
      const isLinkUnique = await checkDuplicateLink(
        formData.link,
        resourceId!,
      );
      if (!isLinkUnique) {
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("downloads")
        .update({
          title: formData.title,
          link: formData.link,
          type: formData.type,
        })
        .eq("id", resourceId);

      if (error) throw error;

      await logEditAudit(resourceId!);

      router.push(
        from === "admin"
          ? "/dashboard/edit/success?type=resource&from=admin"
          : "/dashboard/edit/success?type=resource",
      );
      router.refresh();
    } catch (err) {
      console.error("Error updating resource:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update resource";
      setSubmitError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  if (user?.role !== "admin" && user?.role !== "superadmin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[#475569] font-ubuntu-mono">
          You are not authorized to edit resources.
        </p>
      </div>
    );
  }

  return (
    <>
      <NavBar />
      <div
        className="w-full mx-auto max-w-[1920px] min-h-screen bg-[#fbfaf8]"
        style={{
          backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div className="pt-5">
          <main className="container mx-auto py-8 px-4 max-w-3xl">
            <div className="flex flex-col mb-6 gap-4">
              <BackButton
                href={
                  from === "admin"
                    ? "/dashboard?tab=manage&section=resources"
                    : "/dashboard"
                }
                className="!mb-0"
              />
              <h1 className="text-2xl font-oswald font-bold text-[#011638]">
                Edit Resource
              </h1>
            </div>

            {/* Error display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="font-ubuntu-mono text-sm">{error}</p>
                <button
                  onClick={() => fetchResourceData()}
                  className="mt-2 px-4 py-1 bg-[#011638] text-white rounded hover:bg-[#1a2a4f] transition-colors font-ubuntu-mono text-sm"
                >
                  Retry
                </button>
              </div>
            )}

            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                <p className="font-ubuntu-mono text-sm">{submitError}</p>
              </div>
            )}

            {!error && (
              <div className="bg-[#fbfaf8] rounded-lg shadow-xl border border-[#e0e7ff] p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="bg-[#011638] text-[#fbfaf8] p-3 rounded-t-md">
                      <h2 className="text-lg font-oswald font-semibold">
                        Resource Information
                      </h2>
                    </div>
                    <div className="border-2 border-t-2 border-[#011638] rounded-b-md p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                          Title <span className="text-[#eec643]">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          maxLength={200}
                          className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        />
                        {titleError && (
                          <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                            {titleError}
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                          Type
                        </label>
                        <select
                          name="type"
                          value={formData.type}
                          onChange={handleChange}
                          className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        >
                          {resourceTypes.map((type) => (
                            <option key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-oswald font-medium text-[#011638] mb-1">
                          Link <span className="text-[#eec643]">*</span>
                        </label>
                        <input
                          type="url"
                          name="link"
                          value={formData.link}
                          onChange={handleChange}
                          required
                          maxLength={500}
                          className="text-[#475569] font-ubuntu-mono w-full px-3 py-2 border border-[#94a3b8] rounded focus:outline-none focus:border-[#011638] bg-[#fbfaf8]"
                        />
                        {linkError && (
                          <span className="text-xs mt-1 block font-ubuntu-mono text-red-600">
                            {linkError}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e0e7ff]">
                    <Link
                      href={
                        from === "admin"
                          ? "/dashboard?tab=manage&section=resources"
                          : "/dashboard"
                      }
                      className="px-4 py-2 text-[#011638] hover:text-[#1a2a4f] font-ubuntu-mono"
                    >
                      Cancel
                    </Link>
                    <button
                      type="submit"
                      disabled={saving || isUnchanged}
                      className={`px-4 py-2 rounded-lg font-oswald transition-colors ${
                        saving || isUnchanged
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : "text-[#fbfaf8] bg-[#1e4db7] border border-[#1e4db7] hover:bg-[#1a2a4f]"
                      }`}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
        <Footer />
      </div>
    </>
  );
}

export default function EditResource() {
  const { user } = useUser();

  if (!user) {
    return <LoadingState />;
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <EditResourceContent />
    </Suspense>
  );
}