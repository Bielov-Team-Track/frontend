"use client";

import { AttachmentsUploader } from "@/components";
import type { UploadedAttachment } from "@/components/ui/attachments-uploader";
import { getMediaUploadUrl, uploadFileToS3 } from "@/lib/api/messages";
import { Message } from "@/lib/models/Messages";
import { Check, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";

type MessageEditFormProps = {
  message: Message;
  onSave: (content: string, addMediaIds?: string[], removeAttachmentIds?: string[]) => void;
  onCancel: () => void;
  isSaving?: boolean;
};

/** Convert existing message attachments to UploadedAttachment format for the uploader */
function toUploadedAttachments(message: Message): UploadedAttachment[] {
  return (message.attachments || []).map((a) => ({
    id: a.id,
    preview: a.fileUrl,
    type: (a.contentType.startsWith("image/") ? "image" : "document") as "image" | "document",
    status: "done" as const,
    name: a.fileName,
    mimeType: a.contentType,
    fileSize: a.fileSize,
  }));
}

export default function MessageEditForm({ message, onSave, onCancel, isSaving }: MessageEditFormProps) {
  const [content, setContent] = useState(message.content);
  const [allAttachments, setAllAttachments] = useState<UploadedAttachment[]>(() => toUploadedAttachments(message));
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const originalAttachmentIds = useMemo(
    () => new Set((message.attachments || []).map((a) => a.id)),
    [message.attachments]
  );

  // Derived: which original attachments were removed
  const removedAttachmentIds = useMemo(
    () =>
      (message.attachments || [])
        .filter((a) => !allAttachments.some((ua) => ua.id === a.id))
        .map((a) => a.id),
    [message.attachments, allAttachments]
  );

  // Derived: which are newly added uploads (done status only)
  const addMediaIds = useMemo(
    () =>
      allAttachments
        .filter((a) => !originalAttachmentIds.has(a.id) && a.status === "done")
        .map((a) => a.id),
    [allAttachments, originalAttachmentIds]
  );

  // Auto-focus + auto-size on mount
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      textarea.selectionStart = textarea.value.length;
      textarea.style.height = "auto";
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, []);

  const doneAttachments = allAttachments.filter((a) => a.status === "done");
  const hasContent = content.trim().length > 0;
  const hasAttachments = doneAttachments.length > 0;

  const hasChanges =
    content.trim() !== message.content ||
    removedAttachmentIds.length > 0 ||
    addMediaIds.length > 0;

  const canSave = hasChanges && (hasContent || hasAttachments) && !isSaving;

  const handleSave = () => {
    if (!canSave) return;
    onSave(
      content.trim(),
      addMediaIds.length > 0 ? addMediaIds : undefined,
      removedAttachmentIds.length > 0 ? removedAttachmentIds : undefined
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
  };

  const handleFileSelect = async (files: File[]) => {
    for (const file of files) {
      const isImage = file.type.startsWith("image/");
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const preview = isImage ? URL.createObjectURL(file) : "";

      const newAtt: UploadedAttachment = {
        id: tempId,
        file,
        preview,
        type: isImage ? "image" : "document",
        status: "uploading",
        name: file.name,
      };

      setAllAttachments((prev) => [...prev, newAtt]);

      try {
        const { mediaId, uploadUrl } = await getMediaUploadUrl(file.type, file.name, file.size);
        await uploadFileToS3(uploadUrl, file, file.type);
        setAllAttachments((prev) =>
          prev.map((a) => (a.id === tempId ? { ...a, id: mediaId, status: "done" as const } : a))
        );
      } catch {
        setAllAttachments((prev) =>
          prev.map((a) => (a.id === tempId ? { ...a, status: "error" as const } : a))
        );
        toast.error("Failed to upload attachment");
      }
    }
  };

  return (
    <div className="w-full space-y-2" aria-live="polite">
      <textarea
        data-testid="edit-textarea"
        ref={textareaRef}
        value={content}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        className="w-full bg-surface border border-border rounded-lg p-2 text-sm text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-accent/50"
        rows={1}
        maxLength={4000}
        disabled={isSaving}
      />

      {/* All attachments (existing + new) in unified uploader strip */}
      {allAttachments.length > 0 && (
        <AttachmentsUploader
          attachments={allAttachments}
          onAttachmentsChange={setAllAttachments}
          onUpload={async (file) => {
            const { mediaId, uploadUrl } = await getMediaUploadUrl(file.type, file.name, file.size);
            await uploadFileToS3(uploadUrl, file, file.type);
            return mediaId;
          }}
          maxFiles={10}
          variant="horizontal"
          showEmptyDropzone={false}
        />
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => {
            handleFileSelect(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
        <button
          data-testid="edit-attach-button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
          title="Add attachment"
          disabled={isSaving}
        >
          <Paperclip size={14} />
        </button>

        <div className="flex-1" />

        <button
          data-testid="edit-cancel-button"
          onClick={onCancel}
          className="p-1.5 rounded hover:bg-muted/20 text-muted-foreground hover:text-foreground transition-colors"
          title="Cancel (Esc)"
          disabled={isSaving}
        >
          <X size={16} />
        </button>
        <button
          data-testid="edit-save-button"
          onClick={handleSave}
          disabled={!canSave}
          className="p-1.5 rounded hover:bg-accent/20 text-accent transition-colors disabled:opacity-50"
          title="Save (Ctrl+Enter)"
        >
          <Check size={16} />
        </button>
      </div>

      <div className="text-[10px] text-muted-foreground">
        Esc to cancel · Ctrl+Enter to save
      </div>
    </div>
  );
}
