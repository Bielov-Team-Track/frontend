"use client";

import { useState, useCallback } from "react";
import { getMediaUploadUrl, uploadFileToS3 } from "@/lib/api/messages";
import type { UploadedAttachment } from "@/components/ui/attachments-uploader";
import { generateThumbHash } from "@/lib/utils/thumbhash";

export function useAttachmentUpload() {
  const [attachments, setAttachments] = useState<UploadedAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = useCallback((files: File[]) => {
    if (files.length === 0) return;

    const newAttachments: UploadedAttachment[] = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
      type: file.type.startsWith("image/") ? ("image" as const) : ("document" as const),
      status: "uploading" as const,
      name: file.name,
      mimeType: file.type,
      fileSize: file.size,
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    setIsUploading(true);
    setUploadError(null);

    // Use object ref so async callbacks share the same mutable counter
    // (a plain `let` would be captured by value in each closure)
    const pendingRef = { value: newAttachments.length };

    newAttachments.forEach(async (att) => {
      try {
        const fileType = att.file!.type || "application/octet-stream";
        let thumbHash: string | undefined;
        if (fileType.startsWith("image/")) {
          try { thumbHash = await generateThumbHash(att.file!); } catch { /* non-critical */ }
        }
        const { mediaId, uploadUrl } = await getMediaUploadUrl(fileType, att.file!.name, att.file!.size, thumbHash);
        await uploadFileToS3(uploadUrl, att.file!, fileType);
        setAttachments((prev) =>
          prev.map((a) => (a.id === att.id ? { ...a, id: mediaId, status: "done" as const } : a))
        );
      } catch {
        setAttachments((prev) =>
          prev.map((a) => (a.id === att.id ? { ...a, status: "error" as const } : a))
        );
        setUploadError("Failed to upload file");
      } finally {
        pendingRef.value--;
        if (pendingRef.value === 0) setIsUploading(false);
      }
    });
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => {
      const att = prev.find((a) => a.id === id);
      if (att?.preview) URL.revokeObjectURL(att.preview);
      return prev.filter((a) => a.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setAttachments((prev) => {
      prev.forEach((a) => {
        if (a.preview) URL.revokeObjectURL(a.preview);
      });
      return [];
    });
    setIsUploading(false);
    setUploadError(null);
  }, []);

  const mediaIds = attachments.filter((a) => a.status === "done").map((a) => a.id);

  return {
    attachments,
    setAttachments,
    isUploading,
    uploadError,
    handleFileSelect,
    removeAttachment,
    clearAll,
    mediaIds,
  };
}
