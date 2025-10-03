import React from 'react'
import UserSettings from './components/UserSettings'
import { redirect } from 'next/navigation'
import { getUserProfile } from '@/lib/server/auth'

async function ProfileSettingsPage() {
  const user = await getUserProfile()

  if (!user) {
    redirect("/login")
  }

  return (
    <div>
      <UserSettings user={user}></UserSettings>
    </div>
  )
}

export default ProfileSettingsPage