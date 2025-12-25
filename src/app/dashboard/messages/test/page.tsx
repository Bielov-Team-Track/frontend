"use client";

import {
	Bell,
	Check,
	CheckCheck,
	ChevronRight,
	Image as ImageIcon,
	Info,
	LogOut,
	Paperclip,
	Phone,
	Search,
	Send,
	Smile,
	Users,
	Video,
	X,
} from "lucide-react";
import { useState } from "react";

// --- MOCK DATA ---

const USERS = {
	me: { id: "me", name: "You", avatar: "/api/placeholder/50/50" },
	user1: {
		id: "u1",
		name: "Denys Bielov",
		avatar: "https://picsum.photos/50/51",
		status: "online",
	},
	user2: {
		id: "u2",
		name: "Sarah Jenks",
		avatar: "https://picsum.photos/50/51",
		status: "offline",
	},
	user3: {
		id: "u3",
		name: "Mike Spiker",
		avatar: "https://picsum.photos/50/51",
		status: "online",
	},
};

const CHATS = [
	{
		id: 1,
		type: "group",
		name: "Tournament Planning 🏐",
		lastMessage: "Mike: Did we book the venue?",
		time: "10:42 AM",
		unread: 3,
		avatar: [USERS.user1.avatar, USERS.user2.avatar], // Multi-avatar
		participants: [USERS.me, USERS.user1, USERS.user2, USERS.user3],
	},
	{
		id: 2,
		type: "direct",
		user: USERS.user1,
		name: "Denys Bielov",
		lastMessage: "See you at practice tonight!",
		time: "Yesterday",
		unread: 0,
		participants: [USERS.me, USERS.user1],
	},
	{
		id: 3,
		type: "direct",
		user: USERS.user2,
		name: "Sarah Jenks",
		lastMessage: "Sent an image",
		time: "Mon",
		unread: 0,
		participants: [USERS.me, USERS.user2],
	},
];

const MESSAGES = [
	{
		id: 1,
		senderId: "u1",
		text: "Hey everyone, regarding the weekend tournament.",
		time: "10:30 AM",
	},
	{
		id: 2,
		senderId: "u1",
		text: "We need to finalize the roster by tonight.",
		time: "10:30 AM",
	},
	{
		id: 3,
		senderId: "me",
		text: "I am in! Just paid the fee.",
		time: "10:35 AM",
		status: "read",
	},
	{ id: 4, senderId: "u3", text: "Did we book the venue?", time: "10:42 AM" },
];

