import { UserPayment } from "@/lib/models/Payment";
import { getFormattedDate } from "@/lib/utils/date";
import Link from "next/link";
import React from "react";

type UserPaymentsListProps = {
  payments: UserPayment[];
};

function UserPaymentsList({ payments }: UserPaymentsListProps) {
  return (
    <div>
      {payments && payments.length > 0 ? (
        payments.map((payment, idx) => (
          <div
            key={idx}
            className="bg-primary text-primary-content rounded-md p-4 flex justify-between items-center"
          >
            <div className="flex gap-4 items-center">
              <div className="flex flex-col">
                <Link className="link" href={`/events/${payment.event.id}`}>
                  {payment.event.name}
                </Link>
                <span className="text-sm">
                  {getFormattedDate(payment.event.startTime)}
                </span>
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <span className="font-bold text-xl">£{payment.amount}</span>
            </div>
          </div>
        ))
      ) : (
        <span>No pending payments</span>
      )}
    </div>
  );
}

export default UserPaymentsList;
