/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HypercubeReactionButton } from './HypercubeReactionButton';
import { ReactionRecord } from '../utils/tesseractMath';
import { Copy, Check, Code, Sparkles, Terminal, BookOpen } from 'lucide-react';

export const DevDocsView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [btnSize, setBtnSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [btnVariant, setBtnVariant] = useState<'goblin' | 'compact' | 'luminous'>('goblin');
  const [showStats, setShowStats] = useState(true);
  const [customLabel, setCustomLabel] = useState('');
  const [testReactions, setTestReactions] = useState<ReactionRecord[]>([
    {
      id: 'demo-1',
      targetId: 'playground-item',
      author: 'Grog the Mud-Carver',
      timestamp: Date.now() - 3600000,
      vector: { x: 0.8, y: 0.9, z: 0.2, w: 0.7 },
      archetype: {
        id: 'radiant-bog-thief',
        name: 'Radiant Bog Arch-Thief',
        title: 'Supreme Shiny Hypnosis in Mud Nirvana',
        glyph: '🐸✨',
        goblinQuote: 'My hands are sticky, the 4th dimension bends for me alone!',
        primaryAxis: 'w',
        color: '#fbbf24',
        glowColor: 'rgba(251, 191, 36, 0.6)',
        description: 'Maximum greed, maximal bog joy.',
        vector: { x: 1, y: 1, z: 1, w: 1 },
      },
      confusionLevel: 35,
      comment: 'Replaced my company Slack upvote button with this. VP of Engineering is weeping.',
    },
  ]);

  const handleTestReact = (newRx: ReactionRecord) => {
    setTestReactions((prev) => [newRx, ...prev]);
  };

  const codeSnippet = `import { HypercubeReactionButton } from './components/HypercubeReactionButton';

export function HumanPostCard({ post }) {
  const [reactions, setReactions] = useState([]);

  return (
    <article className="post-card">
      <h3>{post.title}</h3>
      <p>{post.body}</p>

      {/* Drop-in 4D Emotional Tesseract Reaction Button */}
      <HypercubeReactionButton
        targetId={post.id}
        reactions={reactions}
        onReact={(newReaction) => setReactions(prev => [newReaction, ...prev])}
        size="${btnSize}"
        variant="${btnVariant}"
        showStats={${showStats}}
        ${customLabel ? `label="${customLabel}"` : ''}
      />
    </article>
  );
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippet).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Intro Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#0d2116] to-[#122b1d] border border-[#235338] shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1b3f2a] flex items-center justify-center text-xl">
            📦
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#facc15] font-serif">
              Drop-In React Component Specification
            </h2>
            <p className="text-xs text-[#a7f3d0]/80">
              Drop <code className="text-[#34d399] font-mono">&lt;HypercubeReactionButton /&gt;</code> into any human React app to immediately replace 1D upvotes with non-Euclidean 4D confusion.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Component Playground */}
      <div className="p-6 rounded-3xl bg-[#09150e] border border-[#1e3c2b] shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#1b3827]">
          <h3 className="text-base font-bold text-[#facc15] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#34d399]" />
            Live Component Sandbox
          </h3>
          <span className="text-xs font-mono text-[#34d399]">
            Interactive Demo
          </span>
        </div>

        {/* Sandbox Preview */}
        <div className="p-8 rounded-2xl bg-[#050b07] border border-[#173322] flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-xs text-neutral-400">
            Click the drop-in button below to trigger the 4D simulation popup:
          </p>

          <HypercubeReactionButton
            targetId="sandbox-demo-1"
            reactions={testReactions}
            onReact={handleTestReact}
            size={btnSize}
            variant={btnVariant}
            showStats={showStats}
            label={customLabel || undefined}
          />

          <span className="text-[11px] font-mono text-[#a7f3d0]/60">
            Current logged reactions: {testReactions.length}
          </span>
        </div>

        {/* Playground Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0c1a12] border border-[#1b3827]">
          {/* Size */}
          <div>
            <label className="block text-[11px] font-bold text-[#a7f3d0] mb-1.5 uppercase">
              Button Size:
            </label>
            <div className="flex gap-1">
              {(['sm', 'md', 'lg'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setBtnSize(s)}
                  className={`flex-1 py-1 text-xs rounded-lg font-mono font-bold transition ${
                    btnSize === s
                      ? 'bg-[#34d399] text-neutral-950'
                      : 'bg-[#14281e] text-[#a7f3d0] hover:text-white'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Variant */}
          <div>
            <label className="block text-[11px] font-bold text-[#a7f3d0] mb-1.5 uppercase">
              Theme Style:
            </label>
            <div className="flex gap-1">
              {(['goblin', 'compact', 'luminous'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setBtnVariant(v)}
                  className={`flex-1 py-1 text-xs rounded-lg font-mono font-bold capitalize transition ${
                    btnVariant === v
                      ? 'bg-[#34d399] text-neutral-950'
                      : 'bg-[#14281e] text-[#a7f3d0] hover:text-white'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Show Stats */}
          <div>
            <label className="block text-[11px] font-bold text-[#a7f3d0] mb-1.5 uppercase">
              Show Stats:
            </label>
            <button
              type="button"
              onClick={() => setShowStats(!showStats)}
              className={`w-full py-1 text-xs rounded-lg font-mono font-bold transition ${
                showStats
                  ? 'bg-[#10b981]/30 text-[#34d399] border border-[#10b981]'
                  : 'bg-[#14281e] text-neutral-400'
              }`}
            >
              {showStats ? 'Enabled (Count & Vector)' : 'Disabled (Pill Only)'}
            </button>
          </div>

          {/* Custom Label */}
          <div>
            <label className="block text-[11px] font-bold text-[#a7f3d0] mb-1.5 uppercase">
              Custom Label:
            </label>
            <input
              type="text"
              placeholder="e.g. Warp Reaction"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              className="w-full text-xs px-2.5 py-1 bg-[#070e09] border border-[#1b3d28] rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-[#34d399]"
            />
          </div>
        </div>
      </div>

      {/* Code Snippet Box */}
      <div className="p-6 rounded-3xl bg-[#09150e] border border-[#1e3c2b] shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#facc15] flex items-center gap-2">
            <Code className="w-4 h-4 text-[#34d399]" />
            Drop-in JSX Code Snippet
          </h3>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-[#142d1f] hover:bg-[#1f452f] text-xs font-semibold text-[#a7f3d0] flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-[#050b07] border border-[#173322] overflow-x-auto text-xs font-mono text-[#a7f3d0] leading-relaxed">
          <code>{codeSnippet}</code>
        </pre>
      </div>

      {/* Why 4D Replaces Primitive Reactions */}
      <div className="p-6 rounded-3xl bg-[#0a1610] border border-[#1e3c2b] space-y-4">
        <h3 className="text-base font-bold text-[#facc15] font-serif flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#34d399]" />
          Goblin Philosophical Manifesto: Death of the 1D Upvote
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#a7f3d0]/85 leading-relaxed">
          <div className="p-4 rounded-xl bg-[#07100b] border border-[#193625]">
            <h4 className="font-bold text-[#facc15] mb-1">Primitive Human 1D Binary ("Like"):</h4>
            <p>
              Humans click a single button (+1). Does it signify genuine appreciation? Corporate sycophancy? Pity? Mild boredom? It collapses the infinite tapestry of organic emotional space into a sad, flat 1-bit register.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-[#07100b] border border-[#193625]">
            <h4 className="font-bold text-[#34d399] mb-1">Superior Goblin 4D Orthogonality:</h4>
            <p>
              By reacting on a 4-dimensional hypercube, every reaction simultaneously calibrates Greed, Bog-Euphoria, Mischief, and Extradimensional Shiny Hypnosis. Humans become thoroughly confused, and the universe becomes mathematically honest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
