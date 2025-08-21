import { getUserProfile } from '@/lib/server/auth';
import { loadGroupsByAdmin } from '@/lib/requests/club';
import React from 'react'

async function GroupsPage() {
  const user = await getUserProfile();

  const groups = await loadGroupsByAdmin(user?.id!);

  return (
    <div>
      <div>
        {groups && groups.length > 0 && groups.map(group => <div key={group.id}>{group.name}</div>)}
      </div>
    </div>
  )
}

export default GroupsPage