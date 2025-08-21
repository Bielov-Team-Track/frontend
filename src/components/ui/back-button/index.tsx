'use client'

import { useRouter } from 'next/navigation'
import React from 'react'
import { FiArrowLeft as BackIcon } from "react-icons/fi"

function BackButton() {
  const router = useRouter();

  return (
    <button className='absolute left-4 top-4' onClick={router.back}><BackIcon size={"1.5rem"} /></button>
  )
}

export default BackButton