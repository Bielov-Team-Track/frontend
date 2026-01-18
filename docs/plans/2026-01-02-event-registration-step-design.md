# Event Registration Step Design

## Overview

Redesign the event creation form to replace the current "Settings" step with a dynamic "Registration" step that adapts based on event type and format.

## Step Flow

1. Event Details (+ `isPrivate` moved here)
2. Time & Date
3. Location
4. **Registration** (replaces Settings)
5. Budget
6. Review

## Event Type to Format Mapping

| Event Type | Format | Registration UI |
|------------|--------|-----------------|
| Match | Teams with Positions (fixed) | Home/Away team slots |
| Social | List (fixed) | Open/closed + invitees |
| Training | List (fixed) | Open/closed + invitees |
| Casual Play | User chooses | Depends on format choice |

### Casual Play Format Options
- **List** → Same UI as Social/Training
- **Open Teams** → Team slots UI (positions labeled "Player")
- **Teams with Positions** → Team slots UI (volleyball positions)

## Registration Step UI by Type

### Match Events - Team Slots

Two slots: **Home Team** and **Away Team**

Each slot has three selection modes:

**Mode 1: Your Teams**
- Dropdown/search of teams from user's clubs
- Shows team name, club name, team color
- Instant selection, no invitation needed

**Mode 2: Invite External Team**
- Search clubs/teams on the platform
- Select a team → sends invitation request
- Club/team admin can accept or decline

**Mode 3: Manual Entry**
- Team name (text input)
- Contact email (to send invitation link)
- Team color (color picker)

**Slot Display States:**
- Empty → "Select team" placeholder
- Filled (your team) → Team name + color badge
- Pending invitation → Team name + "Pending" status
- Accepted → Team name + "Confirmed" status
- Declined → Team name + "Declined" status + option to select different team

**Key behavior:** Match functionality (scoring, etc.) works regardless of invitation status.

### List Format (Social, Training, Casual Play)

**Registration Settings:**
- Registration Type: Open / Closed toggle
  - Open: Anyone with access can register
  - Closed: Invitees only
- Capacity (optional, number input)
- Registration Opens (optional date/time - empty = immediately)
- Registration Deadline (date/time, default = event start time)

**Additional for Casual Play + Open:**
- Registration Unit: Individual / Team

**Invitees Section:**
- Search bar for people, teams, groups
- View toggle: Flat List (with tags) / Nested Navigation
- Bulk select: Add/remove entire clubs, teams, or groups
- Granular control: Remove individuals from group selection
- User's clubs appear at top of search results

**Selected Invitees Display:**
- Shows count
- Lists selected items with source tags
- Remove button per item
- Clear all button

### Casual Play with Teams (Open Registration)

- Registration Unit: Individual (join any slot) / Team (register as full team)
- Team Slots: Predefined slots with name and color
- Add/remove team slots dynamically
- Registration timing settings (same as List)

### Casual Play with Teams (Closed Registration)

Per team, choose:

**Option A: Invite Existing Team**
- Same search UI as Match external invite
- Platform teams only

**Option B: Create Team with Captain**
- Team name
- Team color
- Captain selection (search person)
- Captain receives link to manage team roster
- Captain's invitation page shows player slots (positions or "Player")
- Captain can assign people (sends invites) or share link/email

## Automatic Registration Behavior

- Before open time: Registration shown as "closed"
- After open time, before deadline: Registration open
- After deadline or event start: Registration closed

## Data Model

### New/Updated Fields

```typescript
// Registration settings
registrationType: 'open' | 'closed';
registrationOpenTime?: Date;        // null = immediately
registrationDeadline: Date;         // default = event start
capacity?: number;                  // only for List format
registrationUnit?: 'individual' | 'team'; // only for open + Casual Play

// For Match events
homeTeam?: {
  type: 'own' | 'invited' | 'manual';
  teamId?: string;           // if own or invited
  invitationId?: string;     // if invited
  name?: string;             // if manual
  contactEmail?: string;     // if manual
  color?: string;
};
awayTeam?: { /* same structure */ };

// For Casual Play with teams (closed)
eventTeams?: Array<{
  type: 'invited' | 'created';
  teamId?: string;           // if invited
  name?: string;             // if created
  color?: string;
  captainId?: string;        // if created
}>;

// For Casual Play with teams (open)
teamSlots?: Array<{
  name: string;
  color: string;
}>;

// Invitees (for List format or closed registration)
invitees?: Array<{
  type: 'user' | 'team' | 'group' | 'club';
  id: string;
  excludedUserIds?: string[]; // for granular control
}>;
```

### Removed Fields
- `teamsNumber` (replaced by slots system)
- `approveGuests` (discarded)

## Files to Modify

### Step Configuration
- `config/stepConfig.tsx` - Update step 4 from Settings to Registration
- `constants/eventFormOptions.ts` - Update validation fields

### Components to Create
- `steps/RegistrationStep.tsx` - Main registration step component
- `steps/registration/MatchTeamSlots.tsx` - Home/Away team selection
- `steps/registration/ListRegistration.tsx` - Open/closed + invitees UI
- `steps/registration/TeamSlotsRegistration.tsx` - Casual Play teams UI
- `steps/registration/InviteeSelector.tsx` - Search and select invitees
- `steps/registration/TeamSlotCard.tsx` - Individual team slot display

### Components to Modify
- `steps/EventDetailsStep.tsx` - Add isPrivate checkbox
- `steps/EventSettingsStep.tsx` - Remove (replaced by RegistrationStep)

### Form/Validation
- `validation/eventValidationSchema.ts` - Add new fields, remove old ones
- `hooks/useEventForm.ts` - Update default values
- `hooks/useEventWizard.ts` - Update step validation logic

### Models
- `lib/models/Event.ts` - Add new types and interfaces
