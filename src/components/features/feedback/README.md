# Feedback Components

Frontend components for player feedback system including badges, praise notifications, and skill progress tracking.

## Components

### 1. Confetti
Animated confetti effect for celebrating achievements and praise.

**Usage:**
```tsx
import { Confetti, firePraiseConfetti } from '@/components/features/feedback';

// Component usage
<Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

// Programmatic usage
firePraiseConfetti();
```

### 2. BadgeDisplay
Displays achievement badges with tooltips.

**Usage:**
```tsx
import { BadgeDisplay, BadgeGrid } from '@/components/features/feedback';

// Single badge
<BadgeDisplay badgeType="MVP" size="md" showTooltip={true} />

// Multiple badges with overflow
<BadgeGrid
  badges={["FirstEvent", "MVP", "Champion"]}
  maxDisplay={3}
  size="md"
/>
```

**Available Badge Types:**
- `FirstEvent` - First volleyball event attended
- `EventOrganizer` - Organized a community event
- `TeamPlayer` - 10+ team events participated
- `MVP` - Most Valuable Player
- `Consistent` - 5 weeks attendance streak
- `Champion` - Won a tournament
- `SocialButterfly` - Played with 20+ players
- `EarlyBird` - Consistently arrives early

### 3. PraiseNotification
Animated modal for displaying coach praise with confetti.

**Usage:**
```tsx
import { PraiseNotification } from '@/components/features/feedback';

<PraiseNotification
  isOpen={showPraise}
  onClose={() => setShowPraise(false)}
  badgeType="MVP"
  message="Outstanding performance today!"
  coachName="Coach Sarah"
  autoCloseDelay={5000}
/>
```

### 4. SkillProgressChart
Line chart showing skill improvement over time.

**Usage:**
```tsx
import { SkillProgressChart, SkillChangeIndicator } from '@/components/features/feedback';

const trends = [
  {
    skillName: "Serving",
    dates: ["2024-01-01", "2024-01-08", "2024-01-15"],
    scores: [65, 70, 75]
  }
];

// Full chart
<SkillProgressChart trends={trends} />

// Individual skill indicator
<SkillChangeIndicator
  skillName="Serving"
  currentScore={75}
  previousScore={70}
/>
```

## Installation Requirements

These components require additional npm packages:

```bash
# For Confetti component
npm install canvas-confetti @types/canvas-confetti

# For SkillProgressChart component
npm install recharts

# framer-motion is already installed (used by PraiseNotification)
```

## Implementation Status

**Task 9: Confetti ✅**
- Created `Confetti.tsx` with trigger-based and programmatic API
- Includes canvas-confetti integration (requires installation)
- Gold/yellow color scheme for praise theme

**Task 10: BadgeDisplay ✅**
- Created `BadgeDisplay.tsx` with 8 badge types
- Matches backend `BadgeTypeEnum`
- Single badge display and grid layout with overflow
- Custom tooltip implementation (no external library needed)

**Task 11: PraiseNotification ✅**
- Created `PraiseNotification.tsx` with framer-motion animations
- Spring animations for entrance/exit
- Auto-close with configurable delay
- Integrates with confetti on show

**Task 12: SkillProgressChart ✅**
- Created `SkillProgressChart.tsx` with recharts integration (requires installation)
- Line chart for multiple skill trends
- `SkillChangeIndicator` component for current score display
- Matches backend `SkillTrendDto` interface

## Next Steps

1. Install required packages:
   ```bash
   cd frontend
   npm install canvas-confetti @types/canvas-confetti recharts
   ```

2. Update `Confetti.tsx` to uncomment the canvas-confetti implementation

3. Update `SkillProgressChart.tsx` to uncomment the recharts implementation

4. Create integration tests for components

5. Add Storybook stories for component showcase

## File Locations

```
frontend/src/components/features/feedback/
├── Confetti.tsx              # Confetti animation component
├── BadgeDisplay.tsx          # Badge display components
├── PraiseNotification.tsx    # Praise modal with animations
├── SkillProgressChart.tsx    # Skill progress visualization
├── index.ts                  # Barrel exports
└── README.md                 # This file
```

## Related Backend DTOs

These components are designed to work with backend DTOs:

- `BadgeTypeEnum` (8 types)
- `SkillTrendDto` (skill progress data)
- `PraiseDto` (coach praise messages)

See backend documentation for DTO schemas.
