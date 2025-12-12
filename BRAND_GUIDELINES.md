# CROZZ Coin - Branding & Design System

## Overview

CROZZ Coin is a decentralized finance platform on Sui blockchain with a modern, professional brand identity. This document defines all visual and stylistic elements.

## Brand Colors

### Primary Colors

- **Purple (#8B5CF6)**: Primary brand color - trust, innovation
- **Pink (#EC4899)**: Accent color - energy, enthusiasm
- **Dark (#1E1B4B)**: Dark background - sophistication

### Secondary Colors

- **Cyan (#06B6D4)**: Alternative accent - technology
- **Blue (#3B82F6)**: Information color - clarity
- **Dark Bg (#0F0D1D)**: Primary background

### Neutral Colors

- **Light (#E0E7FF)**: Primary text
- **Gray (#A0AEC0)**: Secondary text
- **Border (#3B3366)**: Borders and dividers
- **Overlay (#1E1B4B, 50% opacity)**: Transparent backgrounds

## Gradients

### Main Gradient

```css
linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)
```
Used for: Primary buttons, headings, logos

### Dark Gradient

```css
linear-gradient(135deg, #1e1b4b 0%, #0f0d1d 100%)
```
Used for: Background layers, depth

## Typography

### Font Family

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

### Font Weights

- **Regular**: 400 (body text)
- **Medium**: 500 (secondary headings)
- **Semibold**: 600 (labels, buttons)
- **Bold**: 700 (headings)
- **Extra Bold**: 800 (main titles)

### Font Sizes

```
Hero Title:     3.5rem (56px) - clamp(2rem, 5vw, 3.5rem)
Section Title:  2.5rem (40px)
Heading:        1.5rem (24px)
Subheading:     1.25rem (20px)
Body:           1rem (16px)
Small:          0.95rem (15px)
Label:          0.85rem (13px)
```

## Components

### Buttons

#### Primary Button

```css
background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
color: white;
padding: 1rem 2rem;
border-radius: 0.75rem;
font-weight: 600;
border: none;
cursor: pointer;
transition: all 0.3s;

&:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(139, 92, 246, 0.4);
}
```

#### Secondary Button

```css
background: transparent;
color: #ec4899;
border: 2px solid #ec4899;
padding: 1rem 2rem;
border-radius: 0.75rem;
font-weight: 600;
cursor: pointer;
transition: all 0.3s;

&:hover {
  background: rgba(236, 72, 153, 0.1);
  transform: translateY(-2px);
}
```

#### Icon Buttons

- Size: 20-24px
- Stroke Width: 1.5px
- Color: Primary color or inherit

### Cards

#### Feature Card

```css
background: rgba(139, 92, 246, 0.05);
border: 1px solid #3b3366;
border-radius: 1rem;
padding: 2rem;
backdrop-filter: blur(10px);
transition: all 0.3s;

&:hover {
  border-color: #ec4899;
  background: rgba(236, 72, 153, 0.05);
  transform: translateY(-5px);
}
```

#### Stat Card

```css
background: rgba(139, 92, 246, 0.1);
border: 1px solid #3b3366;
border-radius: 0.75rem;
padding: 1.5rem;
backdrop-filter: blur(10px);
text-align: center;
```

### Navigation

#### Top Navigation

- Height: 70px
- Background: rgba(15, 13, 29, 0.95) with backdrop blur
- Sticky positioning
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.3)

#### Nav Items

- Active state: Pink text with left border
- Hover state: Pink text with background

### Spacing

```css
--spacing-xs: 0.25rem
--spacing-sm: 0.5rem
--spacing-md: 1rem
--spacing-lg: 1.5rem
--spacing-xl: 2rem
```

### Border Radius

- Small components: 0.5rem (8px)
- Medium components: 0.75rem (12px)
- Large components: 1rem (16px)
- Circles: 50%

### Transitions

```css
--transition-fast: 0.15s ease
--transition-base: 0.3s ease
--transition-slow: 0.5s ease
```

## Sections

### Hero Section

- Min Height: 90vh
- Centered content
- Background gradient
- Floating animations (6s, 8s duration)

### Feature Section

- 3-column grid (responsive)
- 2rem gap
- Card hover effects

### Stats Section

- 4-column grid on desktop
- Responsive to smaller screens
- Icon alignment

### CTA Section

- Full width
- Gradient background
- Centered text
- Large button

### Footer

- Dark background with top border
- 4-column grid
- Link hover effects

## Responsive Breakpoints

```css
Mobile:  < 768px
Tablet:  768px - 1024px
Desktop: > 1024px
```

### Mobile Adjustments

- Single column layouts
- Stack buttons vertically
- Hidden desktop elements
- Optimized font sizes

## Icons

### Icon Library

Lucide React icons (20-40px)

### Common Icons

- `Coins` - Token/Currency
- `Zap` - Energy/Speed
- `Shield` - Security
- `TrendingUp` - Growth
- `Users` - Community
- `Cpu` - Technology
- `Award` - Achievement
- `Menu` / `X` - Navigation
- `Home` / `Settings` - Pages
- `LogOut` - Disconnect

### Icon Colors

- Primary: `#8b5cf6` (Purple)
- Accent: `#ec4899` (Pink)
- Inherit: Use parent color

## Animations

### Floating Animation

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}
duration: 6s, repeat: infinite
```

### Slide Down

```css
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
duration: 0.3s
```

### Button Hover

```css
transform: translateY(-2px);
box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
```

## Accessibility

- Minimum contrast ratio: 4.5:1 for text
- Touch targets: 44px minimum
- Focus states: Clear outline or highlight
- Semantic HTML
- ARIA labels where needed

## Logo Variations

### Full Logo

```
CROZZ COIN
[Icon] Text
```

### Icon Only

```
[Coins Icon - 28px]
```

### Condensed

```
CROZZ
```

## Usage Guidelines

### Do's ✅

- Use the gradient for primary CTAs
- Maintain consistent spacing
- Use semantic colors (pink for errors/warnings)
- Apply transitions to interactive elements
- Keep text contrast high

### Don'ts ❌

- Don't change core colors
- Don't mix purple and pink without gradient
- Don't add shadows to cards with blur
- Don't resize icons outside 16-40px range
- Don't use too many different fonts

## Implementation Files

- `LandingPage.tsx` - Landing page component
- `LandingPage.module.css` - Landing page styles
- `AppLayout.tsx` - Main app layout
- `AppLayout.module.css` - App layout styles

## CSS Custom Properties

All brand colors and measurements are defined as CSS custom properties in `:root` for easy maintenance:

```css
:root {
  --primary-purple: #8b5cf6;
  --primary-pink: #ec4899;
  --primary-dark: #1e1b4b;
  --gradient-main: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
  /* ... more properties */
}
```

## Font Licensing

System fonts are used exclusively - no additional font files needed.

## Performance Optimization

- Backdrop filters for glassmorphism effect
- CSS gradients instead of images
- Hardware-accelerated transforms
- Optimized animations (6-8s duration)
- Minimal JavaScript for styling

## Browser Support

- Modern browsers (2023+)
- CSS Grid and Flexbox
- Backdrop filters
- CSS variables
- SVG icons

## Future Enhancements

1. Dark/Light mode toggle
2. Customizable themes
3. Accessibility improvements
4. Animation preferences
5. Custom font loading
6. Internationalization (i18n) support

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Status**: Production Ready
