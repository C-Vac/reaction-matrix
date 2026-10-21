import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ReactionMatrixButton, ReactionMatrixPanel } from '@goblinlife/reaction-matrix';
import {
  EMPTY_SUMMARY,
  applyReaction,
  type ReactionDraft,
  type ReactionSummary,
} from '@goblinlife/reaction-matrix/math';
import '@goblinlife/reaction-matrix/styles.css';
import './theme.css';

/** In-memory stand-in for a database: one reaction per person per post, replaced on revision. */
interface Entry {
  summary: ReactionSummary;
  mine: ReactionDraft | null;
}

const POSTS = [
  { id: 'a', title: 'City council votes to rename the river', body: 'The river has not been consulted.' },
  { id: 'b', title: 'Local man finally finishes the puzzle', body: 'Two pieces are from a different puzzle.' },
];

function Post({ id, title, body }: (typeof POSTS)[number]) {
  const [entry, setEntry] = useState<Entry>({ summary: EMPTY_SUMMARY, mine: null });

  const onReact = (draft: ReactionDraft) =>
    setEntry((e) => ({ summary: applyReaction(e.summary, draft, e.mine), mine: draft }));

  return (
    <article className="card">
      <h2>{title}</h2>
      <p>{body}</p>
      <ReactionMatrixButton
        targetId={id}
        targetLabel={title}
        summary={entry.summary}
        mine={entry.mine}
        onReact={onReact}
      />
    </article>
  );
}

function App() {
  return (
    <main>
      <h1>reaction-matrix</h1>
      <p className="lede">The button, in a feed. Reactions live in memory and reset on reload.</p>
      {POSTS.map((p) => (
        <Post key={p.id} {...p} />
      ))}
      <h2>Inline panel</h2>
      <p className="lede">The same picker with no button or dialog, for embedding in a page.</p>
      <div className="card">
        <ReactionMatrixPanel onLock={(draft) => console.log('locked', draft)} />
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
