# Warriors Website Style Guide

## Overview
This style guide establishes consistent design patterns for the Warriors hockey team website. The design reflects the team's black and white kit with strategic use of color for emphasis and data visualization.

## Color Palette

### Primary Colors
- **Dark Gray (Primary)**: `gray-900` - Main text, navigation, headers
- **Medium Gray**: `gray-700` - Secondary text, borders
- **Light Gray**: `gray-100` - Subtle backgrounds, dividers
- **Background**: `gray-50` - Main page background (light)
- **White**: `white` - Card backgrounds, content areas

### Accent Colors (Use Sparingly)
- **Success/Positive**: `green-600` - Goals, wins, positive stats
- **Warning/Neutral**: `yellow-500` - Draws, neutral stats
- **Error/Negative**: `red-600` - Losses, negative stats, penalties
- **Info/Assists**: `blue-600` - Assists, informational content
- **Special/Points**: `purple-600` - Points, special achievements

## Typography

### Font Stack
- Primary: `font-sans` (system fonts)
- Monospace: `font-mono` (for statistics, numbers)

### Text Sizes & Weights
- **Page Titles**: `text-2xl md:text-3xl font-bold text-gray-900`
- **Section Headers**: `text-lg md:text-xl font-semibold text-gray-800`
- **Card Headers**: `text-base md:text-lg font-semibold text-gray-800`
- **Body Text**: `text-sm md:text-base text-gray-700`
- **Small Text**: `text-xs md:text-sm text-gray-600`
- **Statistics**: `text-lg md:text-xl font-bold` (with appropriate color)

## Layout Patterns

### Page Structure
```tsx
<div className="min-h-screen bg-gray-50">
  {/* Page Header */}
  <div className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
        Page Title
      </h1>
      <p className="text-sm md:text-base text-gray-600 text-center mt-2">
        Optional description
      </p>
    </div>
  </div>

  {/* Content */}
  <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
    {/* Page content */}
  </div>
</div>
```

### Card Components
```tsx
<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 md:p-6">
  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
    Card Title
  </h3>
  {/* Card content */}
</div>
```

### Filter Bars
```tsx
<div className="bg-white border-b shadow-sm">
  <div className="max-w-7xl mx-auto px-4 py-4">
    {/* Mobile toggle for collapsible filters */}
    <div className="md:hidden mb-4">
      {/* Toggle button */}
    </div>
    
    {/* Filter content */}
    <div className="flex flex-wrap gap-4">
      {/* Filters */}
    </div>
  </div>
</div>
```

## Component Standards

### Buttons
- **Primary**: `bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium transition-colors`
- **Secondary**: `bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 px-4 py-2 rounded-md font-medium transition-colors`
- **Filter Toggle**: `bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors`

### Tables
- **Header**: `bg-gray-50 text-gray-900 font-semibold text-left px-4 py-3 text-sm md:text-base`
- **Row**: `border-b border-gray-200 hover:bg-gray-50 transition-colors`
- **Cell**: `px-4 py-3 text-sm md:text-base text-gray-700`
- **Sticky Header**: `sticky top-0 z-10 bg-gray-50`

### Statistics Display
- **Goals**: `text-green-600 font-semibold`
- **Assists**: `text-blue-600 font-semibold`
- **Points**: `text-purple-600 font-bold`
- **Wins**: `text-green-600`
- **Losses**: `text-red-600`
- **Draws**: `text-yellow-600`
- **Penalties**: `text-red-600`

### Responsive Breakpoints
- Mobile-first approach
- Use `md:` prefix for tablet/desktop (768px+)
- Grid layouts: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Text sizes: `text-sm md:text-base`
- Padding: `px-4 py-6 md:py-8`

## Navigation

### Main Navigation
- Background: `bg-gray-900`
- Text: `text-gray-300`
- Hover: `hover:bg-gray-700 hover:text-white`
- Active: `bg-gray-700 text-white`

### Breadcrumbs (if needed)
- Background: `bg-gray-100`
- Text: `text-gray-600`
- Separator: `text-gray-400`

## Forms & Filters

### Select Dropdowns
- Background: `bg-white`
- Border: `border-gray-300`
- Focus: `focus:ring-2 focus:ring-gray-500 focus:border-gray-500`
- Text: `text-gray-900`

### Filter Chips/Buttons
- Inactive: `bg-gray-100 text-gray-700 hover:bg-gray-200`
- Active: `bg-gray-900 text-white`

## Animations & Transitions

### Standard Transitions
- Hover effects: `transition-colors duration-200`
- Shadow changes: `transition-shadow duration-200`
- Transform: `transition-transform duration-200`
- All properties: `transition-all duration-300 ease-in-out`

### Hover Effects
- Cards: `hover:shadow-md`
- Buttons: `hover:bg-gray-800` (for dark buttons)
- Table rows: `hover:bg-gray-50`

## Spacing

### Container Spacing
- Page padding: `px-4 py-6 md:py-8`
- Card padding: `p-4 md:p-6`
- Section gaps: `space-y-6 md:space-y-8`

### Grid Gaps
- Card grids: `gap-4 md:gap-6`
- Filter grids: `gap-4`
- Content grids: `gap-6 md:gap-8`

## Accessibility

### Focus States
- All interactive elements must have visible focus states
- Use `focus:outline-none focus:ring-2 focus:ring-gray-500`

### Color Contrast
- Ensure sufficient contrast for all text
- Don't rely solely on color to convey information

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- Use semantic elements (nav, main, section, article)

## Data Visualization

### Chart Colors
- Primary data: `gray-900`
- Secondary data: `gray-600`
- Positive trends: `green-600`
- Negative trends: `red-600`
- Neutral/info: `blue-600`

## Examples

### Page Header Example
```tsx
<div className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center">
      Player Statistics
    </h1>
    <p className="text-sm md:text-base text-gray-600 text-center mt-2">
      Individual player performance metrics and analytics
    </p>
  </div>
</div>
```

### Statistics Card Example
```tsx
<div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 md:p-6">
  <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
    Goals This Season
  </h3>
  <div className="text-2xl md:text-3xl font-bold text-green-600">
    24
  </div>
  <p className="text-xs md:text-sm text-gray-600 mt-1">
    +3 from last season
  </p>
</div>
```

## Implementation Notes

1. **Consistency**: Every page should follow the same header pattern
2. **Mobile-First**: Always design for mobile first, then enhance for larger screens
3. **Performance**: Use `transition-*` classes sparingly to avoid performance issues
4. **Maintainability**: Stick to the defined color palette and spacing scale
5. **Testing**: Test all components on mobile, tablet, and desktop viewports

This style guide should be referenced for all new components and used to update existing ones for consistency.
