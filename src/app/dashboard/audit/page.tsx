import { AuditEventsTable } from "@/components/features/audit";
import { loadEventsByAdmin } from "@/lib/requests/events";
import { getUserProfile } from "@/lib/server/auth";

const AuditPage = async () => {
  const userProfile = await getUserProfile();

  const events = await loadEventsByAdmin(userProfile?.userId!);

  return (
    <div>
      <AuditEventsTable events={events} />
    </div>
  );
};

export default AuditPage;
