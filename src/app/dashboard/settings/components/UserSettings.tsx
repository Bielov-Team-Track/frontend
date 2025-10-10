"use client";

import { createNotificationSubscription } from "@/lib/requests/subscriptions";
import React, { useState } from "react";
import { FiEdit2 as EditIcon } from "react-icons/fi";
import Avatar from "@/components/ui/avatar";
import { UserProfile } from "@/lib/models/User";

function UserSettings({ user }: { user: UserProfile }) {
	const [changeImageModalOpen, setChangeImageModalOpen] =
		useState<boolean>(false);

	const enableNotifications = () => {
		if ("serviceWorker" in navigator && "PushManager" in window) {
			navigator.serviceWorker
				.register("/scripts/notifications_worker.js")
				.then(function (swReg) {
					console.log("Service Worker is registered", swReg);

					swReg.pushManager
						.subscribe({
							userVisibleOnly: true,
							applicationServerKey:
								"BDoqxWXp2K97_Wuk4s2On7aeqBus_ZvJuGLrOn_moB3LCElqnweRINPhgwL0byp8ktqCSCorTxPJSGpcZR7y02o",
						})
						.then(async function (subscription) {
							await createNotificationSubscription(user?.userId, subscription);
						});
				})
				.catch(function (error) {
					console.error("Service Worker Error", error);
				});
		}
	};

	return (
		<div>
			<div className="flex justify-center">
				<div className="relative">
					<Avatar profile={user} size="large" />
					<button
						className="btn bg-primary text-primary-content absolute bottom-2 right-2"
						onClick={() => setChangeImageModalOpen(true)}
					>
						<EditIcon />
					</button>
				</div>
			</div>
			<div>
				<span className="font-bold">Name: </span>
				<span>{user.name}</span>
			</div>
			<div>
				<span className="font-bold">Notifications: </span>
				<input type="checkbox" className="checkbox" />
				<button
					onClick={enableNotifications}
					className="btn btn-success text-muted-100"
				>
					Enable notifications
				</button>
			</div>
		</div>
	);
}

export default UserSettings;
