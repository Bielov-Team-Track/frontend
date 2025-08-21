import React, { PropsWithChildren } from 'react'
import { Header } from '@/components/layout'
import Link from 'next/link'

function Drawer({ children }: PropsWithChildren) {
  return (
    <div className="drawer">
      <input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        {children}
      </div>
      <div className="drawer-side z-50">
        <label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 min-h-full bg-base-200 flex flex-col gap-2">
          <Link href={"/events"}>Events</Link>
          <Link href={"/my-payments"}>My payments</Link>
          <Link href={"/events-payments"}>My events payments</Link>
          <span>ADMIN</span>
          <Link href={"/admin/events"}>Admin/Events</Link>
          <Link href={"/admin/locations"}>Admin/Locations</Link>
          <Link href={"/admin/positions"}>Admin/Positions</Link>
        </ul>
      </div>
    </div>
  )
}

export default Drawer