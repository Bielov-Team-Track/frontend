"use client";

import { Modal, Button, Input, EmptyState } from "@/components";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TemplateCard } from "@/components/features/templates";
import { useMyTemplates, useClubTemplates, useBookmarkedTemplates } from "@/hooks/useTemplates";
import { TrainingPlanTemplate } from "@/lib/models/Template";
import { Search, BookmarkCheck, Building2, User } from "lucide-react";
import { useState } from "react";

interface LoadTemplateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectTemplate: (template: TrainingPlanTemplate) => void;
	clubId?: string;
}

type TabType = "my" | "club" | "bookmarked";

export default function LoadTemplateModal({ isOpen, onClose, onSelectTemplate, clubId }: LoadTemplateModalProps) {
	const [activeTab, setActiveTab] = useState<TabType>("my");
	const [searchTerm, setSearchTerm] = useState("");

	// Fetch templates for each tab
	const { data: myTemplatesResponse, isLoading: myLoading } = useMyTemplates(
		{ searchTerm: searchTerm || undefined },
		isOpen && activeTab === "my"
	);

	const { data: clubTemplatesResponse, isLoading: clubLoading } = useClubTemplates(
		clubId || "",
		{ searchTerm: searchTerm || undefined },
		isOpen && activeTab === "club" && !!clubId
	);

	const { data: bookmarkedTemplatesResponse, isLoading: bookmarkedLoading } = useBookmarkedTemplates(
		{ searchTerm: searchTerm || undefined },
		isOpen && activeTab === "bookmarked"
	);

	const handleSelectTemplate = (template: TrainingPlanTemplate) => {
		onSelectTemplate(template);
		onClose();
	};

	const getTemplatesForTab = (): TrainingPlanTemplate[] => {
		switch (activeTab) {
			case "my":
				return myTemplatesResponse?.items || [];
			case "club":
				return clubTemplatesResponse?.items || [];
			case "bookmarked":
				return bookmarkedTemplatesResponse?.items || [];
			default:
				return [];
		}
	};

	const isLoading = activeTab === "my" ? myLoading : activeTab === "club" ? clubLoading : bookmarkedLoading;
	const templates = getTemplatesForTab();

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Load Training Plan Template" size="lg">
			<div className="space-y-4">
				{/* Search */}
				<Input
					placeholder="Search templates..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					leftIcon={<Search size={16} />}
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
						<div className="mt-4">
							{isLoading ? (
								<div className="flex justify-center py-8">
									<span className="loading loading-spinner loading-md text-accent" />
								</div>
							) : templates.length === 0 ? (
								<EmptyState
									icon={User}
									title={searchTerm ? "No templates found" : "No personal templates"}
									description={searchTerm ? "Try adjusting your search" : "Create your first template to get started"}
								/>
							) : (
								<div className="space-y-3 max-h-[400px] overflow-y-auto">
									{templates.map((template) => (
										<div key={template.id} onClick={() => handleSelectTemplate(template)} className="cursor-pointer">
											<TemplateCard template={template} variant="compact" />
										</div>
									))}
								</div>
							)}
						</div>
					</TabsContent>

					{/* Club Templates Tab */}
					{clubId && (
						<TabsContent value="club">
							<div className="mt-4">
								{isLoading ? (
									<div className="flex justify-center py-8">
										<span className="loading loading-spinner loading-md text-accent" />
									</div>
								) : templates.length === 0 ? (
									<EmptyState
										icon={Building2}
										title={searchTerm ? "No templates found" : "No club templates"}
										description={searchTerm ? "Try adjusting your search" : "Your club hasn't created any templates yet"}
									/>
								) : (
									<div className="space-y-3 max-h-[400px] overflow-y-auto">
										{templates.map((template) => (
											<div key={template.id} onClick={() => handleSelectTemplate(template)} className="cursor-pointer">
												<TemplateCard template={template} variant="compact" />
											</div>
										))}
									</div>
								)}
							</div>
						</TabsContent>
					)}

					{/* Bookmarked Templates Tab */}
					<TabsContent value="bookmarked">
						<div className="mt-4">
							{isLoading ? (
								<div className="flex justify-center py-8">
									<span className="loading loading-spinner loading-md text-accent" />
								</div>
							) : templates.length === 0 ? (
								<EmptyState
									icon={BookmarkCheck}
									title={searchTerm ? "No templates found" : "No bookmarked templates"}
									description={searchTerm ? "Try adjusting your search" : "Bookmark templates to access them quickly"}
								/>
							) : (
								<div className="space-y-3 max-h-[400px] overflow-y-auto">
									{templates.map((template) => (
										<div key={template.id} onClick={() => handleSelectTemplate(template)} className="cursor-pointer">
											<TemplateCard template={template} variant="compact" />
										</div>
									))}
								</div>
							)}
						</div>
					</TabsContent>
				</Tabs>
			</div>
		</Modal>
	);
}
