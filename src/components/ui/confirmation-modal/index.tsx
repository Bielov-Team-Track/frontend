'use client'

import React from 'react'

const ConfirmationModal = React.forwardRef<HTMLDialogElement, ConfirmationModalParams>(
  ({ confirm, question, confirmText = "Yes", declineText = "No" }, ref) => {
    return (
      <dialog ref={ref} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-2xl text-center">Confirm</h3>
          <p className="pt-4 text-center">{question}</p>
          <div className="modal-action">
            <form method="dialog" className='w-full flex justify-around'>
              <button className="btn btn-success w-16 text-neutral-50" onClick={() => confirm()}>{confirmText}</button>
              <button className="btn btn-error w-16 text-neutral-50">{declineText}</button>
            </form>
          </div>
        </div>
      </dialog>
    )
  })

ConfirmationModal.displayName = "ConfirmationModal"

type ConfirmationModalParams = {
  confirm: Function
  question: string
  confirmText?: string | undefined
  declineText?: string | undefined
}

export default ConfirmationModal