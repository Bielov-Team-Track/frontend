import { cache } from "react";
import { UserProfile } from "@/lib/models/User";
import { EVENTS_API_V1 } from "@/lib/constants";
import { Avatar, Button, EventsList } from "@/components";
import { loadEventsByAdmin } from "@/lib/requests/events";
import { FaBell, FaEnvelope } from "react-icons/fa";

// Cached function to fetch user profile - will only make one request per user ID
const getCachedUserProfile = cache(
  async (userId: string): Promise<UserProfile | null> => {
    try {
      const response = await fetch(`${EVENTS_API_V1}/profiles/${userId}`, {
        cache: "force-cache",
      });

      if (response.ok) {
        return await response.json();
      }

      if (response.status === 404) {
        return null;
      }

      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }
);

const ProfilePage = async ({ params }: { params: { id: string } }) => {
  const userProfile = await getCachedUserProfile(params.id);

  const events = await loadEventsByAdmin(params.id);

  if (!userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold">User not found</h1>
        <p>The profile you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="container flex mx-auto px-4 py-8 bg-base-200">
      <div className=" p-6 flex flex-col gap-2 max-w-max">
        <Avatar profile={userProfile} size="large" />
        <h1 className="text-3xl font-bold mb-4">
          {userProfile.name} {userProfile.surname}
        </h1>
        <Button leftIcon={<FaEnvelope></FaEnvelope>}>Message</Button>
        <Button leftIcon={<FaBell></FaBell>}>Subscribe</Button>
      </div>
      <div className="flex-1 p-6 flex-justify-start flex-col">
        <EventsList events={events} />
      </div>
    </div>
  );
};

export default ProfilePage;

export const generateMetadata = async ({
  params,
}: {
  params: { id: string };
}) => {
  const userProfile = await getCachedUserProfile(params.id);

  if (userProfile) {
    return {
      title: `${userProfile.name} ${userProfile.surname} - Profile`,
      description: `Profile page for ${userProfile.name} ${userProfile.surname}`,
    };
  }

  return {
    title: "Profile Not Found",
    description: "User profile not found",
  };
};
