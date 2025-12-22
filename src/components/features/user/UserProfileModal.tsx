"use client";

import { Button, Modal } from "@/components";
import { UserProfile } from "@/lib/models/User";
import { createChat } from "@/lib/api/messages";
import { stringToColor } from "@/lib/utils/color";
import { ExternalLink, Mail, MessageSquare } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserProfileModalProps {
	user: UserProfile;
	isOpen: boolean;
	onClose: () => void;
	onChatCreated?: (chatId: string) => void;
}

export default function UserProfileModal({ user, isOpen, onClose, onChatCreated }: UserProfileModalProps) {
	const router = useRouter();
	const [isCreatingChat, setIsCreatingChat] = useState(false);

	const handleCreateChat = async () => {
		setIsCreatingChat(true);
		try {
			const chat = await createChat([user]);
			onClose();
			if (onChatCreated) {
				onChatCreated(chat.id);
			} else {
				router.push(`/dashboard/messages/${chat.id}`);
			}
		} catch (error) {
			console.error("Failed to create chat", error);
		} finally {
			setIsCreatingChat(false);
		}
	};

	const handleViewProfile = () => {
		onClose();
		router.push(`/dashboard/profile/${user.userId}`);
	};

	const initials = (user.name || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
	const bgColor = stringToColor(user.email || "default");

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="User Profile" className="max-w-sm bg-[#141414] border border-white/10">
			<div className="flex flex-col gap-6">
				{/* Header / Cover */}
				<div className="relative">
					<div className="h-24 w-full bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl overflow-hidden opacity-80" />
					<div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
						<div 
							className="w-20 h-20 rounded-full border-4 border-[#141414] flex items-center justify-center overflow-hidden bg-[#141414]"
							style={{ backgroundColor: !user.imageUrl ? bgColor : undefined }}
						>
							{user.imageUrl ? (
								<Image src={user.imageUrl} alt={user.name} fill className="object-cover" />
							) : (
								<span className="text-2xl font-bold text-black/70">{initials}</span>
							)}
						</div>
					</div>
				</div>

				{/* User Info */}
				<div className="mt-8 text-center space-y-1">
					<h2 className="text-xl font-bold text-white">
						{user.name} {user.surname}
					</h2>
					<p className="text-sm text-muted">{user.email}</p>
				</div>

				{/* Stats Row (Placeholder based on design) */}
				{/* <div className="flex justify-center gap-8 py-2 border-y border-white/5">
					<div className="text-center">
						<div className="font-bold text-white">0</div>
						<div className="text-xs text-muted">Followers</div>
					</div>
					<div className="text-center">
						<div className="font-bold text-white">0</div>
						<div className="text-xs text-muted">Following</div>
					</div>
				</div> */}

				{/* Actions */}
				<div className="flex flex-col gap-2">
					<Button 
						onClick={handleCreateChat} 
						loading={isCreatingChat}
						fullWidth 
						leftIcon={<MessageSquare size={18} />}
						className="bg-accent text-white hover:bg-accent/90"
					>
						Direct Message
					</Button>
					<Button 
						onClick={handleViewProfile} 
						fullWidth 
						variant="ghost" 
						leftIcon={<ExternalLink size={18} />}
						className="text-white hover:bg-white/10"
					>
						View Full Profile
					</Button>
				</div>
			</div>
		</Modal>
	);
}
