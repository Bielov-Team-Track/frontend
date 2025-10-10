"use client";

import React, { ChangeEvent, useState } from "react";
import classNames from "classnames";
import type { AxiosError } from "axios";

// Temporary stub; replace with real component implementation
function ImageCropper({
	imageFile,
	onImageSave,
}: {
	imageFile: File;
	onImageSave: (image: Blob) => Promise<void>;
}) {
	return (
		<div className="border p-4 rounded">
			<p>Image selected: {imageFile.name}</p>
			<button
				className="btn btn-primary"
				onClick={() => onImageSave(imageFile)}
			>
				Save
			</button>
		</div>
	);
}

function ProfileCreate() {
	const [step, setStep] = useState<number>(3);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [userId, setUserId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const updateProfileImage = async (_image: Blob, _userId: string) => {
		/* TODO: implement */
	};
	const signup = async () => {
		/* TODO: implement */
	};

	const loadImage = (event: ChangeEvent<HTMLInputElement>) => {
		const files = (event.target as HTMLInputElement).files;
		const file = files && files[0];
		if (file) {
			setImageFile(file);
		}
	};

	const uploadImage = async (image: Blob) => {
		setIsLoading(true);
		if (!userId) {
			setIsLoading(false);
			console.error("userID is not set");
			return;
		}
		updateProfileImage(image, userId)
			.then(() => {
				setIsLoading(false);
			})
			.catch((error: AxiosError) => {
				(error?.response as any)?.data &&
					setError((error.response as any).data.message);
				setIsLoading(false);
			});
	};

	return (
		<div>
			<div className={classNames({ hidden: step != 3 }, "flex flex-col gap-4")}>
				<div>
					<label htmlFor="name">Name</label>
					<input
						name="name"
						id="name"
						className="input w-full input-bordered"
						type="text"
					/>
				</div>
				<div>
					<label htmlFor="surname">Surname</label>
					<input
						name="surname"
						id="surname"
						className="input w-full input-bordered"
						type="text"
					/>
				</div>

				<button
					className="btn btn-primary text-muted-100"
					type="submit"
					onClick={signup}
				>
					Next
				</button>
			</div>

			<div className={classNames({ hidden: step != 4 }, "flex flex-col gap-4")}>
				<div>
					<label htmlFor="image">Image</label>
					<input
						id="image"
						className="file-input w-full input-bordered"
						type="file"
						onChange={loadImage}
					/>
				</div>
				<div>
					{imageFile && (
						<ImageCropper imageFile={imageFile} onImageSave={uploadImage} />
					)}
				</div>
				<button
					className="btn btn-ghost text-muted-100"
					onClick={() => setStep(5)}
				>
					Skip
				</button>
				<button
					className={classNames("btn btn-success text-muted-100", {
						disabled: !!imageFile,
					})}
					onClick={() => setStep(5)}
				>
					Update
				</button>
			</div>
		</div>
	);
}

export default ProfileCreate;
