# Task Completion Checklist

## Before Marking Any Task Complete

### 1. Type Safety ✓
```bash
npx tsc --noEmit
```
- [ ] No TypeScript errors
- [ ] No implicit `any` types
- [ ] Proper null checks

### 2. Linting ✓
```bash
pnpm lint
```
- [ ] No ESLint errors
- [ ] No warnings in changed files

### 3. Build Verification ✓
```bash
pnpm build
```
- [ ] Build completes successfully
- [ ] No build-time errors

### 4. Manual Testing
- [ ] Feature works in browser
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Dark mode works correctly
- [ ] Loading states display properly
- [ ] Error states handled gracefully

### 5. Code Quality
- [ ] Follows established patterns (see code_conventions.md)
- [ ] No hardcoded values (use constants/env vars)
- [ ] Proper error handling
- [ ] No console.log statements left in code
- [ ] Components are accessible (keyboard navigation, ARIA labels)

### 6. Security Review
- [ ] No sensitive data exposed in client code
- [ ] User input is validated
- [ ] API calls use proper authentication
- [ ] No XSS vulnerabilities (sanitize user content)

## Feature-Specific Checks

### New Components
- [ ] Follows design system (design_system.md)
- [ ] Has proper TypeScript props interface
- [ ] Is responsive
- [ ] Handles loading/error/empty states

### API Integration
- [ ] Uses React Query for data fetching
- [ ] Proper error handling
- [ ] Loading states implemented
- [ ] Cache invalidation on mutations

### Forms
- [ ] Uses React Hook Form + Yup
- [ ] Client-side validation
- [ ] Error messages displayed
- [ ] Submit button disabled during submission
- [ ] Success/error toasts

## Linear Progress Update

After completing a feature:
1. Find corresponding Linear issue
2. Update status to "Done"
3. Update sub-issues (Unit Tests, Integration Tests, E2E Tests, Documentation)

## Git Workflow
- Write clear, descriptive commit messages
- Reference Linear issue IDs if applicable
- Keep commits focused and atomic
