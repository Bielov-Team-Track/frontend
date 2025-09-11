import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import ImageCropper from "./index";
import Button from "../button";

const meta: Meta<typeof ImageCropper> = {
  title: "UI/ImageCropper",
  component: ImageCropper,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An image cropping component using react-easy-crop. Allows users to crop images to a 1:1 aspect ratio.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    imageFile: {
      description: "The image file to be cropped",
    },
    onImageSave: {
      description: "Callback function called when the cropped image is saved",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Create a mock file for demonstration
const createMockImageFile = (): File => {
  // Create a canvas with a sample image
  const canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 300;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Create a gradient background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#ff7b7b");
    gradient.addColorStop(0.5, "#4ecdc4");
    gradient.addColorStop(1, "#45b7d1");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Sample Image", canvas.width / 2, canvas.height / 2);
    ctx.font = "16px Arial";
    ctx.fillText("for Cropping", canvas.width / 2, canvas.height / 2 + 30);
  }

  // Convert canvas to blob and create file
  return new Promise<File>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], "sample-image.png", { type: "image/png" }));
      }
    });
  }) as any;
};

// Interactive story with file upload
const InteractiveTemplate = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedImage, setCroppedImage] = useState<Blob | null>(null);
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setCroppedImage(null);
      setCroppedImageUrl(null);
    }
  };

  const handleImageSave = (croppedImageBlob: Blob) => {
    setCroppedImage(croppedImageBlob);
    const url = URL.createObjectURL(croppedImageBlob);
    setCroppedImageUrl(url);
    console.log("Cropped image saved:", croppedImageBlob);
  };

  const loadSampleImage = () => {
    // Create a sample image for demonstration
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#ff7b7b");
      gradient.addColorStop(0.5, "#4ecdc4");
      gradient.addColorStop(1, "#45b7d1");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.fillText("Sample Image", canvas.width / 2, canvas.height / 2);
      ctx.font = "16px Arial";
      ctx.fillText("for Cropping", canvas.width / 2, canvas.height / 2 + 30);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "sample-image.png", {
          type: "image/png",
        });
        setSelectedFile(file);
        setCroppedImage(null);
        setCroppedImageUrl(null);
      }
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Upload an image to crop</h3>
        <div className="flex gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input file-input-bordered w-full max-w-xs"
          />
          <Button onClick={loadSampleImage} variant="outline">
            Load Sample Image
          </Button>
        </div>
      </div>

      {selectedFile && (
        <div className="space-y-4">
          <h4 className="font-medium">Crop your image (1:1 aspect ratio)</h4>
          <div className="border rounded-lg p-4 bg-gray-50">
            <ImageCropper
              imageFile={selectedFile}
              onImageSave={handleImageSave}
            />
          </div>
        </div>
      )}

      {croppedImageUrl && (
        <div className="space-y-4">
          <h4 className="font-medium">Cropped Result</h4>
          <div className="flex justify-center">
            <img
              src={croppedImageUrl}
              alt="Cropped result"
              className="max-w-xs border rounded-lg shadow-md"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const Interactive: Story = {
  render: InteractiveTemplate,
  parameters: {
    docs: {
      description: {
        story:
          "Interactive image cropper. Upload an image or load a sample to try the cropping functionality.",
      },
    },
  },
};

// Static demonstration
export const WithSampleImage: Story = {
  render: () => {
    const [file, setFile] = useState<File | null>(null);

    const createSampleFile = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Create a more complex sample image
        const gradient = ctx.createRadialGradient(300, 200, 0, 300, 200, 300);
        gradient.addColorStop(0, "#ffd89b");
        gradient.addColorStop(1, "#19547b");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add shapes
        ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
        ctx.beginPath();
        ctx.arc(150, 150, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(450, 250, 60, 0, Math.PI * 2);
        ctx.fill();

        // Add text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("CROP ME", canvas.width / 2, canvas.height / 2);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const mockFile = new File([blob], "sample-for-cropping.png", {
            type: "image/png",
          });
          setFile(mockFile);
        }
      });
    };

    if (!file) {
      createSampleFile();
      return <div>Loading sample image...</div>;
    }

    return (
      <div style={{ width: "500px" }}>
        <ImageCropper
          imageFile={file}
          onImageSave={(blob: Blob) =>
            console.log("Saved cropped image:", blob)
          }
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Image cropper with a pre-loaded sample image for demonstration.",
      },
    },
  },
};
