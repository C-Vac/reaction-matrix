# reaction-matrix

A hypercube of reactions. Each of its 16 corners is a named reaction with an emoji. One drop-in row
shows a still of the consensus figure (the hypercube bent toward what people picked), a tally chip per
emoji, and a picker: one tap reacts. The still opens a dialog with the spinning figure, where sliders
set how strongly (never which reaction).

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

The 16 corners are the 16 named reactions (Rapture 🤩, Schadenfreude 😈, ... Numbness 😶); the origin
is Unmoved 😐. People pick the emoji; `cornerVector(id, intensities)` places the point in that corner
at the slider intensities (0.2 to 1 per axis), so the sliders can never change the reaction. Eight
reactions are featured (`FEATURED_ARCHETYPE_IDS`); the rest sit behind "More".

`consensusVertices(summary)` bends the figure: each corner scales with the square root of its share of
the leader's votes (0.55 for none, 1 for the leader), and Unmoved votes shrink the whole figure.
`ConsensusSnapshot` draws a still of it on mount.

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
