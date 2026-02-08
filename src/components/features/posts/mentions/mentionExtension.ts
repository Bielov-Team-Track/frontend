import { getMentionSuggestions } from "@/lib/api/posts";
import { ContextType } from "@/lib/models/Post";
import Mention from "@tiptap/extension-mention";
import { mergeAttributes, ReactRenderer } from "@tiptap/react";
import { SuggestionOptions } from "@tiptap/suggestion";
import tippy, { Instance as TippyInstance } from "tippy.js";
import MentionSuggestions, { MentionSuggestionsRef } from "./MentionSuggestions";

export interface MentionExtensionOptions {
	contextType: ContextType;
	contextId: string;
}

// Custom Mention extension that renders as clickable links
const ClickableMention = Mention.extend({
	renderHTML({ node, HTMLAttributes }) {
		const userId = node.attrs.id;
		const label = node.attrs.label ?? userId;
		const isEveryone = userId === "everyone";

		// For @everyone, render as a non-clickable span
		if (isEveryone) {
			return ["span", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), `@${label}`];
		}

		// For user mentions, render as a link to their profile
		return [
			"a",
			mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
				href: `/hub/profile/${userId}`,
				"data-mention-id": userId,
			}),
			`@${label}`,
		];
	},
});

export function createMentionExtension({ contextType, contextId }: MentionExtensionOptions) {
	return ClickableMention.configure({
		HTMLAttributes: {
			class: "mention bg-primary/20 text-primary px-1 rounded cursor-pointer hover:bg-primary/30 transition-colors",
		},
		suggestion: {
			items: async ({ query }) => {
				if (!query) return [];
				try {
					return await getMentionSuggestions(contextType, contextId, query);
				} catch {
					return [];
				}
			},
			render: () => {
				let component: ReactRenderer<MentionSuggestionsRef> | null = null;
				let popup: TippyInstance[] | null = null;

				return {
					onStart: (props) => {
						component = new ReactRenderer(MentionSuggestions, {
							props: {
								items: props.items,
								command: props.command,
							},
							editor: props.editor,
						});

						if (!props.clientRect) return;

						popup = tippy("body", {
							getReferenceClientRect: props.clientRect as () => DOMRect,
							appendTo: () => document.body,
							content: component.element,
							showOnCreate: true,
							interactive: true,
							trigger: "manual",
							placement: "bottom-start",
						});
					},

					onUpdate: (props) => {
						component?.updateProps({
							items: props.items,
							command: props.command,
						});

						if (!props.clientRect) return;

						popup?.[0]?.setProps({
							getReferenceClientRect: props.clientRect as () => DOMRect,
						});
					},

					onKeyDown: (props) => {
						if (props.event.key === "Escape") {
							popup?.[0]?.hide();
							return true;
						}
						return component?.ref?.onKeyDown(props) ?? false;
					},

					onExit: () => {
						popup?.[0]?.destroy();
						component?.destroy();
					},
				};
			},
		} as Partial<SuggestionOptions>,
	});
}
