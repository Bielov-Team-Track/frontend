import type { Meta, StoryObj } from "@storybook/react";
import Dropdown, { DropdownOption } from "./index";
import { User, Building2, Users } from "lucide-react";

const meta: Meta<typeof Dropdown> = {
    title: "UI/Dropdown",
    component: Dropdown,
    parameters: {
        layout: "centered",
        backgrounds: {
            default: "dark",
        },
    },
    tags: ["autodocs"],
    argTypes: {
        variant: {
            control: "select",
            options: ["default", "bordered", "ghost"],
        },
        size: {
            control: "select",
            options: ["sm", "md", "lg"],
        },
    },
    decorators: [
        (Story) => (
            <div className="w-[300px] h-[300px] flex items-start justify-center pt-10">
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof Dropdown>;

const simpleOptions: DropdownOption[] = [
    { value: "1", label: "Option 1" },
    { value: "2", label: "Option 2" },
    { value: "3", label: "Option 3" },
    { value: "4", label: "Disabled Option", disabled: true },
];

export const Default: Story = {
    args: {
        placeholder: "Select an option",
        options: simpleOptions,
        onChange: () => {},
    },
};

export const WithLabel: Story = {
    args: {
        label: "Select Label",
        placeholder: "Select an option",
        options: simpleOptions,
        onChange: () => {},
    },
};

export const WithIcon: Story = {
    args: {
        label: "With Icon",
        leftIcon: <User size={16} />,
        options: simpleOptions,
        onChange: () => {},
    },
};

const richOptions: DropdownOption[] = [
    { value: "club1", label: "Volley Club", data: { icon: Building2, color: "text-blue-400" } },
    { value: "club2", label: "Beach Team", data: { icon: Users, color: "text-yellow-400" } },
];

export const CustomRendering: Story = {
    args: {
        label: "Custom Rendering",
        options: richOptions,
        onChange: () => {},
        renderOption: (option) => {
            const data = option.data as { icon: typeof Building2; color: string };
            return (
                <div className="flex items-center gap-2">
                    <data.icon size={16} className={data.color} />
                    <span>{option.label}</span>
                </div>
            );
        },
        renderValue: (option) => {
            const data = option.data as { icon: typeof Building2; color: string };
            return (
                <div className="flex items-center gap-2">
                    <data.icon size={16} className={data.color} />
                    <span className="font-semibold">{option.label}</span>
                </div>
            );
        },
    },
};

export const WithError: Story = {
    args: {
        label: "Error State",
        error: "This field is required",
        options: simpleOptions,
        onChange: () => {},
    },
};

export const Sizes: Story = {
    render: () => (
        <div className="flex flex-col gap-4 w-full">
            <Dropdown size="sm" placeholder="Small" options={simpleOptions} onChange={() => {}} />
            <Dropdown size="md" placeholder="Medium" options={simpleOptions} onChange={() => {}} />
            <Dropdown size="lg" placeholder="Large" options={simpleOptions} onChange={() => {}} />
        </div>
    ),
};
