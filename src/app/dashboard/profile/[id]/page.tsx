"use client";

import Loader from "@/components/ui/loader";
import { loadEventsByFilter } from "@/lib/api/events";
import { followUser, getFullUserProfile, unfollowUser } from "@/lib/api/user";
import { Event } from "@/lib/models/Event";
import { FullProfileDto } from "@/lib/models/Profile";
import { useAuth } from "@/providers";
import { Activity, Calendar, ClipboardList, History, LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import { use, useEffect, useState } from "react";
import CoachStats from "../components/CoachStats";
import PlayerStats from "../components/PlayerStats";
import ProfileEvents from "../components/ProfileEvents";
import ProfileHeader from "../components/ProfileHeader";
import ProfileHistory from "../components/ProfileHistory";
import ProfileOverview from "../components/ProfileOverview";

// Extended interface to match backend response structure
interface ExtendedProfile extends FullProfileDto {
	location?: string;
	website?: string;
	followersCount?: number;
	followingCount?: number;
	joinedAt?: string;
	isFollowing?: boolean;
}

function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const [profile, setProfile] = useState<ExtendedProfile>();
	const [organizedEvents, setOrganizedEvents] = useState<Event[]>([]);
	const [participatedEvents, setParticipatedEvents] = useState<Event[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("overview");
	const { userProfile } = useAuth();

	useEffect(() => {
		if (!id) return;

		const loadData = async () => {
			setIsLoading(true);
			try {
				// 1. Fetch Full Profile (includes player, coach, history)
				const profileData = await getFullUserProfile(id);
				if (!profileData) {
					redirect("/404");
				}
				setProfile(profileData as ExtendedProfile);

				// 2. Fetch Events (Organizer)
				const organized = await loadEventsByFilter({
					organizerId: id,
					sortBy: "startDate",
					sortOrder: "desc",
				});
				setOrganizedEvents(organized || []);

				// 3. Fetch Events (Participant)
				const participated = await loadEventsByFilter({
					participantId: id,
					sortBy: "startDate",
					sortOrder: "desc",
				});
				setParticipatedEvents(participated || []);
			} catch (error) {
				console.error("Failed to load profile data", error);
			} finally {
				setIsLoading(false);
			}
		};

		loadData();
	}, [id]);

	const handleFollowToggle = async () => {
		if (!profile || !userProfile) return;

		try {
			if (profile.isFollowing) {
				await unfollowUser(id);
				setProfile((prev) => (prev ? { ...prev, isFollowing: false, followersCount: (prev.followersCount || 1) - 1 } : undefined));
			} else {
				await followUser(id);
				setProfile((prev) => (prev ? { ...prev, isFollowing: true, followersCount: (prev.followersCount || 0) + 1 } : undefined));
			}
		} catch (error) {
			console.error("Follow toggle failed", error);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<Loader />
			</div>
		);
	}

	if (!profile) {
		return null; // Redirect handled in useEffect
	}

	const isOwnProfile = userProfile?.id === profile.userId;

	const tabs = [
		{ id: "overview", label: "Overview", icon: <LayoutDashboard size={18} /> },
		{ id: "player", label: "Player Profile", icon: <Activity size={18} /> },
		{ id: "coach", label: "Coach Profile", icon: <ClipboardList size={18} /> },
		{ id: "history", label: "History", icon: <History size={18} /> },
		{ id: "events", label: "Events", icon: <Calendar size={18} /> },
	];

	return (
		<div className="flex flex-col w-full max-w-7xl mx-auto pb-12">
			<ProfileHeader profile={profile} onFollow={handleFollowToggle} isOwnProfile={isOwnProfile} />

			{/* Tabs Navigation */}
			<div className="mt-12 px-6 border-b border-white/10 flex overflow-x-auto no-scrollbar gap-1">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`
                            flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap
                            ${
								activeTab === tab.id
									? "border-accent text-accent bg-accent/5"
									: "border-transparent text-muted hover:text-white hover:border-white/20 hover:bg-white/5"
							}
                        `}>
						{tab.icon}
						{tab.label}
					</button>
				))}
			</div>

			{/* Content Area */}
			<div className="px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
				{activeTab === "overview" && <ProfileOverview badges={profile.badges} stats={profile.stats} />}

				{activeTab === "player" && <PlayerStats playerProfile={profile.playerProfile} />}

				{activeTab === "coach" && <CoachStats coachProfile={profile.coachProfile} />}

				{activeTab === "history" && <ProfileHistory historyEntries={profile.historyEntries} />}

				{activeTab === "events" && (
					<div className="flex flex-col gap-12">
						<ProfileEvents title="Upcoming & Past Events (Organized)" events={organizedEvents} />
						<ProfileEvents title="Participated Events" events={participatedEvents} />
					</div>
				)}
			</div>
		</div>
	);
}

export default ProfilePage;
