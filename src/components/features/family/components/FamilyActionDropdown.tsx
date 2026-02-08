"use client";

import { Button } from "@/components/ui";
import { useFamilyStore } from "@/lib/realtime/familyStore";
import { ChevronDown, User, Baby } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function FamilyActionDropdown() {
	const { members, actingAsUserId, actingAsName, setActingAs, clearActingAs, isGuardian } = useFamilyStore();
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	if (!isGuardian || members.length <= 1) return null;

	const minors = members.filter(m => m.role === "Minor");

	return (
		<div className="relative" ref={ref}>
			<Button
				variant="outline"
				size="sm"
				onClick={() => setOpen(!open)}
				rightIcon={<ChevronDown size={14} />}
				leftIcon={actingAsUserId ? <Baby size={14} /> : <User size={14} />}
			>
				{actingAsUserId ? actingAsName ?? "Minor" : "Myself"}
			</Button>

			{open && (
				<div className="absolute top-full mt-1 right-0 w-48 rounded-lg bg-surface-elevated border border-border shadow-lg z-50 py-1">
					<button
						onClick={() => { clearActingAs(); setOpen(false); }}
						className="w-full text-left px-3 py-2 text-sm hover:bg-surface flex items-center gap-2"
					>
						<User size={14} /> Myself
						{!actingAsUserId && <span className="ml-auto text-primary">✓</span>}
					</button>
					{minors.map(minor => (
						<button
							key={minor.userId}
							onClick={() => { setActingAs(minor.userId, minor.name ?? null); setOpen(false); }}
							className="w-full text-left px-3 py-2 text-sm hover:bg-surface flex items-center gap-2"
						>
							<Baby size={14} /> {minor.name ?? "Minor"}
							{actingAsUserId === minor.userId && <span className="ml-auto text-primary">✓</span>}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
