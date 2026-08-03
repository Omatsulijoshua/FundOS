# @fundos/ui - FundOS Design System

This package contains the design system tokens, CSS utilities, global stylesheets, and reusable React components for FundOS applications.

---

## 🎨 Color Palette & Tokens (Premium Fintech Theme)

The system defaults to a **premium dark tech aesthetic** (similar to Stripe, Binance, and Bloomberg).

### CSS Variables Mapping

| Token | Class | Dark Default (HSL) | Vibe / Purpose |
|---|---|---|---|
| `--background` | `bg-background` | `240 10% 3.9%` | Zinc-950 deep dark background |
| `--foreground` | `text-foreground` | `0 0% 98%` | Bright off-white text |
| `--card` | `bg-card` | `240 10% 5.9%` | Zinc-900 elevated card backing |
| `--primary` | `bg-primary` | `221.2 83.2% 53.3%` | Stripe/Fintech blue accents |
| `--secondary` | `bg-secondary` | `240 3.7% 15.9%` | Dark slate outline highlights |
| `--success` | `text-emerald-400` | `142.1 76.2% 36.3%` | Green profit/passing indicator |
| `--destructive`| `text-red-400` | `0 62.8% 30.6%` | Red loss/violation indicator |
| `--border` | `border-border` | `240 3.7% 15.9%` | Subtle container outline separators |

---

## 🔤 Typography & Font Rules

We import and use two fonts via Google Fonts:
1. **Inter**: Used for body copy, paragraphs, table cells, and input values. Optimized for readability of text and financial values.
2. **Outfit**: Used for headings (`h1` through `h6`). Elegant geometric sans-serif that projects a modern premium brand appearance.

---

## 🏗️ Reusable Components

All components support standard utility classes via the `cn()` utility wrapper.

### 1. Button (`<Button>`)
Supports premium styles and glows:
```tsx
import { Button } from "@fundos/ui";

// Variants
<Button variant="default">Primary Blue</Button>
<Button variant="secondary">Slate Button</Button>
<Button variant="outline">Border Outline</Button>
<Button variant="destructive">Alert Red</Button>
<Button variant="ghost">Ghost hover</Button>
<Button variant="glass">Glassmorphism card button</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Normal</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### 2. Card (`<Card>`)
Used for dashboard widgets and trading panels:
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@fundos/ui";

<Card glass glow>
  <CardHeader>
    <CardTitle>Trading Account Balance</CardTitle>
    <CardDescription>Daily target stats</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">$10,245.50</div>
  </CardContent>
  <CardFooter>
    <span className="text-xs text-emerald-400">+2.45% past 24h</span>
  </CardFooter>
</Card>
```

### 3. Badge (`<Badge>`)
Visual status highlights:
```tsx
import { Badge } from "@fundos/ui";

<Badge variant="default">Processing</Badge>
<Badge variant="success">Passed</Badge>
<Badge variant="destructive">Violated</Badge>
<Badge variant="warning">Drawing Down</Badge>
```

---

## 🚀 Consumption & Configuration

To use these design rules in any workspace app:

1. Add `@fundos/ui` as a dependency.
2. Extend `tailwind.config.js` with the preset:
   ```javascript
   module.exports = {
     presets: [require("@fundos/ui/tailwind.preset")],
     content: [
       "./src/**/*.{ts,tsx}",
       "../../packages/ui/src/**/*.{ts,tsx}"
     ],
   };
   ```
3. Import the global CSS stylesheet at your application root:
   ```javascript
   import "@fundos/ui/src/global.css";
   ```
