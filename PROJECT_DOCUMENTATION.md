# Asantey Hair & Braids - Luxury Salon Website

## Project Overview

A production-ready, high-end luxury salon website built with React, GSAP, Framer Motion, and Lenis. The design follows a **Cinematic Editorial Sophistication** philosophy, delivering a premium digital experience with smooth animations, magnetic interactions, and sophisticated typography.

---

## Design Philosophy: Cinematic Fresh Editorial Gallery

The entire website is built around a cinematic, image-first design approach that emphasizes:

- **High-Fashion Editorial Aesthetics**: Each section tells a visual story through carefully composed imagery
- **Dramatic Visual Storytelling**: Typography overlays on photography with careful contrast management
- **Smooth, Buttery Animations**: All interactions feel cinematic and professional
- **Luxury Through Dark Sophistication**: A dramatic and highly immersive dark luxury aesthetic composed of Soft Obsidian backgrounds, high-contrast Crisp Frost typography, Mist Gray outlines, Steel Blue accents, and Deep Ash CTA/buttons.

### Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Soft Obsidian | #222222 | Primary background, creating an ultra-premium, dark luxury environment |
| Crisp Frost | #FCFDFF | Primary typography, headers, and high-contrast elements, maximizing freshness |
| Mist Gray | #DCDFE1 | Subtle borders, dividers, and UI card outlines |
| Steel Blue | #465362 | Alternative accent for interactive links, icons, and special text features |
| Cloud | #F0F2F5 | Secondary background sections and containers |
| Deep Ash | #3D3D3D | Primary CTA buttons, action backgrounds, and key accent elements |

### Typography System

- **Headers**: Playfair Display (600-900 weight) with -0.02em letter-spacing
- **Body**: Inter (300-400 weight) with 1.8 line-height for elegance
- **CTA**: Inter 600 uppercase with 0.1em letter-spacing

---

## Project Structure

```
client/src/
├── components/
│   ├── UI/
│   │   ├── Preloader.tsx          # SVG hair-to-logo animation with shutter reveal
│   │   └── Cursor.tsx              # Global fluid cursor with magnetic hover states
│   ├── Layout/
│   │   ├── GlobalScroll.tsx        # Lenis smooth scrolling wrapper
│   │   ├── Navigation.tsx          # Glassmorphism navbar
│   │   └── Footer.tsx              # Elegant footer with newsletter
│   └── Sections/
│       ├── Hero.tsx                # Split-screen hero with stagger mask-up
│       ├── Services.tsx            # Horizontal scroll gallery with parallax
│       └── Shop.tsx                # 3D tilt cards with Quick Add animation
├── hooks/
│   ├── useLenis.ts                 # Smooth scrolling integration
│   └── useGSAP.ts                  # Safe GSAP animation setup
├── contexts/
│   └── ThemeContext.tsx            # Theme management (dark mode)
├── pages/
│   └── Home.tsx                    # Main page component
├── App.tsx                         # Root component with all sections
├── main.tsx                        # React entry point
└── index.css                       # Global styles and design tokens
```

---

## Key Features & Components

### 1. Cinematic Preloader

**File**: `client/src/components/UI/Preloader.tsx`

A sophisticated loading animation that creates a premium first impression:

- **Hair Strand Animation**: SVG path draws itself with gradient fill (0-1.5s)
- **Logo Morph**: Hair strand fades, logo text fades in (1.5-2.5s)
- **Shutter Reveal**: Vertical clip-path animation reveals hero section (2.5-3.5s)
- **Total Duration**: ~3.5 seconds with smooth easing

**GSAP Techniques Used**:
- `strokeDasharray` and `strokeDashoffset` for SVG drawing
- `clipPath` for shutter effect
- Timeline sequencing for coordinated animations

### 2. Global Fluid Cursor

**File**: `client/src/components/UI/Cursor.tsx`

Premium cursor interaction system:

- **Lead Dot**: 3px beige circle with glow effect
- **Trailing Circle**: 8px border circle with 0.1s lag
- **Magnetic Hover**: Scales 3x on interactive elements (a, button, [role="button"])
- **Mix Blend Mode**: `difference` for visual impact
- **Event Delegation**: Automatically detects all interactive elements

**Performance Optimizations**:
- Uses `requestAnimationFrame` for smooth 60fps tracking
- GSAP ticker integration for consistent animation timing
- Efficient event listener cleanup on unmount

### 3. Editorial Hero Section

