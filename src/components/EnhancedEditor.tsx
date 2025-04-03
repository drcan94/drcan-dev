"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { useMemo } from "react";

interface EditorProps {
  content?: string;
  onChange?: (content: string) => void;
  isEditable?: boolean;
}

export function EnhancedEditor({
  content,
  onChange,
  isEditable = true,
}: EditorProps) {
  const { resolvedTheme } = useTheme();

  // Parse initial content at the top level
  const initialContent = useMemo(() => {
    return content ? JSON.parse(content) : undefined;
  }, [content]);

  // Create editor instance at the top level
  const editor = useCreateBlockNote({
    initialContent,
  });

  // Handle content changes
  editor.onChange(() => {
    if (onChange) {
      onChange(JSON.stringify(editor.topLevelBlocks));
    }
  });

  return (
    <div className="w-full max-w-none">
      <BlockNoteView
        editor={editor}
        theme={resolvedTheme === "dark" ? "dark" : "light"}
        editable={isEditable}
        className={isEditable ? "" : "blog-content"}
      />
    </div>
  );
}
