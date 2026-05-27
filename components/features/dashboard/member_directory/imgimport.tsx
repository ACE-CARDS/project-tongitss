import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const ImgImport = () => {
  const supabase = createClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    const files: File[] = Array.from(fileList);
    if (files.length === 0) return;

    const fileNames = files.map((f) => f.name);
    const hasDuplicatesInBatch = new Set(fileNames).size !== fileNames.length;

    if (hasDuplicatesInBatch) {
      alert(
        "Error: You selected multiple different images with the same filename. Please rename them before importing.",
      );
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      let completed = 0;

      for (const file of files) {
        setMessage(`Uploading: ${file.name}...`);

        const { error } = await supabase.storage
          .from("member-pictures")
          .upload(file.name, file, {
            upsert: true, // RULE: Overwrites existing file in bucket if name matches
          });

        if (error) {
          console.error(`Error uploading ${file.name}:`, error.message);
          // We continue with other files even if one fails
        }

        completed++;
        setProgress(Math.round((completed / files.length) * 100));
      }

      setMessage("Import complete! All photos synced.");
    } catch (err) {
      setMessage("A critical error occurred during import.");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 border rounded-xl bg-white shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">Bulk Member Photo Import</h2>
        <p className="text-sm text-gray-500">
          Files will overwrite existing photos with the same name.
        </p>
      </div>

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="cursor-pointer file:rounded-md file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
      />

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {message && (
        <p className="text-sm font-medium text-blue-800">{message}</p>
      )}
    </div>
  );
};

export default ImgImport;
