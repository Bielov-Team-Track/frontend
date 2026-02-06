import { redirect } from "next/navigation";

export default function NewPlanRedirect() {
	redirect("/dashboard/coaching/training/plans/wizard");
}