**File**: `client/src/components/Sections/Hero.tsx`

Split-screen cinematic hero with sophisticated animations:

- **Typography**: "The Art of Elegance" headline with character-by-character stagger reveal
- **Mask-Up Effect**: Each character rises from invisible container with 0.05s stagger
- **Image Scale**: Hero image scales from 1.1 to 1 for depth perception
- **Gradient Overlay**: Ensures text readability over photography
- **Geometric Divider**: Angled line separating content from image

**GSAP Techniques**:
- Character-level animation using `gsap.utils.toArray()`
- Staggered animations with `stagger: 0.05`
- Scale animations for depth effect
- Coordinated timeline sequencing

### 4. GSAP Horizontal Scroll Services

**File**: `client/src/components/Sections/Services.tsx`

Cinematic horizontal scroll gallery triggered by vertical scrolling:

- **Horizontal Translation**: Vertical scroll triggers horizontal card movement
- **Parallax Images**: Internal card images shift vertically while scrolling
- **Staggered Reveals**: Cards fade and slide in with 0.1s stagger
- **4 Service Cards**: Braiding, Color, Styling, Treatments

**GSAP ScrollTrigger Integration**:
```javascript
gsap.to(track, {
  x: () => -(track.offsetWidth - container.offsetWidth),
  scrollTrigger: {
    trigger: container,
    start: 'top center',
    end: 'bottom center',
    scrub: 1,  // Smooth scrubbing
  },
});
```

**Parallax Effect**:
- Each card image moves independently based on scroll position
- Creates depth and visual interest
- Smooth easing with `scrub: 1`

### 5. Boutique Shop Section

**File**: `client/src/components/Sections/Shop.tsx`

3D tilt cards with Framer Motion and Quick Add animations:

- **3D Tilt Effect**: Hover-based rotation using mouse position
- **Quick Add Button**: Staggered spring animation on hover
- **Product Grid**: 3-column layout on desktop, responsive on mobile
- **6 Product Cards**: Hair care, tools, and accessories

**Framer Motion Features**:
- `initial`, `whileInView`, `transition` for entrance animations
- `spring` physics for bouncy Quick Add button
- Staggered reveals with `delay: index * 0.1`

**3D Tilt Implementation**:
- Calculates rotation based on mouse position within card
- Uses `transformPerspective: 1000` for depth
- Smooth reset on mouse leave with `duration: 0.5`

### 6. Smooth Scrolling Integration

**File**: `client/src/hooks/useLenis.ts`

Lenis smooth scrolling for buttery-smooth scroll experience:

- **Duration**: 1.2s easing function for smooth deceleration
- **GSAP Ticker Integration**: Synchronized with GSAP animations
- **ScrollTrigger Compatible**: Works seamlessly with GSAP ScrollTrigger
- **Automatic Cleanup**: Proper destruction on component unmount

**Custom Easing Function**:
```javascript
easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
```
Creates exponential easing for natural scroll feel.

### 7. Navigation & Footer

**Navigation** (`client/src/components/Layout/Navigation.tsx`):
- Glassmorphism effect with `backdrop-filter: blur(10px)`
- Sticky positioning for persistent access
- Responsive design with mobile menu button
- Beige accent on hover

**Footer** (`client/src/components/Layout/Footer.tsx`):
- 4-column layout with brand, services, company, newsletter
- Newsletter subscription form
- Social links and copyright
- Consistent luxury branding

---

## Animation Easing Functions

All animations use carefully selected easing functions for cinematic feel:

| Animation | Easing | Duration | Effect |
|-----------|--------|----------|--------|
| Preloader Hair | power2.inOut | 1.5s | Smooth draw |
| Logo Reveal | power2.out | 0.8s | Quick entrance |
| Shutter | power3.inOut | 1s | Dramatic reveal |
| Stagger Text | power3.out | 0.8s | Snappy entrance |
| Scale Image | power2.out | 1.2s | Depth creation |
| Horizontal Scroll | linear (scrub) | - | Smooth tracking |
| Parallax | linear (scrub) | - | Smooth tracking |
| Cursor Scale | power2.out | 0.3s | Responsive feel |

---

## Memory Management & Cleanup

### GSAP Context Management

The custom `useGSAP` hook ensures proper cleanup:

```typescript
export const useGSAP = (
  callback: () => void | (() => void),
  dependencies?: React.DependencyList
) => {
  const contextRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    contextRef.current = gsap.context(() => {
      const cleanup = callback();
      return cleanup;
    });

    return () => {
      if (contextRef.current) {
        contextRef.current.revert();  // Reverts all animations
      }
    };
  }, dependencies);
};
```

