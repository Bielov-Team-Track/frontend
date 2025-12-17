"use client";

import { Avatar } from "@/components/ui";
import { Comment } from "@/lib/models/Comment";
import { getFormattedDate } from "@/lib/utils/date";
import { useState } from "react";
import {
	MoreHorizontal,
	Edit2,
	Trash2,
	CornerDownRight,
	Heart,
    MessageSquare
} from "lucide-react";

type CommentItemProps = {
	comment: Comment;
	isAuthor?: boolean;
};

const CommentItem = ({ comment, isAuthor = false }: CommentItemProps) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(Math.floor(Math.random() * 5)); // Mock likes for UI demo

	const handleEdit = () => {
		// Implement edit functionality here
		closeDropdown();
	};

	const handleDelete = async () => {
		try {
			setIsDeleting(true);
			// Implement delete functionality here
			closeDropdown();
			// Reset state after dropdown is closed
			setTimeout(() => {
				setShowDeleteConfirm(false);
				setIsDeleting(false);
			}, 300);
		} catch (error) {
			console.error("Failed to delete comment:", error);
			setIsDeleting(false);
		}
	};

	const closeDropdown = () => {
		// Remove focus from dropdown to close it
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	};

    const toggleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    };

	if (!comment || !comment.user) return null;

	return (
		<div className="flex gap-4 group">
            {/* Avatar Column */}
            <div className="flex-shrink-0">
			    <Avatar profile={comment.user} className="w-10 h-10 border-2 border-transparent group-hover:border-white/10 transition-colors" />
            </div>

            {/* Content Column */}
			<div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white hover:text-accent cursor-pointer transition-colors">
                            {comment.user.name} {comment.user.surname}
                        </span>
                        <span className="text-[10px] text-muted flex items-center gap-1">
                            • {getFormattedDate(comment.createdAt)}
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                                <span className="italic">(edited)</span>
                            )}
                        </span>
                    </div>

                    {isAuthor && (
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-xs btn-circle text-muted hover:text-white">
                                <MoreHorizontal size={16} />
                            </label>
                            <ul
                                tabIndex={0}
                                className="dropdown-content z-[1] menu p-2 shadow-lg bg-[#1E1E1E] border border-white/10 rounded-xl w-48 mt-1"
                            >
                                {!showDeleteConfirm ? (
                                    <>
                                        <li>
                                            <button onClick={handleEdit} className="text-xs hover:bg-white/5 hover:text-white text-gray-300">
                                                <Edit2 size={14} /> Edit
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className="text-xs hover:bg-red-500/10 hover:text-error text-error"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setShowDeleteConfirm(true);
                                                    const dropdown = e.currentTarget.closest(".dropdown");
                                                    const trigger = dropdown?.querySelector('[tabindex="0"]') as HTMLElement;
                                                    if (trigger) {
                                                        setTimeout(() => trigger.focus(), 0);
                                                    }
                                                }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </li>
                                    </>
                                ) : (
                                    <>
                                        <li className="menu-title px-4 py-2">
                                            <span className="text-error text-xs font-bold">
                                                Delete comment?
                                            </span>
                                        </li>
                                        <li>
                                            <button
                                                className="text-xs bg-red-500/10 text-error hover:bg-red-500/20"
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? "Deleting..." : "Yes, delete"}
                                            </button>
                                        </li>
                                        <li>
                                            <button onClick={() => setShowDeleteConfirm(false)} className="text-xs text-gray-400 hover:text-white">
                                                Cancel
                                            </button>
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="text-sm text-gray-200 leading-relaxed break-words bg-white/5 p-3 rounded-tr-xl rounded-br-xl rounded-bl-xl border border-white/5">
                    {comment.content}
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <button 
                        onClick={toggleLike}
                        className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${isLiked ? "text-error" : "text-muted hover:text-error"}`}
                    >
                        <Heart size={14} className={isLiked ? "fill-current" : ""} /> 
                        {likesCount > 0 && <span>{likesCount}</span>}
                        <span className="hidden sm:inline">Like</span>
                    </button>
                    
                    <button className="flex items-center gap-1.5 text-xs font-medium text-muted hover:text-white transition-colors">
                        <MessageSquare size={14} /> Reply
                    </button>
                </div>
			</div>
		</div>
	);
};

export default CommentItem;