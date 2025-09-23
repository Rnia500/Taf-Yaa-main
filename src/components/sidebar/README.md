# NavigationSideBar Component

A flexible, reusable navigation sidebar component that can be used across different pages and contexts.

## Features

- **Generic & Flexible**: Accepts navigation items as props, supporting both simple objects and custom components
- **Active State Management**: Automatically highlights the current page/section
- **Quick Actions**: Optional section for common actions/buttons
- **Responsive Design**: Adapts to mobile screens with horizontal layout
- **Customizable**: Extensive prop options for different use cases

## Basic Usage

```jsx
import NavigationSideBar from '../components/sidebar/NavigationSideBar';

const navigationItems = [
  {
    id: 'home',
    label: 'Home',
    icon: <HomeIcon />,
    path: '/',
    active: location.pathname === '/'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: <UserIcon />,
    path: '/profile',
    active: location.pathname === '/profile'
  }
];

<NavigationSideBar
  navItems={navigationItems}
  title="Navigation"
  quickActions={[]}
  showQuickActions={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `navItems` | Array | `[]` | Array of navigation items |
| `title` | String | `"Menu"` | Title displayed at the top |
| `quickActions` | Array | `[]` | Array of quick action buttons |
| `showQuickActions` | Boolean | `true` | Whether to show quick actions section |
| `className` | String | `""` | Additional CSS class |

## Navigation Item Structure

Each navigation item can have the following properties:

```jsx
{
  id: 'unique-id',           // Required: Unique identifier
  label: 'Display Name',     // Required: Text to display
  icon: <IconComponent />,   // Optional: Icon component
  path: '/route-path',       // Optional: Route to navigate to
  active: false,             // Optional: Whether item is active
  count: 5,                  // Optional: Number badge
  countLabel: 'items',       // Optional: Label for count
  subtitle: 'Description',   // Optional: Additional text
  onClick: () => {},         // Optional: Custom click handler
  component: <CustomComponent /> // Optional: Custom component instead of default card
}
```

## Quick Actions Structure

```jsx
const quickActions = [
  {
    id: 'action-1',
    label: 'Quick Action',
    icon: <ActionIcon />,
    onClick: () => { /* handle click */ },
    variant: 'primary' // Optional: Button variant
  }
];
```

## Advanced Usage Examples

### With Custom Components

```jsx
const navItems = [
  {
    id: 'custom-section',
    component: <CustomNavigationSection />
  }
];

<NavigationSideBar navItems={navItems} />
```

### With Mixed Content

```jsx
const navItems = [
  // Standard navigation items
  { id: 'home', label: 'Home', path: '/', icon: <HomeIcon /> },
  { id: 'settings', label: 'Settings', path: '/settings', icon: <SettingsIcon /> },

  // Custom component
  {
    id: 'user-info',
    component: <UserProfileCard user={currentUser} />
  },

  // Item with custom click handler
  {
    id: 'logout',
    label: 'Logout',
    icon: <LogoutIcon />,
    onClick: handleLogout
  }
];
```

## Styling

The component uses CSS modules and CSS variables for theming:

- `--color-primary`: Primary theme color
- `--color-primary-light`: Light variant of primary color
- `--color-white`: Background color
- `--color-gray`: Border and text colors
- `--color-background`: Page background

## Responsive Behavior

- **Desktop**: Vertical sidebar (280px width)
- **Tablet**: Maintains vertical layout
- **Mobile**: Converts to horizontal layout with reduced height

## Integration with Routing

The component automatically integrates with React Router for navigation. Items with a `path` property will use `navigate(path)` when clicked.

For custom navigation logic, use the `onClick` property instead of or in addition to `path`.
