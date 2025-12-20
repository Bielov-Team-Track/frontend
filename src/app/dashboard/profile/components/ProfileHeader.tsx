import { Button } from "@/components/ui";
import Avatar from "@/components/ui/avatar";
import { UserProfile } from "@/lib/models/User";
import { Edit, MapPin } from "lucide-react";
import Link from "next/link";

interface ExtendedUser extends UserProfile {
	bio?: string;
	location?: string;
	website?: string;
	followersCount?: number;
	followingCount?: number;
	joinedAt?: string;
	isFollowing?: boolean;
}

interface ProfileHeaderProps {
	profile: ExtendedUser;
	onFollow?: () => void;
	isOwnProfile: boolean;
}

const ProfileHeader = ({ profile, onFollow, isOwnProfile }: ProfileHeaderProps) => {
	return (
		<div className="flex flex-col gap-6">
			{/* Cover Image Placeholder - could be real if backend supported it */}
			<div className="h-48 w-full bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl relative overflow-hidden">
				<div className="absolute inset-0 bg-black/20" />
			</div>

			<div className="px-6 relative">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 mb-4 gap-4">
					<div className="flex flex-col md:flex-row items-end md:items-end gap-6">
						<div className="relative p-1 bg-[#141414] rounded-full">
							<Avatar profile={profile} size="custom" className="w-32 h-32 border-4 border-[#141414]" />
						</div>
						<div className="flex flex-col mb-2">
							<h1 className="text-3xl font-bold text-white">
								{profile.name} {profile.surname}
							</h1>
							<span className="text-muted">@{profile?.email?.split("@")[0]}</span>
						</div>
					</div>

					<div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
						{isOwnProfile ? (
							<Link href="/dashboard/settings" className="w-full md:w-auto">
								<Button variant="bordered" leftIcon={<Edit size={16} />} className="w-full">
									Edit Profile
								</Button>
							</Link>
						) : (
							<Button variant={profile.isFollowing ? "bordered" : "default"} onClick={onFollow} className="w-full md:w-auto">
								{profile.isFollowing ? "Unfollow" : "Follow"}
							</Button>
						)}
					</div>
				</div>

				{/* Bio and Stats */}
				<div className="flex flex-col gap-4 max-w-3xl">
					{profile.bio && <p className="text-white/80 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>}

					<div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-muted">
						{profile.location && (
							<div className="flex items-center gap-2">
								<MapPin size={16} />
								<span>{profile.location}</span>
							</div>
						)}
						{/* {profile.website && (
                            <div className="flex items-center gap-2">
                                <LinkIcon size={16} />
                                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                    {profile.website.replace(/^https?:\/\//, '')}
                                </a>
                            </div>
                        )} */}
						{/* <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>Joined {new Date().getFullYear()}</span>
                        </div> */}
					</div>

					<div className="flex gap-6 mt-2">
						<div className="flex items-center gap-2">
							<span className="font-bold text-white">{profile.followersCount || 0}</span>
							<span className="text-muted">Followers</span>
						</div>
						<div className="flex items-center gap-2">
							<span className="font-bold text-white">{profile.followingCount || 0}</span>
							<span className="text-muted">Following</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ProfileHeader;
