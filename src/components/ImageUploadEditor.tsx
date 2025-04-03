"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  isEditable?: boolean;
}

export function ImageUploadEditor({
  content,
  onChange,
  isEditable = true,
}: EditorProps) {
  const { resolvedTheme } = useTheme();
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Get the uploadThing client
  const { startUpload } = useUploadThing("blogInlineImage");

  // Create editor with initial content and file upload support
  const editor = useCreateBlockNote({
    initialContent: content ? JSON.parse(content) : undefined,
    // Enable image uploads directly from the editor
    uploadFile: isEditable
      ? async (file) => {
          try {
            // Use UploadThing client directly
            const res = await startUpload([file]);

            if (!res || res.length === 0) {
              setUploadError("Upload failed: No response from server");
              return null;
            }

            console.log("Upload success:", res);

            // Return the URL to use in the editor
            return res[0].url;
          } catch (error) {
            console.error("Image upload error:", error);
            setUploadError(
              error instanceof Error ? error.message : "Unknown error",
            );
            return null;
          }
        }
      : undefined,
  });

  // Handle content changes
  editor.onChange(() => {
    if (onChange) {
      onChange(JSON.stringify(editor.topLevelBlocks));
    }
  });

  return (
    <div className="w-full max-w-none">
      {uploadError && (
        <div className="mb-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
          Error: {uploadError}
          <button
            className="ml-2 text-xs underline"
            onClick={() => setUploadError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={isEditable}
        className={isEditable ? "" : "blog-content"}
      />
    </div>
  );
}
