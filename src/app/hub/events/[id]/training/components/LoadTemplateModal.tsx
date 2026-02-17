"use client";

import { Modal, Button, Input, EmptyState } from "@/components";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TemplateCard } from "@/components/features/templates";
import { useMyPlans, useClubPlans, useBookmarkedPlans } from "@/hooks/useTemplates";
import { TrainingPlan } from "@/lib/models/Template";
import { Search, BookmarkCheck, Building2, User } from "lucide-react";
import { useState } from "react";

interface LoadTemplateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectTemplate: (template: TrainingPlan) => void;
	clubId?: string;
	isLoading?: boolean;
}

type TabType = "my" | "club" | "bookmarked";

export default function LoadTemplateModal({ isOpen, onClose, onSelectTemplate, clubId, isLoading }: LoadTemplateModalProps) {
	const [activeTab, setActiveTab] = useState<TabType>("my");
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch plans for each tab
	const { data: myTemplatesResponse, isLoading: myLoading } = useMyPlans(
		{ searchTerm: searchTerm || undefined },
		isOpen && activeTab === "my"
	);

	const { data: clubTemplatesResponse, isLoading: clubLoading } = useClubPlans(
		clubId || "",
		{ searchTerm: searchTerm || undefined },
		isOpen && activeTab === "club" && !!clubId
	);

	const { data: bookmarkedTemplatesResponse, isLoading: bookmarkedLoading } = useBookmarkedPlans(
		{ searchTerm: searchTerm || undefined },
		isOpen && activeTab === "bookmarked"
	);

	const handleSelectTemplate = (template: TrainingPlan) => {
		onSelectTemplate(template);
	};

	const getTemplatesForTab = (): TrainingPlan[] => {
		switch (activeTab) {
			case "my":
				return myTemplatesResponse || [];
			case "club":
				return clubTemplatesResponse || [];
			case "bookmarked":
				return bookmarkedTemplatesResponse || [];
			default:
				return [];
		}
	};

	const isTabLoading = activeTab === "my" ? myLoading : activeTab === "club" ? clubLoading : bookmarkedLoading;
	const templates = getTemplatesForTab();

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Load Training Plan Template" size="lg" isLoading={isLoading}>
			<div className="space-y-4">
				{/* Search */}
				<Input
					placeholder="Search templates..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					leftIcon={<Search size={16} />}
					disabled={isLoading}
				/>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
					<TabsList>
						<TabsTrigger value="my">
							<User size={16} />
							My Plans
						</TabsTrigger>
						{clubId && (
							<TabsTrigger value="club">
								<Building2 size={16} />
								Club
							</TabsTrigger>
						)}
						<TabsTrigger value="bookmarked">
							<BookmarkCheck size={16} />
							Bookmarked
						</TabsTrigger>
					</TabsList>

					{/* My Templates Tab */}
					<TabsContent value="my">
						<TemplateTabContent
							isLoading={isTabLoading}
							isActionLoading={isLoading}
							templates={templates}
							searchTerm={searchTerm}
							emptyIcon={User}
							emptyTitle="No personal templates"
							emptyDescription="Create your first template to get started"
							onSelect={handleSelectTemplate}
						/>
					</TabsContent>

					{/* Club Templates Tab */}
					{clubId && (
						<TabsContent value="club">
							<TemplateTabContent
								isLoading={isTabLoading}
								isActionLoading={isLoading}
								templates={templates}
								searchTerm={searchTerm}
								emptyIcon={Building2}
								emptyTitle="No club templates"
								emptyDescription="Your club hasn't created any templates yet"
								onSelect={handleSelectTemplate}
							/>
						</TabsContent>
					)}

					{/* Bookmarked Templates Tab */}
					<TabsContent value="bookmarked">
						<TemplateTabContent
							isLoading={isTabLoading}
							isActionLoading={isLoading}
							templates={templates}
							searchTerm={searchTerm}
							emptyIcon={BookmarkCheck}
							emptyTitle="No bookmarked templates"
							emptyDescription="Bookmark templates to access them quickly"
							onSelect={handleSelectTemplate}
						/>
					</TabsContent>
				</Tabs>
			</div>
		</Modal>
	);
}

function TemplateTabContent({
	isLoading,
	isActionLoading,
	templates,
	searchTerm,
	emptyIcon: EmptyIcon,
	emptyTitle,
	emptyDescription,
	onSelect,
}: {
	isLoading: boolean;
	isActionLoading?: boolean;
	templates: TrainingPlan[];
	searchTerm: string;
	emptyIcon: typeof User;
	emptyTitle: string;
	emptyDescription: string;
	onSelect: (template: TrainingPlan) => void;
}) {
	return (
		<div className="mt-4">
			{isLoading ? (
				<div className="flex justify-center py-8">
					<span className="loading loading-spinner loading-md text-accent" />
				</div>
			) : templates.length === 0 ? (
				<EmptyState
					icon={EmptyIcon}
					title={searchTerm ? "No templates found" : emptyTitle}
					description={searchTerm ? "Try adjusting your search" : emptyDescription}
				/>
			) : (
				<div className="space-y-3 max-h-[400px] overflow-y-auto">
					{templates.map((template) => (
						<button
							key={template.id}
							onClick={() => onSelect(template)}
							disabled={isActionLoading}
							className="w-full text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<TemplateCard template={template} variant="compact" />
						</button>
					))}
				</div>
			)}
		</div>
	);
}
