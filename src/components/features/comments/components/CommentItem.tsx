"use client";

import { Avatar, Button } from "@/components/ui";
import { Comment } from "@/lib/models/Comment";
import { getFormattedDate } from "@/lib/utils/date";
import { useState } from "react";
import {
	FaTrash as DeleteIcon,
	FaEdit as EditIcon,
	FaReply,
	FaSmileWink,
	FaEllipsisV,
} from "react-icons/fa";

type CommentItemProps = {
	comment: Comment;
	isAuthor?: boolean;
};

const CommentItem = ({ comment, isAuthor = false }: CommentItemProps) => {
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

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

	return (
		comment &&
		comment.user && (
			<div>
				<div className="bg-background-light p-4 rounded-lg">
					<div className="flex justify-between items-center mb-1">
						<div className="flex items-center gap-4">
							<Avatar profile={comment.user} />
							<div className="flex flex-col items-start">
								<span>
									{comment.user.name} {comment.user.surname}
								</span>
								<div className="text-sm text-muted">
									{getFormattedDate(comment.createdAt)}
								</div>
							</div>
						</div>
						{isAuthor && (
							<div className="dropdown dropdown-end">
								<label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
									<FaEllipsisV />
								</label>
								<ul
									tabIndex={0}
									className="dropdown-content z-[1] menu p-2 shadow bg-base-200 rounded-box w-52"
								>
									{!showDeleteConfirm ? (
										<>
											<li>
												<button onClick={handleEdit}>
													<EditIcon /> Edit
												</button>
											</li>
											<li>
												<button
													className="text-error"
													onClick={(e) => {
														e.preventDefault();
														e.stopPropagation();
														setShowDeleteConfirm(true);
														// Keep dropdown open by refocusing
														const dropdown =
															e.currentTarget.closest(".dropdown");
														const trigger = dropdown?.querySelector(
															'[tabindex="0"]',
														) as HTMLElement;
														if (trigger) {
															setTimeout(() => trigger.focus(), 0);
														}
													}}
												>
													<DeleteIcon /> Delete
												</button>
											</li>
										</>
									) : (
										<>
											<li className="menu-title">
												<span className="text-error text-sm">
													Delete comment?
												</span>
											</li>
											<li>
												<button
													className="text-error"
													onClick={handleDelete}
													disabled={isDeleting}
												>
													{isDeleting ? "Deleting..." : "Yes, delete"}
												</button>
											</li>
											<li>
												<button onClick={() => setShowDeleteConfirm(false)}>
													Cancel
												</button>
											</li>
										</>
									)}
								</ul>
							</div>
						)}
					</div>
					<div>
						<span className="text-xs text-muted">
							{comment.updatedAt && comment.updatedAt !== comment.createdAt
								? " (edited)"
								: ""}
						</span>

						<p>{comment.content}</p>
					</div>
				</div>
				<div>
					<Button
						color="neutral"
						leftIcon={<FaSmileWink />}
						size="sm"
						variant="icon"
					></Button>
					<Button
						color="neutral"
						variant="ghost"
						size="sm"
						leftIcon={<FaReply />}
					>
						reply
					</Button>
				</div>
			</div>
		)
	);
};

export default CommentItem;
