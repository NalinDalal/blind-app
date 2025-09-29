---
# Blind App - Component Documentation

This file provides comprehensive JSDoc documentation for all major React components in the Blind App, including props, state management, usage examples, and Redux slices/hooks.

---

## UI Component Props Interfaces
```typescript
interface ButtonProps {
  /** Button content */
  children: React.ReactNode;
  /** Button variant style */
  variant?: 'default' | 'outline' | 'ghost';
  /** Click event handler */
  onClick?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** Button type for forms */
  type?: 'button' | 'submit' | 'reset';
  /** Additional CSS classes */
  className?: string;
}

interface InputProps {
  /** Input placeholder text */
  placeholder?: string;
  /** Input type */
  type?: 'text' | 'email' | 'password';
  /** Auto-completion hint */
  autoComplete?: string;
  /** Maximum character length */
  maxLength?: number;
  /** Additional CSS classes */
  className?: string;
}
```

## Redux Slices & Hooks
```typescript
// AuthSlice
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

// Redux hooks
const { useAppSelector, useAppDispatch } = hooks;
```

## Usage Example
```tsx
import { Button } from './ui/button';

<Button variant="outline" onClick={handleClick}>
  Click Me
</Button>
```

---

## See Also
- [System Architecture](ARCHITECTURE.md)
- [API Reference](API.md)
