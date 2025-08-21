import { AuditEventsList } from "@/components/features/audit";
import { loadEventsByAdmin } from "@/lib/requests/events";
import { getUserProfile } from "@/lib/server/auth";
import { redirect } from "next/navigation";

const AuditPage = async () => {
  const userProfile = await getUserProfile();

  if (!userProfile) {
    redirect("/login");
  }

  const events = await loadEventsByAdmin(userProfile?.userId!);

  return (
    <div className="">
      <AuditEventsList events={events} />
    </div>
  );
};

export default AuditPage;
