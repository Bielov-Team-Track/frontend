# Components Guide

## Quick Import Reference

### UI Components (Design System)
```typescript
import { 
  Input, 
  Select, 
  TextArea, 
  Avatar, 
  Modal, 
  Loader,
  BackButton,
  ConfirmationModal 
} from '@/components/ui'
```

### Layout Components  
```typescript
import { 
  Header, 
  Footer, 
  ReactQueryProvider 
} from '@/components/layout'
```

### Feature Components

#### Events
```typescript
import { 
  EventsList,
  EventMenu, 
  ApprovalSection,
  CreateEventForm,
  EventEditForm 
} from '@/components/features/events'
```

#### Teams
```typescript
import { 
  TeamsList,
  Team,
  Position,
  PositionWithUser 
} from '@/components/features/teams'
```

#### Authentication
```typescript
import { 
  ForgotPasswordForm,
  ResetPasswordForm 
} from '@/components/features/auth'
```

#### Users
```typescript
import { UserSearch } from '@/components/features/users'
```

#### Locations  
```typescript
import { 
  Map, 
  LocationForm 
} from '@/components/features/locations'
```

## Component Categories

### 🎨 UI Components (`/ui`)
Reusable design system components that can be used across features.

- **Input**: Form input with validation, icons, and responsive design
- **Select**: Dropdown select with consistent styling  
- **TextArea**: Multi-line text input with character counting
- **Avatar**: User profile pictures with fallbacks
- **Modal**: Overlay dialogs with proper accessibility
- **Loader**: Loading spinners and states

### 🧭 Layout Components (`/layout`) 
App-wide layout and structural components.

- **Header**: Main app navigation header
- **Footer**: App footer with links and info
- **ReactQueryProvider**: Global query state management wrapper

### ⚡ Feature Components (`/features`)
Domain-specific components organized by business logic.

Each feature directory contains:
- `components/` - UI components specific to the feature
- `forms/` - Forms related to the feature
- `index.ts` - Barrel exports for the feature

## Usage Examples

### Creating a Form
```typescript
import { Input, Select, TextArea } from '@/components/ui'

function MyForm() {
  return (
    <form>
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        leftIcon={<FaEnvelope />}
        required
      />
      
      <Select
        label="Type"
        options={typeOptions}
        placeholder="Choose type"
      />
      
      <TextArea
        label="Description"
        maxLength={500}
        showCharCount
      />
    </form>
  )
}
```

### Using Feature Components
```typescript
import { EventsList } from '@/components/features/events'
import { Loader } from '@/components/ui'

function EventsPage({ events, isLoading }) {
  if (isLoading) return <Loader />
  
  return <EventsList events={events} />
}
```

## Adding New Components

1. **UI Component**: Add to `/ui/[component-name]/`
2. **Feature Component**: Add to `/features/[domain]/components/`  
3. **Update exports**: Add to relevant `index.ts`
4. **Follow naming**: kebab-case files, PascalCase components