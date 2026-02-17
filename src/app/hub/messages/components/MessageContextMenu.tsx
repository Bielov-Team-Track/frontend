"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Message } from "@/lib/models/Messages";
import { Copy, Forward, Pencil, Reply, SmilePlus, Trash2 } from "lucide-react";
import { type ReactNode } from "react";

type MessageContextMenuProps = {
  children: ReactNode;
  message: Message;
  isOwnMessage: boolean;
  onReply?: (message: Message) => void;
  onForward?: (message: Message) => void;
  onReact?: (message: Message) => void;
  onCopyText?: (message: Message) => void;
  onEdit?: (message: Message) => void;
  onDelete?: (message: Message) => void;
};

export default function MessageContextMenu({
  children,
  message,
  isOwnMessage,
  onReply,
  onForward,
  onReact,
  onCopyText,
  onEdit,
  onDelete,
}: MessageContextMenuProps) {
  if (message.isDeleted) {
    return <>{children}</>;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent data-testid="context-menu" className="w-48">
        {onReply && (
          <ContextMenuItem data-testid="context-menu-reply" onClick={() => onReply(message)}>
            <Reply size={16} className="mr-2" />
            Reply
          </ContextMenuItem>
        )}
        {onForward && (
          <ContextMenuItem data-testid="context-menu-forward" onClick={() => onForward(message)}>
            <Forward size={16} className="mr-2" />
            Forward
          </ContextMenuItem>
        )}
        {onReact && (
          <ContextMenuItem data-testid="context-menu-react" onClick={() => onReact(message)}>
            <SmilePlus size={16} className="mr-2" />
            React
          </ContextMenuItem>
        )}
        {onCopyText && (
          <ContextMenuItem data-testid="context-menu-copy" onClick={() => onCopyText(message)}>
            <Copy size={16} className="mr-2" />
            Copy Text
          </ContextMenuItem>
        )}
        {isOwnMessage && (onEdit || onDelete) && <ContextMenuSeparator />}
        {isOwnMessage && onEdit && (
          <ContextMenuItem data-testid="context-menu-edit" onClick={() => onEdit(message)}>
            <Pencil size={16} className="mr-2" />
            Edit
          </ContextMenuItem>
        )}
        {isOwnMessage && onDelete && (
          <ContextMenuItem
            data-testid="context-menu-delete"
            onClick={() => onDelete(message)}
            className="text-error focus:text-error"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
