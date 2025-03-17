"use client";

import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

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
  const editor = useCreateBlockNote({
    initialContent: content ? JSON.parse(content) : undefined,
  });

  editor.onChange((editor) => {
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
