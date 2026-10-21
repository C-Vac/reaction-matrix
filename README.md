# reaction-matrix

A hypercube of reactions. One drop-in button opens a draggable 4D figure; the person moves a point
through four axes and locks in a vector. It replaces upvotes and emoji reactions.

```tsx
import { ReactionMatrixButton } from '@goblinlife/reaction-matrix';
import '@goblinlife/reaction-matrix/styles.css';

<ReactionMatrixButton
  targetId="post-123"
  summary={summary}          // { count, sum, archetypeCounts }
  mine={myReaction}          // optional: opens in revise mode
  onReact={(draft) => save(draft)}
/>
```

## Model

Four axes, each from -1 to +1:

| Axis | - | + |
|---|---|---|
| x Appetite | Spite | Greed |
| y Weather | Dread | Ease |
| z Conduct | Withdrawn | Mischief |
| w Trance | Feral | Rapt |

The 16 corners are the 16 named reactions (Rapture, Schadenfreude, Avarice, ... Numbness). A point
between corners reads as its nearest corner plus an intensity; near the origin it reads "Unmoved".

A reaction is `{ vector, archetypeId, disorientation }`. Aggregates are running sums
(`ReactionSummary`), so a reaction can be added or replaced in O(1). `@goblinlife/reaction-matrix/math`
is pure TypeScript with no React or DOM, and is what servers should use to validate
(`sanitizeDraft`) and aggregate (`applyReaction`).

## Theming

Plain CSS. Set `--rm-surface`, `--rm-line`, `--rm-ink`, `--rm-muted`, `--rm-rapt`,
`--rm-feral`, `--rm-point`, `--rm-on-accent`, `--rm-font`, `--rm-font-display`, `--rm-font-mono`.
Every property has a fallback.

## Tests

`src/math.test.ts` uses vitest. In the goblinlife monorepo it runs with the root `pnpm test`.
