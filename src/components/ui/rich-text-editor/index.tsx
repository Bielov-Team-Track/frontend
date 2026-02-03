"use client";

import { createMentionExtension, FetchSuggestionsFn } from "@/components/shared/mentions";
import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, AnyExtension, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered } from "lucide-react";
import { forwardRef, useCallback, useImperativeHandle } from "react";

export interface RichTextEditorRef {
	insertContent: (content: string) => void;
	focus: () => void;
	getEditor: () => Editor | null;
}

interface RichTextEditorProps {
	content: string;
	onChange: (html: string) => void;
	placeholder?: string;
	className?: string;
	autoFocus?: boolean;
	/** Callback to fetch mention suggestions. If provided, enables mentions. */
	fetchMentionSuggestions?: FetchSuggestionsFn;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(function RichTextEditor({
	content,
	onChange,
	placeholder = "What's on your mind?",
	className,
	autoFocus = false,
	fetchMentionSuggestions,
}, ref) {
	const extensions: AnyExtension[] = [
		StarterKit.configure({
			heading: false,
			codeBlock: false,
			code: false,
			blockquote: false,
			horizontalRule: false,
		}),
		Link.configure({
			openOnClick: false,
			HTMLAttributes: {
				class: "text-primary underline",
			},
		}),
		Placeholder.configure({
			placeholder,
		}),
	];

	if (fetchMentionSuggestions) {
		extensions.push(createMentionExtension({ fetchSuggestions: fetchMentionSuggestions }));
	}

	const editor = useEditor({
		extensions,
		immediatelyRender: false,
		content,
		autofocus: autoFocus,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: "prose prose-invert prose-sm max-w-none focus:outline-none min-h-[120px] px-4 py-3",
			},
		},
	});

	useImperativeHandle(ref, () => ({
		insertContent: (content: string) => {
			editor?.chain().focus().insertContent(content).run();
		},
		focus: () => {
			editor?.chain().focus().run();
		},
		getEditor: () => editor,
	}), [editor]);

	const setLink = useCallback(() => {
		if (!editor) return;

		const previousUrl = editor.getAttributes("link").href;
		const url = window.prompt("URL", previousUrl);

		if (url === null) return;

		if (url === "") {
			editor.chain().focus().extendMarkRange("link").unsetLink().run();
			return;
		}

		editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
	}, [editor]);

	if (!editor) return null;

	return (
		<div className={cn("border border-white/10 rounded-xl overflow-hidden bg-white/5", className)}>
			{/* Toolbar */}
			<div className="flex items-center gap-1 px-3 py-2 border-b border-white/10 bg-white/5">
				<ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive("bold")} title="Bold">
					<Bold size={16} />
				</ToolbarButton>
				<ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive("italic")} title="Italic">
					<Italic size={16} />
				</ToolbarButton>
				<ToolbarButton onClick={setLink} isActive={editor.isActive("link")} title="Link">
					<LinkIcon size={16} />
				</ToolbarButton>
				<div className="w-px h-5 bg-white/10 mx-1" />
				<ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive("bulletList")} title="Bullet List">
					<List size={16} />
				</ToolbarButton>
				<ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive("orderedList")} title="Numbered List">
					<ListOrdered size={16} />
				</ToolbarButton>
			</div>

			{/* Editor */}
			<EditorContent editor={editor} />
		</div>
	);
});

function ToolbarButton({ onClick, isActive, title, children }: { onClick: () => void; isActive: boolean; title: string; children: React.ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			title={title}
			className={cn("p-2 rounded-lg transition-colors", isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-white/10")}>
			{children}
		</button>
	);
}

export default RichTextEditor;
