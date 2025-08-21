import React from 'react'
import { notFound } from 'next/navigation'

export default async function GroupPage({ params }: { params: { id: string } }) {
  if (!params?.id) {
    notFound()
  }

  return (
    <div>
      <h1>Group {params.id}</h1>
      {/* TODO: implement group details page */}
    </div>
  )
}

