import { getUserProfile } from "@/lib/server/auth";
import UserPaymentsList from "@/components/features/payments/components/UserPaymentsList";
import { getUserPayments } from "@/lib/requests/payments";
import React from "react";

async function PaymentsPage() {
  const user = await getUserProfile();
  const payments = await getUserPayments(user?.id!);

  return (
    <div>
      <div className="flex flex-col gap-2">
        <h2>Owed By You</h2>
        <UserPaymentsList payments={payments} />
      </div>
    </div>
  );
}

export default PaymentsPage;
