# Frontend Codebase Review & UI/UX Consistency Report

**Date:** December 22, 2025
**Scope:** `frontend/src` directory (app, components, lib)

## 1. Executive Summary

The frontend codebase is functional and feature-rich, utilizing Next.js 15 (App Router) with a feature-based architecture. However, it is currently in a "transitional" state regarding UI standardization. There is a mix of strictly defined UI components (using `cva` and `tailwind-merge`) and raw HTML/Tailwind utility usage. This leads to visual inconsistencies, especially in spacing, colors, and interactive states. Significant opportunities exist for reducing code duplication by abstracting common patterns like Cards, Modals, and Search/Filter interfaces.

## 2. UI/UX Inconsistencies

### 2.1 Styling & Theming

-   **Button Inconsistency:** While a robust `Button` component exists in `src/components/ui/button`, many feature pages (e.g., `ClubsPageClient.tsx`) still use raw `<button className="btn btn-primary ...">` or manual Tailwind classes. This results in inconsistent hover states, padding, and focus rings.
-   **Color Palette Usage:** The codebase mixes semantic theme variables (e.g., `bg-background`, `text-primary`) with hardcoded values (e.g., `bg-white/5`, `bg-neutral-800`). This breaks theming capabilities and leads to subtle "mismatches" in dark mode grays.
-   **Layout backgrounds:** Different Route Groups (`(main)`, `(card-layout)`) use slightly different background colors (`bg-background` vs `bg-background`), causing visual "jumps" when navigating between the Dashboard and Auth pages.

### 2.2 Form UX

-   **Input Handling:** Feature forms (e.g., `CreateEventForm`) often manually render labels (`<label>`) and error messages (`<span>`), ignoring the built-in capabilities of the standardized `Input` component which supports `label` and `error` props. This creates inconsistent spacing between fields.
-   **Validation Feedback:** Some forms show errors as text below inputs, while others rely solely on toast notifications or browser defaults.

## 3. Component Reuse Opportunities

### 3.1 Atomic Components (High Priority)

-   **Modals:** Multiple modal implementations exist (`confirmation-modal`, `delete-confirm-modal`, feature-specific modals).
    -   _Recommendation:_ Unify into a single, polymorphic `Modal` or `Dialog` component (using Radix UI primitives if available) that handles accessibility (focus trapping, overlay) consistently.
-   **Cards:** `TeamCard`, `GroupCard`, and `EventCard` share 80% of their structure (Image, Title, Badge, Action Button).
    -   _Recommendation:_ Create a generic `Card`, `CardHeader`, `CardContent`, `CardFooter` composite component to standardize shadows, borders, and padding.
-   **Badges/Tags:** Skill levels (`Beginner`, `Advanced`) and Statuses (`Pending`, `Accepted`) are rendered with manual CSS classes in many places.
    -   _Recommendation:_ Create a `Badge` component with variants (`success`, `warning`, `outline-solid`).

### 3.2 Composite Patterns

-   **Search & Filter Bars:** `ClubsPageClient`, `EventsPageClient`, and `AttendanceFilters` all implement their own search inputs and filter toggles.
    -   _Recommendation:_ Build a `FilterBar` component that accepts a list of filter definitions and handles the UI rendering.
-   **Page Headers:** Dashboard pages often manually implement a header with a title, breadcrumb, and "Create" button.
    -   _Recommendation:_ Create a `PageHeader` component to ensure consistent typography and spacing across the dashboard.

## 4. Architectural Observations

-   **"V2" Components:** Files like `ClaudeRosterSidebarV2` and `ClaudeVolleyballCourtV2` indicate leftover experiments or incomplete refactors. These should be merged or removed to prevent confusion.
-   **Forms folder sprawl:** Form logic is scattered across feature folders. While keeping forms near their usage is good, the _building blocks_ of these forms (Layouts, Sections, FieldGroups) should be shared.

## 5. Action Plan & Recommendations

1.  **Standardize Atomic UI:**

    -   Audit all usages of `<button>` and replace with `<Button />`.
    -   Audit all usages of `<input>` and replace with `<Input />`.
    -   Standardize all "Card-like" containers to use `bg-white/5 border-white/10`.

2.  **Refactor Layouts:**

    -   Ensure `src/app/(main)/layout.tsx` and `src/app/dashboard/layout.tsx` use the exact same background color token to prevent flickering.

3.  **Clean Up:**

    -   Remove or Merge `*V2` files in `src/components/features/teams`.
    -   Consolidate duplicate modal logic.

4.  **Design System:**
    -   Define a strict set of "Surface" colors (e.g., `surface-1`, `surface-2`) instead of using arbitrary `white/5` or `white/10` opacity values, to ensure contrast ratios are maintained.
