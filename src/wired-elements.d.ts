// Type declarations for wired-elements
declare module 'wired-elements' {
  // This allows importing wired-elements without TypeScript errors
}

// Define proper types for wired element events and properties
interface WiredElementEvent extends Event {
  detail?: {
    selected?: string
    checked?: boolean
    value?: string | number
  }
}

interface WiredElementProps {
  elevation?: string | number
  selected?: string
  value?: string | number
  placeholder?: string
  disabled?: boolean
  checked?: boolean
}

// Extend the global JSX namespace to include wired elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'wired-button': WiredElementProps & {
        onClick?: (event: MouseEvent) => void
      }
      'wired-card': WiredElementProps
      'wired-input': WiredElementProps & {
        onInput?: (event: WiredElementEvent) => void
        onChange?: (event: WiredElementEvent) => void
      }
      'wired-textarea': WiredElementProps & {
        onInput?: (event: WiredElementEvent) => void
        onChange?: (event: WiredElementEvent) => void
      }
      'wired-checkbox': WiredElementProps & {
        onChange?: (event: WiredElementEvent) => void
      }
      'wired-radio': WiredElementProps
      'wired-radio-group': WiredElementProps & {
        onSelected?: (event: WiredElementEvent) => void
      }
      'wired-toggle': WiredElementProps & {
        onChange?: (event: WiredElementEvent) => void
      }
      'wired-slider': WiredElementProps & {
        min?: number
        max?: number
        onChange?: (event: WiredElementEvent) => void
      }
      'wired-progress': WiredElementProps & {
        value?: number
        percentage?: boolean
      }
      'wired-item': WiredElementProps & {
        value?: string
        text?: string
      }
      'wired-listbox': WiredElementProps & {
        onSelected?: (event: WiredElementEvent) => void
      }
      'wired-combo': WiredElementProps & {
        onSelected?: (event: WiredElementEvent) => void
      }
      'wired-icon-button': WiredElementProps & {
        onClick?: (event: MouseEvent) => void
      }
      'wired-fab': WiredElementProps & {
        onClick?: (event: MouseEvent) => void
      }
      'wired-tabs': WiredElementProps & {
        onSelected?: (event: WiredElementEvent) => void
      }
      'wired-tab': WiredElementProps & {
        name?: string
        label?: string
      }
      'wired-dialog': WiredElementProps & {
        open?: boolean
      }
      'wired-tooltip': WiredElementProps & {
        for?: string
        position?: string
        text?: string
      }
      'wired-divider': WiredElementProps
      'wired-link': WiredElementProps & {
        href?: string
        target?: string
      }
      'wired-search-input': WiredElementProps & {
        onInput?: (event: WiredElementEvent) => void
        onSearch?: (event: WiredElementEvent) => void
      }
      'wired-spinner': WiredElementProps & {
        spinning?: boolean
        duration?: number
      }
      'wired-calendar': WiredElementProps & {
        onSelected?: (event: WiredElementEvent) => void
      }
    }
  }
}

export {}
