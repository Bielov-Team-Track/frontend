"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RoleOption<T extends string> {
    value: T;
    label: string;
    description: string;
}

interface RoleCheckboxGroupProps<T extends string> {
    availableRoles: RoleOption<T>[];
    selectedRoles: T[];
    onChange: (roles: T[]) => void;
    disabled?: boolean;
}

export function RoleCheckboxGroup<T extends string>({
    availableRoles,
    selectedRoles,
    onChange,
    disabled = false,
}: RoleCheckboxGroupProps<T>) {
    const handleToggle = (role: T) => {
        if (selectedRoles.includes(role)) {
            onChange(selectedRoles.filter((r) => r !== role));
        } else {
            onChange([...selectedRoles, role]);
        }
    };

    return (
        <div className="space-y-3">
            {availableRoles.map((role) => (
                <div
                    key={role.value}
                    className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => !disabled && handleToggle(role.value)}
                >
                    <Checkbox
                        id={role.value}
                        checked={selectedRoles.includes(role.value)}
                        onCheckedChange={() => handleToggle(role.value)}
                        disabled={disabled}
                        className="mt-0.5"
                    />
                    <div className="space-y-1 flex-1">
                        <Label htmlFor={role.value} className="font-medium cursor-pointer">
                            {role.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            {role.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}

export type { RoleOption, RoleCheckboxGroupProps };
