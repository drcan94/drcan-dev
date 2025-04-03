"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { useState } from "react";

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  isEditable?: boolean;
}

export default function Editor({
  content,
  onChange,
  isEditable = true,
}: EditorProps) {
  const { resolvedTheme } = useTheme();
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Create editor with initial content and file upload support
  const editor = useCreateBlockNote({
    initialContent: content ? JSON.parse(content) : undefined,
    // Enable image uploads directly from the editor
    uploadFile: isEditable
      ? async (file) => {
          try {
            // Create FormData to upload the file
            const formData = new FormData();
            formData.append("file", file);

            // Upload to UploadThing
            const res = await fetch("/api/uploadthing?router=blogInlineImage", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) {
              const error = await res.text();
              console.error("Upload failed:", error);
              setUploadError(`Upload failed: ${res.status} ${res.statusText}`);
              return null;
            }

            const data = await res.json();
            console.log("Upload success:", data);

            // Return the URL to use in the editor
            return data.url;
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
      {isEditable && (
        <div className="mb-4 rounded-md bg-muted p-3 text-sm">
          <p className="mb-2 font-medium">Editör İpuçları:</p>
          <ul className="ml-4 list-disc space-y-1 text-muted-foreground">
            <li>
              Metin bloğuna tıklayıp "/" tuşuna basarak farklı içerik tipleri
              ekleyebilirsiniz
            </li>
            <li>
              Görsel eklemek için: / tuşuna basıp "Image" seçin veya doğrudan
              sürükleyip bırakın
            </li>
            <li>
              İçerikte kullanılan görseller editörün genişliğine göre otomatik
              ölçeklendirilir
            </li>
            <li>
              Görseller için ideal boyut: 800-1200px genişliğinde, yüksek
              kaliteli görseller
            </li>
          </ul>
        </div>
      )}

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
