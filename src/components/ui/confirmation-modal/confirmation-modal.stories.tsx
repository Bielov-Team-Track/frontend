import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef } from "react";
import ConfirmationModal from "./index";
import Button from "../button";

const meta: Meta<typeof ConfirmationModal> = {
	title: "UI/ConfirmationModal",
	component: ConfirmationModal,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A confirmation modal component that displays a question with confirm/decline buttons. Uses HTML dialog element.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		confirm: {
			description: "Function to call when confirm button is clicked",
		},
		question: {
			control: { type: "text" },
			description: "The question to display in the modal",
		},
		confirmText: {
			control: { type: "text" },
			description: "Text for the confirm button",
			table: {
				defaultValue: { summary: "Yes" },
			},
		},
		declineText: {
			control: { type: "text" },
			description: "Text for the decline button",
			table: {
				defaultValue: { summary: "No" },
			},
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story with trigger button
const InteractiveTemplate = (args: any) => {
	const modalRef = useRef<HTMLDialogElement>(null);

	const openModal = () => {
		modalRef.current?.showModal();
	};

	return (
		<div>
			<Button onClick={openModal}>Open Confirmation Modal</Button>
			<ConfirmationModal
				ref={modalRef}
				confirm={() => {
					modalRef.current?.close();
				}}
				{...args}
			/>
		</div>
	);
};

export const Default: Story = {
	render: InteractiveTemplate,
	args: {
		question: "Are you sure you want to proceed?",
	},
};

export const DeleteConfirmation: Story = {
	render: InteractiveTemplate,
	args: {
		question:
			"Are you sure you want to delete this item? This action cannot be undone.",
		confirmText: "Delete",
		declineText: "Cancel",
	},
};

export const SaveConfirmation: Story = {
	render: InteractiveTemplate,
	args: {
		question: "Do you want to save your changes before leaving?",
		confirmText: "Save",
		declineText: "Discard",
	},
};

export const LogoutConfirmation: Story = {
	render: InteractiveTemplate,
	args: {
		question: "Are you sure you want to log out?",
		confirmText: "Log out",
		declineText: "Stay",
	},
};

export const CustomActions: Story = {
	render: InteractiveTemplate,
	args: {
		question: "This will permanently remove all data. Type DELETE to confirm.",
		confirmText: "CONFIRM",
		declineText: "ABORT",
	},
};

// Story showing the modal structure without interaction
export const StaticView: Story = {
	render: (args) => (
		<div style={{ position: "relative", minHeight: "400px" }}>
			<div className="modal modal-open">
				<div className="modal-box">
					<h3 className="font-bold text-2xl text-center">Confirm</h3>
					<p className="pt-4 text-center">{args.question}</p>
					<div className="modal-action">
						<div className="w-full flex justify-around">
							<button className="btn btn-success w-16 text-muted-50">
								{args.confirmText || "Yes"}
							</button>
							<button className="btn btn-error w-16 text-muted-50">
								{args.declineText || "No"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	),
	args: {
		question: "Are you sure you want to proceed?",
	},
	parameters: {
		docs: {
			description: {
				story: "Static view of the modal structure without interaction.",
			},
		},
	},
};
