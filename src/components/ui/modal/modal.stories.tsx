import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import Modal from "./index";
import Button from "../button";
import { ImageCropper } from "../index";

const meta: Meta<typeof Modal> = {
    title: "UI/Modal",
    component: Modal,
    parameters: {
        layout: "centered",
        docs: {
            description: {
                component:
                    "A responsive modal component with animations, backdrop blur, and dark mode styling.",
            },
        },
    },
    tags: ["autodocs"],
    argTypes: {
        size: {
            control: "select",
            options: ["sm", "md", "lg", "xl", "full"],
        },
        isLoading: {
            control: "boolean",
        },
    },
};

export default meta;
type Story = StoryObj<typeof Modal>;

const ModalWrapper = (props: any) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
            <Modal
                {...props}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
};

export const Default: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: {
        title: "Edit Profile",
        description: "Make changes to your profile here. Click save when you're done.",
        children: (
            <div className="space-y-4">
                <p className="text-white/80">
                    This is the modal content area. You can put anything here.
                </p>
                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="ghost" color="neutral">Cancel</Button>
                    <Button variant="solid" color="primary">Save Changes</Button>
                </div>
            </div>
        ),
    },
};

export const LoadingState: Story = {
    render: (args) => <ModalWrapper {...args} />,
    args: {
        title: "Processing Payment",
        isLoading: true,
        children: (
            <div className="h-32 flex items-center justify-center text-muted">
                Content is hidden under loader...
            </div>
        ),
    },
};

export const WithImageCropper: Story = {
    render: (args) => {
        const [isOpen, setIsOpen] = useState(false);
        const [file, setFile] = useState<File | null>(null);

        // Create a dummy file for the story
        const createDummyFile = () => {
             const canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 300;
            const ctx = canvas.getContext("2d");
            if(ctx) {
                ctx.fillStyle = "red";
                ctx.fillRect(0,0,400,300);
            }
            canvas.toBlob(blob => {
                 if(blob) setFile(new File([blob], "test.png", {type: "image/png"}));
            });
        }
        
        if(!file) createDummyFile();

        return (
            <>
                <Button onClick={() => setIsOpen(true)}>Open Cropper Modal</Button>
                <Modal
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    title="Crop Profile Picture"
                    size="lg"
                >
                    {file && (
                        <div className="-m-4"> {/* Negative margin to pull cropper to edges if desired, or keep padding */}
                             <ImageCropper 
                                imageFile={file} 
                                onImageSave={() => setIsOpen(false)}
                                onCancel={() => setIsOpen(false)}
                                className="border-0 bg-transparent rounded-none" // Adjust styling to fit modal
                            />
                        </div>
                    )}
                </Modal>
            </>
        );
    },
};