**Benefits**:
- All animations scoped to component lifecycle
- Automatic cleanup prevents memory leaks
- ScrollTrigger instances properly destroyed
- No orphaned event listeners

### Lenis Cleanup

```typescript
return () => {
  gsap.ticker.remove(raf);
  lenis.destroy();
};
```

Ensures smooth scrolling is properly destroyed on unmount.

---

## Performance Optimizations

1. **Image Optimization**: WebP compressed versions for faster loading
2. **GSAP Ticker**: Uses shared ticker for efficient animation loop
3. **ScrollTrigger**: Lazy-initializes only when needed
4. **Event Delegation**: Cursor uses event bubbling for efficiency
5. **CSS Transforms**: All animations use GPU-accelerated properties
6. **Lazy Loading**: Components render on viewport entry with Framer Motion

---

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **GSAP**: Full support for all animation features
- **CSS**: Supports CSS Grid, Flexbox, CSS Variables, clip-path
- **JavaScript**: ES6+ features with React 19

---

## Development Workflow

### Starting the Dev Server

```bash
cd /home/ubuntu/asantey-luxury-salon
pnpm dev
```

Dev server runs on `http://localhost:3000/`

### Building for Production

```bash
pnpm build
```

Creates optimized production build in `dist/` directory.

### Type Checking

```bash
pnpm check
```

Runs TypeScript compiler to catch type errors.

### Code Formatting

```bash
pnpm format
```

Formats code using Prettier.

---

## Customization Guide

### Changing Colors

Edit CSS variables in `client/src/index.css`:

```css
:root {
  --charcoal: #1a1a1a;
  --cream: #f5f5f0;
  --beige: #d4b996;
  /* ... more colors ... */
}
```

### Modifying Animation Timings

Update durations in component files:

```typescript
// In Preloader.tsx
timeline.fromTo(
  '.hair-strand',
  { strokeDashoffset: 500, opacity: 1 },
  { strokeDashoffset: 0, duration: 1.5 } // Change duration here
);
```

### Adding New Services

Edit the `services` array in `Services.tsx`:

```typescript
const services = [
  {
    id: 1,
    title: 'New Service',
    description: 'Service description',
    icon: '✨',
  },
  // ... more services
];
```

### Adding New Products

Edit the `products` array in `Shop.tsx`:

```typescript
const products = [
  {
    id: 1,
    name: 'Product Name',
    price: '$XX',
    category: 'Category',
    image: 'Product Image',
  },
  // ... more products
];
```

---

## Deployment

The project is ready for deployment to Manus hosting or any static hosting provider:

1. **Create Checkpoint**: Save current state via Management UI
2. **Publish**: Click "Publish" button in Management UI
3. **Custom Domain**: Configure domain in Settings panel
4. **Analytics**: Built-in analytics tracking via VITE_ANALYTICS

---

## Future Enhancements

- Add booking system with calendar integration
- Implement image gallery with lightbox
- Add testimonials/reviews section
- Create blog section for hair care tips
- Add Instagram feed integration
- Implement contact form with email notifications
- Add team member profiles
- Create service booking flow

---

## Technical Stack Summary

| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| Vite | Build tool & dev server |
| TypeScript | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| GSAP 3.15 | Advanced animations |
| Framer Motion 12 | React motion library |
| Lenis 1.3 | Smooth scrolling |
| Lucide React | Icon library |
| shadcn/ui | Component library |

---

## Support & Troubleshooting

### Animations Not Playing

- Check browser console for errors
- Verify GSAP is properly imported
- Ensure ScrollTrigger is registered: `gsap.registerPlugin(ScrollTrigger)`

### Cursor Not Showing

- Verify `Cursor` component is rendered in App.tsx
- Check z-index values (should be 9999 and 9998)
- Ensure `pointer-events-none` class is applied

### Scroll Performance Issues

- Verify Lenis is initialized via `useLenis` hook
- Check for excessive DOM elements
- Profile with Chrome DevTools Performance tab

### Image Not Loading

- Verify image URLs are correct (use provided CDN URLs)
- Check image file exists in webdev-static-assets
- Verify CORS headers if using external images

---

## License

© 2024 Asantey Hair & Braids. All rights reserved.

---

**Last Updated**: May 12, 2026
**Version**: 1.0.0
**Status**: Production Ready
