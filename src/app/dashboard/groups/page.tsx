import { getUserProfile } from '@/lib/server/auth';
import { loadGroupsByUser } from '@/lib/requests/groups';
import { redirect } from 'next/navigation';
import React from 'react'

async function GroupsPage() {
  const user = await getUserProfile();

  if (!user) {
    redirect('/login');
  }

  const groups = await loadGroupsByUser(user.id!);

  return (

    (!groups || groups.length == 0) &&
    <div className='text-center flex flex-col gap-6'>
      <h2>You don&apos;t have any groups at the moment</h2>
      <div>
        <a href="/groups/search" className='btn btn-primary'>Join group</a>
        <div className="divider">OR</div>
        <a href='/groups/create' className='link'>Create a group</a>
      </div>
    </div>

  )
}

export default GroupsPage