## Monorepo structure
- apps/marketing  — Next.js e-commerce frontend
- apps/backend    — API server
- apps/cms        — Content management

## Shared rules
- Use pnpm workspaces
- Commit format: conventional commits (feat:, fix:, chore:)
- Never import across apps directly — use packages/* instead

## apps/marketing — Animation (Motion for React)

When writing animations, always use `motion/react` (not `framer-motion`).
Reference docs: https://motion.dev/docs/react

### Key imports
- `import { motion, AnimatePresence } from "motion/react"`
- `import { useScroll, useTransform, useSpring, useInView } from "motion/react"`
- `import { MotionConfig } from "motion/react"`

---

### Next.js App Router Rules (15+)

**Critical:** motion components use hooks internally and MUST be Client Components.
Always add `"use client"` at the top of any file using motion.

```tsx
"use client"
import { motion } from "motion/react"
```

Never use motion directly in Server Components (layout.tsx, page.tsx) unless
they delegate animation to a child client component. Pattern:
// app/page.tsx  ← Server Component (no "use client")
import { HeroSection } from "@/components/HeroSection"
export default function Page() {
return <HeroSection />
}
// components/HeroSection.tsx  ← Client Component
"use client"
import { motion } from "motion/react"
export function HeroSection() {
return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
}

---

### Performance — Hardware-Accelerated Properties Only

Prefer these (compositor-only, no layout/paint):
- `x`, `y`, `z` (not `left`, `top`, `margin`)
- `scale`, `scaleX`, `scaleY`
- `rotate`, `rotateX`, `rotateY`, `rotateZ`
- `opacity`
- `skewX`, `skewY`

Never animate these (triggers layout recalculation):
- `width`, `height` (use `scaleX`/`scaleY` instead)
- `top`, `left`, `right`, `bottom` (use `x`/`y` instead)
- `margin`, `padding`, `border`
- CSS variables (always triggers paint)

---

### Enter animations

```tsx
"use client"
import { motion } from "motion/react"

// Fade in on mount
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: "easeOut" }}
/>

// Spring physics (default for transforms)
<motion.button
  initial={{ scale: 0 }}
  animate={{ scale: 1 }}
  transition={{ type: "spring", stiffness: 300, damping: 20 }}
/>
```

---

### Hover & Tap Gestures

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: "spring", stiffness: 400, damping: 17 }}
/>
```

---

### Exit Animations (AnimatePresence)

AnimatePresence MUST wrap the conditional. Direct children MUST have a `key` prop.

```tsx
"use client"
import { motion, AnimatePresence } from "motion/react"

// Toggle visibility
<AnimatePresence>
  {isOpen && (
    <motion.div
      key="modal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    />
  )}
</AnimatePresence>

// Route/page transitions — wrap in layout.tsx child
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  />
</AnimatePresence>
```

---

### Scroll-Triggered Animations

```tsx
"use client"
import { motion } from "motion/react"

// Animate once when element enters viewport
<motion.section
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.5 }}
/>
```

---

### Scroll-Linked Animations (Parallax / Progress)

```tsx
"use client"
import { useScroll, useTransform, motion } from "motion/react"
import { useRef } from "react"

function ParallaxSection() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"])

  return (
    <div ref={ref} style={{ overflow: "hidden" }}>
      <motion.img style={{ y }} src="/hero.jpg" alt="" />
    </div>
  )
}
```

---

### Variants (for orchestrating multiple elements)

```tsx
"use client"
import { motion } from "motion/react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

function AnimatedList({ items }) {
  return (
    <motion.ul variants={container} initial="hidden" animate="show">
      {items.map(i => (
        <motion.li key={i.id} variants={item}>{i.label}</motion.li>
      ))}
    </motion.ul>
  )
}
```

---

### Global Config with MotionConfig

Wrap in a Client Component provider, not in layout.tsx directly.

```tsx
// components/providers.tsx
"use client"
import { MotionConfig } from "motion/react"

export function Providers({ children }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.3 }}>
      {children}
    </MotionConfig>
  )
}

// app/layout.tsx
import { Providers } from "@/components/providers"
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

---

### Accessibility

Always respect reduced motion. MotionConfig `reducedMotion="user"` handles this
automatically by reading the OS `prefers-reduced-motion` setting.
Never hardcode animations without this safeguard in place.

---

### Bundle size

For production, prefer named imports to enable tree-shaking:
```tsx
import { motion } from "motion/react"         // full bundle
import * as m from "motion/react-m"           // smaller — use with LazyMotion
```

For large apps, use LazyMotion to defer loading the animation engine:
```tsx
import { LazyMotion, domAnimation, m } from "motion/react"

<LazyMotion features={domAnimation}>
  <m.div animate={{ opacity: 1 }} />
</LazyMotion>
```