"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { CheckCircle, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { WizardSuccessConfig } from "./types";

interface WizardSuccessScreenProps {
	config: WizardSuccessConfig;
	createdId: string;
	onClose: () => void;
}

export function WizardSuccessScreen({ config, createdId, onClose }: WizardSuccessScreenProps) {
	const href = config.getLinkHref(createdId);

	return (
		<div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-in fade-in zoom-in-95 duration-300">
			<div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
				<CheckCircle className="w-8 h-8 text-green-500" />
			</div>

			<h2 className="text-2xl font-bold text-foreground mb-2">{config.title}</h2>

			<p className="text-muted-foreground mb-8 max-w-md">{config.message}</p>

			<div className="flex gap-3">
				<Button variant="outline" onClick={onClose}>
					<X size={16} className="mr-2" />
					Close
				</Button>

				<Link href={href} className={buttonVariants({ variant: "default" })}>
					{config.linkText}
					<ExternalLink size={16} className="ml-2" />
				</Link>
			</div>
		</div>
	);
}
