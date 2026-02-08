import { redirect } from "next/navigation";

export default function NewPlanRedirect() {
	redirect("/hub/coaching/training/plans/wizard");
}