export default function MessagesPage() {
	const [selectedChatId, setSelectedChatId] = useState<number>(1);
	const [showInfoPanel, setShowInfoPanel] = useState(false);
	const [messageInput, setMessageInput] = useState("");
	const [activeTab, setActiveTab] = useState<"all" | "groups" | "direct">(
		"all"
	);

	const activeChat = CHATS.find((c) => c.id === selectedChatId) || CHATS[0];

	return (
		<div className="h-[calc(100vh-80px)] bg-base-100 text-gray-100 font-sans flex overflow-hidden">
			{/* --- LEFT SIDEBAR: CHAT LIST --- */}
			<div className="w-80 md:w-96 flex flex-col border-r border-white/5 bg-[#161616]">
				{/* Header & Search */}
				<div className="p-5 pb-2">
					<h1 className="text-2xl font-bold text-white mb-4">
						Messages
					</h1>
					<div className="relative">
						<Search
							className="absolute left-3 top-2.5 text-gray-500"
							size={18}
						/>
						<input
							type="text"
							placeholder="Search chats..."
							className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-hidden focus:border-white/20 focus:bg-white/10 transition-all"
						/>
					</div>
				</div>

				{/* Tabs */}
				<div className="px-5 mt-2 flex gap-4 text-sm border-b border-white/5">
					{["all", "direct", "groups"].map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab as any)}
							className={`pb-3 capitalize font-medium transition-colors relative ${
								activeTab === tab
									? "text-accent"
									: "text-gray-500 hover:text-white"
							}`}>
							{tab}
							{activeTab === tab && (
								<div className="absolute bottom-0 left-0 w-full h-0.5 bg-accent rounded-t-full" />
							)}
						</button>
					))}
				</div>

				{/* Chat List */}
				<div className="flex-1 overflow-y-auto no-scrollbar py-2">
					{CHATS.filter(
						(c) =>
							activeTab === "all" ||
							c.type + "s" === activeTab ||
							c.type === activeTab
					).map((chat) => (
						<div
							key={chat.id}
							onClick={() => setSelectedChatId(chat.id)}
							className={`
                px-5 py-4 cursor-pointer transition-all border-l-2 hover:bg-white/5
                ${
					selectedChatId === chat.id
						? "bg-white/3 border-accent"
						: "border-transparent"
				}
              `}>
							<div className="flex gap-3">
								{/* Avatar Logic */}
								<div className="relative">
									{chat.type === "group" ? (
										<div className="w-12 h-12 relative">
											<img
												src={chat.avatar[0]}
												className="w-8 h-8 rounded-full absolute top-0 right-0 border-2 border-[#161616]"
												alt=""
											/>
											<img
												src={chat.avatar[1]}
												className="w-8 h-8 rounded-full absolute bottom-0 left-0 border-2 border-[#161616] z-10"
												alt=""
											/>
										</div>
									) : (
										<div className="w-12 h-12 relative">
											<img
												src={chat.user?.avatar}
												className="w-full h-full rounded-full object-cover"
												alt=""
											/>
											{chat.user?.status === "online" && (
												<div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-[#161616]"></div>
											)}
										</div>
									)}
								</div>

								<div className="flex-1 min-w-0">
									<div className="flex justify-between items-baseline mb-1">
										<h4
											className={`text-sm font-bold truncate ${
												selectedChatId === chat.id
													? "text-white"
													: "text-gray-200"
											}`}>
											{chat.name}
										</h4>
										<span className="text-[10px] text-gray-500">
											{chat.time}
										</span>
									</div>
									<div className="flex justify-between items-center">
										<p
											className={`text-xs truncate pr-2 ${
												chat.unread > 0
													? "text-gray-300 font-medium"
													: "text-gray-500"
											}`}>
											{chat.lastMessage}
										</p>
										{chat.unread > 0 && (
											<span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-accent text-white text-[10px] font-bold px-1">
												{chat.unread}
											</span>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* --- MAIN CHAT AREA --- */}
			<div className="flex-1 flex flex-col bg-[#1E1E1E] relative">
				{/* Chat Header */}
				<header className="h-20 px-6 flex items-center justify-between border-b border-white/5 bg-[#1E1E1E]/95 backdrop-blur-sm z-10">
					<div
						className="flex items-center gap-4 cursor-pointer"
						onClick={() => setShowInfoPanel(true)}>
						<div className="w-10 h-10 flex items-center justify-center rounded-full bg-linear-to-br from-gray-700 to-gray-800 text-white font-bold text-sm">
							{activeChat.type === "group" ? (
								<Users size={18} />
							) : (
								activeChat.name.charAt(0)
							)}
						</div>
						<div>
							<h2 className="text-lg font-bold text-white flex items-center gap-2">
								{activeChat.name}
								<ChevronRight
									size={14}
									className="text-gray-600"
								/>
							</h2>
							<p className="text-xs text-gray-400">
								{activeChat.type === "group"
									? `${activeChat.participants.length} participants`
									: "Active now"}
							</p>
						</div>
					</div>

					<div className="flex items-center gap-4 text-gray-400">
						<button className="p-2 hover:bg-white/5 rounded-full hover:text-white transition-colors">
							<Phone size={20} />
						</button>
						<button className="p-2 hover:bg-white/5 rounded-full hover:text-white transition-colors">
							<Video size={20} />
						</button>
						<div className="h-6 w-px bg-white/10 mx-1"></div>
						<button
							onClick={() => setShowInfoPanel(!showInfoPanel)}
							className={`p-2 rounded-full transition-colors ${
								showInfoPanel
									? "bg-accent text-white"
									: "hover:bg-white/5 hover:text-white"
							}`}>
							<Info size={20} />
						</button>
					</div>
				</header>

				{/* Messages Body */}
				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Date Separator */}
					<div className="flex justify-center">
						<span className="px-3 py-1 rounded-full bg-white/5 text-[10px] text-gray-500 font-medium uppercase tracking-wide">
							Today
						</span>
					</div>

					{MESSAGES.map((msg) => {
						const isMe = msg.senderId === "me";
						const sender =
							USERS[msg.senderId as keyof typeof USERS] ||
							USERS.user1; // fallback

						return (
							<div
								key={msg.id}
								className={`flex gap-3 ${
									isMe ? "flex-row-reverse" : ""
								}`}>
								{!isMe && (
									<img
										src={sender.avatar}
										className="w-8 h-8 rounded-full self-end mb-1"
										alt=""
									/>
								)}

								<div
									className={`max-w-[60%] ${
										isMe ? "items-end" : "items-start"
									} flex flex-col`}>
									{!isMe && activeChat.type === "group" && (
										<span className="text-xs text-gray-400 mb-1 ml-1">
											{sender.name}
										</span>
									)}

									<div
										className={`
                     px-4 py-3 text-sm leading-relaxed shadow-xs
                     ${
							isMe
								? "bg-accent text-white rounded-2xl rounded-tr-sm"
								: "bg-[#2A2A2A] text-gray-100 rounded-2xl rounded-tl-sm border border-white/5"
						}
                   `}>
										{msg.text}
									</div>

									<div
										className={`flex items-center gap-1 mt-1 text-[10px] text-gray-500 ${
											isMe ? "mr-1" : "ml-1"
										}`}>
										<span>{msg.time}</span>
										{isMe &&
											(msg.status === "read" ? (
												<CheckCheck
													size={12}
													className="text-accent"
												/>
											) : (
												<Check size={12} />
											))}
									</div>
								</div>
							</div>
						);
					})}
				</div>

				{/* Message Input */}
				<div className="p-4 bg-[#1E1E1E]">
					<div className="max-w-4xl mx-auto bg-[#161616] border border-white/10 rounded-2xl p-2 flex items-end gap-2 shadow-lg">
						<button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
							<Paperclip size={20} />
						</button>
						<textarea
							value={messageInput}
							onChange={(e) => setMessageInput(e.target.value)}
							placeholder="Type a message..."
							className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none outline-hidden py-2 max-h-32"
							rows={1}
						/>
						<div className="flex items-center gap-1">
							<button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
								<ImageIcon size={20} />
							</button>
							<button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors">
								<Smile size={20} />
							</button>
							<button
								className={`
                 ml-2 p-2 rounded-xl transition-all duration-300
                 ${
						messageInput.trim()
							? "bg-accent text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]"
							: "bg-white/10 text-gray-500 cursor-not-allowed"
					}
               `}>
								<Send
									size={18}
									className={
										messageInput.trim() ? "ml-0.5" : ""
									}
								/>
							</button>
						</div>
					</div>
				</div>

				{/* --- RIGHT INFO PANEL (Overlay) --- */}
				<div
					className={`
            absolute top-0 right-0 w-80 h-full bg-[#1A1A1A] border-l border-white/10 transform transition-transform duration-300 z-20 flex flex-col shadow-2xl
            ${showInfoPanel ? "translate-x-0" : "translate-x-full"}
        `}>
					{/* Panel Header */}
					<div className="h-16 px-6 flex items-center justify-between border-b border-white/5">
						<span className="font-bold text-white">Details</span>
						<button
							onClick={() => setShowInfoPanel(false)}
							className="text-gray-400 hover:text-white">
							<X size={20} />
						</button>
					</div>

					<div className="flex-1 overflow-y-auto p-6">
						{/* Chat Info */}
						<div className="flex flex-col items-center text-center mb-8">
							<div className="w-24 h-24 rounded-3xl bg-gray-800 mb-4 overflow-hidden border-4 border-[#1E1E1E] shadow-lg">
								{activeChat.type === "group" ? (
									<div className="w-full h-full grid grid-cols-2">
										<img
											src={activeChat.avatar[0]}
											className="w-full h-full object-cover"
										/>
										<img
											src={activeChat.avatar[1]}
											className="w-full h-full object-cover"
										/>
										<img
											src={USERS.user3.avatar}
											className="w-full h-full object-cover"
										/>
										<div className="bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">
											+1
										</div>
									</div>
								) : (
									<img
										src={activeChat.user?.avatar}
										className="w-full h-full object-cover"
									/>
								)}
							</div>
							<h3 className="text-xl font-bold text-white mb-1">
								{activeChat.name}
							</h3>
							<p className="text-sm text-gray-400">
								{activeChat.type === "group"
									? "Group Chat"
									: "Volleyball Player"}
							</p>
						</div>

						{/* Actions */}
						<div className="flex gap-4 justify-center mb-8 border-b border-white/5 pb-8">
							<ActionBtn icon={Bell} label="Mute" />
							<ActionBtn icon={Search} label="Search" />
							<ActionBtn icon={LogOut} label="Leave" danger />
						</div>

						{/* Participants List */}
						<div>
							<div className="flex justify-between items-center mb-4">
								<h4 className="text-sm font-bold text-white">
									Participants (
									{activeChat.participants.length})
								</h4>
								<span className="text-accent text-xs cursor-pointer hover:underline">
									Add +
								</span>
							</div>
							<div className="space-y-3">
								{activeChat.participants.map((u) => (
									<div
										key={u.id}
										className="flex items-center justify-between group cursor-pointer">
										<div className="flex items-center gap-3">
											<img
												src={u.avatar}
												className="w-8 h-8 rounded-full bg-gray-700"
												alt=""
											/>
											<span className="text-sm text-gray-300 group-hover:text-white">
												{u.name}
											</span>
										</div>
										{u.id === "u1" && (
											<span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded border border-primary/20">
												Admin
											</span>
										)}
									</div>
								))}
							</div>
						</div>

						{/* Media Section (Placeholder) */}
						<div className="mt-8 pt-8 border-t border-white/5">
							<h4 className="text-sm font-bold text-white mb-4">
								Shared Media
							</h4>
							<div className="grid grid-cols-3 gap-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="aspect-square bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer"></div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// Helper for buttons in the info panel
function ActionBtn({ icon: Icon, label, danger }: any) {
	return (
		<button className="flex flex-col items-center gap-2 group">
			<div
				className={`
                w-10 h-10 rounded-full flex items-center justify-center border transition-all
                ${
					danger
						? "border-error/30 text-error group-hover:bg-error/10"
						: "border-white/10 text-gray-400 group-hover:bg-white/5 group-hover:text-white"
				}
            `}>
				<Icon size={18} />
			</div>
			<span
				className={`text-xs ${
					danger ? "text-error" : "text-gray-500"
				}`}>
				{label}
			</span>
		</button>
	);
}
