// frontend/src/components/features/clubs/settings/FormCard.tsx
"use client";

import { FormTemplate } from "@/lib/models/Club";
import { format } from "date-fns";
import { Copy, MoreVertical, Star, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useState } from "react";

interface FormCardProps {
	form: FormTemplate;
	clubId: string;
	onEdit: () => void;
	onDuplicate: (formId: string) => void;
	onSetDefault: (formId: string) => void;
	onToggleActive: (formId: string, isActive: boolean) => void;
	onDelete: (formId: string) => void;
}

export default function FormCard({ form, clubId, onEdit, onDuplicate, onSetDefault, onToggleActive, onDelete }: FormCardProps) {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<div className="p-4 rounded-xl bg-surface border border-border hover:bg-hover transition-colors">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<h3 className="font-medium text-white truncate">{form.name}</h3>
						{form.isDefault && (
							<span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-medium flex items-center gap-1">
								<Star size={10} /> DEFAULT
							</span>
						)}
					</div>
					<p className="text-sm text-muted">
						{form.fields.length} fields · Created {format(new Date(form.createdAt), "MMM d, yyyy")}
					</p>
					<div className="flex items-center gap-2 mt-2">
						<span className={`inline-flex items-center gap-1 text-xs ${form.isActive ? "text-green-400" : "text-muted"}`}>
							<span className={`w-2 h-2 rounded-full ${form.isActive ? "bg-green-400" : "bg-muted"}`} />
							{form.isActive ? "Active" : "Inactive"}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button onClick={onEdit} className="px-3 py-1.5 rounded-lg bg-surface hover:bg-hover text-sm text-white transition-colors">
						Edit
					</button>
					<div className="relative">
						<button
							onClick={() => setMenuOpen(!menuOpen)}
							className="p-2 rounded-lg hover:bg-hover text-muted hover:text-white transition-colors">
							<MoreVertical size={16} />
						</button>
						{menuOpen && (
							<>
								<div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
								<div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl bg-surface-elevated border border-border shadow-xl py-1">
									<button
										onClick={() => {
											onDuplicate(form.id);
											setMenuOpen(false);
										}}
										className="w-full px-4 py-2 text-left text-sm text-white hover:bg-hover flex items-center gap-2">
										<Copy size={14} />
										Duplicate
									</button>
									{!form.isDefault && (
										<button
											onClick={() => {
												onSetDefault(form.id);
												setMenuOpen(false);
											}}
											className="w-full px-4 py-2 text-left text-sm text-white hover:bg-hover flex items-center gap-2">
											<Star size={14} />
											Set as Default
										</button>
									)}
									<button
										onClick={() => {
											onToggleActive(form.id, !form.isActive);
											setMenuOpen(false);
										}}
										className="w-full px-4 py-2 text-left text-sm text-white hover:bg-hover flex items-center gap-2">
										{form.isActive ? (
											<>
												<ToggleLeft size={14} />
												Deactivate
											</>
										) : (
											<>
												<ToggleRight size={14} />
												Activate
											</>
										)}
									</button>
									<hr className="my-1 border-border" />
									<button
										onClick={() => {
											onDelete(form.id);
											setMenuOpen(false);
										}}
										className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
										<Trash2 size={14} />
										Delete
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
