import UserMenu from "../dashboard-header/UserMenu";
import { getCurrentUserProfile } from "@/lib/requests/auth";

const Header = async () => {
  const userProfile = await getCurrentUserProfile();

  return (
    <header className="bg-stone-800 h-16 p-4 shadow-md">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-accent">Team Track</h1>
        <UserMenu user={userProfile} />
      </div>
    </header>
  );
};

export default Header;
