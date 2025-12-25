"use client";

import { useState } from "react";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { TeamEvent } from "../types";

interface TeamEventFormModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (event: Omit<TeamEvent, "id" | "createdAt">) => void;
}

export default function TeamEventFormModal({
	isOpen,
	onClose,
	onSubmit,
}: TeamEventFormModalProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [location, setLocation] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !startTime || !endTime) return;

		onSubmit({
			name: name.trim(),
			description: description.trim(),
			startTime: new Date(startTime),
			endTime: new Date(endTime),
			location: location.trim(),
		});

		// Reset form
		setName("");
		setDescription("");
		setStartTime("");
		setEndTime("");
		setLocation("");
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Create Event" size="md">
			<form onSubmit={handleSubmit} className="space-y-4">
				<Input
					label="Event Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
				/>

				<div>
					<label className="block text-sm font-medium text-white mb-2">
						Description
					</label>
					<textarea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						rows={2}
						className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent resize-none"
					/>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-white mb-2">
							Start Time <span className="text-red-400">*</span>
						</label>
						<input
							type="datetime-local"
							value={startTime}
							onChange={(e) => setStartTime(e.target.value)}
							required
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-white mb-2">
							End Time <span className="text-red-400">*</span>
						</label>
						<input
							type="datetime-local"
							value={endTime}
							onChange={(e) => setEndTime(e.target.value)}
							required
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
				</div>

				<Input
					label="Location"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
				/>

				<div className="flex gap-3 pt-4">
					<Button
						type="button"
						variant="ghost"
						color="neutral"
						fullWidth
						onClick={onClose}>
						Cancel
					</Button>
					<Button type="submit" variant="solid" color="accent" fullWidth>
						Create Event
					</Button>
				</div>
			</form>
		</Modal>
	);
}
