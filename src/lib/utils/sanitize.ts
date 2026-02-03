/**
 * HTML Sanitization Utility
 *
 * Uses DOMPurify to sanitize user-generated HTML content to prevent XSS attacks.
 *
 * IMPORTANT: Add DOMPurify to dependencies:
 *   npm install dompurify
 *   npm install -D @types/dompurify
 */

import DOMPurify from "dompurify";

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows safe HTML tags while removing potentially dangerous ones.
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(html: string): string {
	if (typeof window === "undefined") {
		// Server-side: return empty string or handle differently
		// DOMPurify requires DOM, so we return escaped HTML on server
		return html
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	return DOMPurify.sanitize(html, {
		// Allow common formatting tags
		ALLOWED_TAGS: [
			"p",
			"br",
			"strong",
			"b",
			"em",
			"i",
			"u",
			"s",
			"strike",
			"a",
			"ul",
			"ol",
			"li",
			"blockquote",
			"code",
			"pre",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"span",
			"div",
			"img",
		],
		// Allow safe attributes
		ALLOWED_ATTR: ["href", "target", "rel", "class", "src", "alt", "title", "width", "height"],
		// Force all links to open in new tab with security attributes
		ADD_ATTR: ["target", "rel"],
		// Hooks to modify links
		RETURN_DOM: false,
		RETURN_DOM_FRAGMENT: false,
	});
}

/**
 * Sanitizes HTML and ensures links are safe.
 * Adds target="_blank" and rel="noopener noreferrer" to all links.
 *
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string with safe link attributes
 */
export function sanitizeHtmlWithSafeLinks(html: string): string {
	if (typeof window === "undefined") {
		return sanitizeHtml(html);
	}

	// Configure DOMPurify to add safe attributes to links
	DOMPurify.addHook("afterSanitizeAttributes", (node) => {
		if (node.tagName === "A") {
			node.setAttribute("target", "_blank");
			node.setAttribute("rel", "noopener noreferrer");
		}
	});

	const result = DOMPurify.sanitize(html, {
		ALLOWED_TAGS: [
			"p",
			"br",
			"strong",
			"b",
			"em",
			"i",
			"u",
			"s",
			"strike",
			"a",
			"ul",
			"ol",
			"li",
			"blockquote",
			"code",
			"pre",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"span",
			"div",
			"img",
		],
		ALLOWED_ATTR: ["href", "target", "rel", "class", "src", "alt", "title", "width", "height"],
	});

	// Remove the hook to avoid affecting other sanitization calls
	DOMPurify.removeHook("afterSanitizeAttributes");

	return result;
}
