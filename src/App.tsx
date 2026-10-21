/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * GoblinLife.org - The Public Goblin Portal & 4D Emotional Hypercube
 */

import React, { useState } from 'react';
import {
  HypercubeReactionButton,
} from './components/HypercubeReactionButton';
import { TesseractSimulation } from './components/TesseractSimulation';
import { VectorManifoldView } from './components/VectorManifoldView';
import { DevDocsView } from './components/DevDocsView';
import { CreatePostModal, BogPost } from './components/CreatePostModal';
import {
  ReactionRecord,
  Vector4D,
  classifyEmotionalVector,
  EmotionalArchetype,
  GOBLIN_ARCHETYPES,
} from './utils/tesseractMath';
import {
  setGoblinAudioMuted,
  getGoblinAudioMuted,
  playGoblinPop,
} from './utils/goblinAudio';
import {
  Sparkles,
  Compass,
  Layers,
  Radio,
  Volume2,
  VolumeX,
  PlusCircle,
  Flame,
  MessageSquare,
  Search,
  Filter,
  Code,
  ShieldAlert,
} from 'lucide-react';

// Initial seed posts for The Bog Wire
const INITIAL_POSTS: BogPost[] = [
  {
    id: 'post-1',
    author: 'Krag the Compost Oracle',
    authorTitle: 'High Priest of Decomposition',
    avatar: '🧙‍♂️',
    timestamp: '18 minutes ago',
    title: 'Found a glowing flat rectangular human stone (iPhone 6) in the peat bog',
    content:
      'Brothers and sisters of the bog: I dug up a smooth black mirror left by human campers. When poked with a wet stick, it shines with cold moonlight and displays tiny square runes. It does not rot. It does not attract beetles. I tried to feed it a worm, but it refused. Rate this artifact with your 4D emotional vector.',
    category: 'artifact',
    tags: ['human-trash', 'shiny-glass', 'non-edible', 'compost'],
    shinyCount: 42,
  },
  {
    id: 'post-2',
    author: 'Snot-Weaver Grog',
    authorTitle: 'Non-Euclidean Tunnel Surveyor',
    avatar: '🧌',
    timestamp: '1 hour ago',
    title: 'Humans only possess 1-dimensional "Upvotes". We must pity them.',
    content:
      'A human tourist dropped an ancient parchment on "Social Media UX". They only have two states: Thumb Up (+1) or Thumb Down (-1)! How can a soul express intense Greed (+X) paired with deep Mud-Bliss (+Y) while orchestrating malicious pebble Mischief (+Z) and vibrating into 4th-dimensional Shiny Hypnosis (+W)? The human mind is flat like stale ditch water.',
    category: 'bog-lore',
    tags: ['philosophy', 'human-primitives', 'tesseract-superiority'],
    shinyCount: 97,
  },
  {
    id: 'post-3',
    author: 'Chief Bog-Mother Morgath',
    authorTitle: 'Regent of the Great Slime Sinkhole',
    avatar: '👑',
    timestamp: '3 hours ago',
    title: 'High Bog Council Decree #884: Mandatory shiny spoon redistribution',
    content:
      'Any goblin caught hoarding more than sixty-four (64) brass spoons without registering them on the W-axis ledger will have their burrow flooded with lukewarm turnip broth. Remember: all shiny loot belongs spiritually to the Bog, even if you keep it hidden under your sleeping moss.',
    category: 'council',
    tags: ['council-decree', 'spoons', 'hoarding', 'taxation'],
    shinyCount: 61,
  },
  {
    id: 'post-4',
    author: 'Snaggle & Spite',
    authorTitle: 'Gremlin Demilitarized Zone Ambassadors',
    avatar: '👺',
    timestamp: '5 hours ago',
    title: 'The Great Goblin-Gremlin Truce of Bog Brook #2 holds firm',
    content:
      'After five hours of negotiation, both clans agreed: we will stop stealing each other’s shiny beetles and instead coordinate simultaneous midnight rock-throwing at human luxury RVs parked near the forest perimeter. Unity through shared mischief!',
    category: 'gremlin-news',
    tags: ['gremlins', 'diplomacy', 'pebbles', 'mischief'],
    shinyCount: 124,
  },
];

// Initial seed reactions distributed across posts
const INITIAL_REACTIONS: Record<string, ReactionRecord[]> = {
  'post-1': [
    {
      id: 'rx-101',
      targetId: 'post-1',
      author: 'Glint-Eyed Fester',
      timestamp: Date.now() - 900000,
      vector: { x: 0.9, y: 0.8, z: 0.3, w: 0.95 },
      archetype: GOBLIN_ARCHETYPES['1,1,1,1'],
      confusionLevel: 28,
      comment: 'It shines like gold! I want to hoard it under my belly!',
    },
    {
      id: 'rx-102',
      targetId: 'post-1',
      author: 'Worm-Taster Skrit',
      timestamp: Date.now() - 600000,
      vector: { x: -0.6, y: -0.8, z: 0.1, w: -0.5 },
      archetype: GOBLIN_ARCHETYPES['-1,-1,-1,-1'],
      confusionLevel: 62,
      comment: 'Glass cannot be digested. Deep mold dread.',
    },
    {
      id: 'rx-103',
      targetId: 'post-1',
      author: 'Blink-Goblin Zib',
      timestamp: Date.now() - 300000,
      vector: { x: 0.4, y: 0.6, z: 0.8, w: 0.7 },
      archetype: GOBLIN_ARCHETYPES['1,1,1,1'],
      confusionLevel: 44,
      comment: 'I poked it and my finger slipped through 4-space!',
    },
  ],
  'post-2': [
    {
      id: 'rx-201',
      targetId: 'post-2',
      author: 'Snot-Weaver Grog',
      timestamp: Date.now() - 3200000,
      vector: { x: -0.8, y: 0.9, z: 0.9, w: 0.85 },
      archetype: GOBLIN_ARCHETYPES['-1,1,1,1'],
      confusionLevel: 15,
      comment: '1D binary likes are an insult to multi-axis consciousness!',
    },
    {
      id: 'rx-202',
      targetId: 'post-2',
      author: 'Tesseract Researcher Bob',
      timestamp: Date.now() - 2500000,
      vector: { x: 0.7, y: 0.5, z: -0.3, w: 0.9 },
      archetype: GOBLIN_ARCHETYPES['1,1,-1,1'],
      confusionLevel: 78,
      comment: 'My brain is rotating along the XW plane just reading this.',
    },
  ],
  'post-3': [
    {
      id: 'rx-301',
      targetId: 'post-3',
      author: 'Spoon-Baron Grim',
      timestamp: Date.now() - 8000000,
      vector: { x: 1.0, y: -0.7, z: -0.9, w: 0.4 },
      archetype: GOBLIN_ARCHETYPES['1,-1,-1,1'],
      confusionLevel: 55,
      comment: 'You will never find my secret hollow oak tree of spoons!',
    },
  ],
  'post-4': [
    {
      id: 'rx-401',
      targetId: 'post-4',
      author: 'Pebble-Sniper Yarg',
      timestamp: Date.now() - 14000000,
      vector: { x: -0.7, y: 0.85, z: 0.95, w: -0.6 },
      archetype: GOBLIN_ARCHETYPES['-1,1,1,-1'],
      confusionLevel: 30,
      comment: 'The sound of pebbles on RV metal makes my heart sing!',
    },
  ],
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'wire' | 'observatory' | 'manifold' | 'docs'>('wire');
  const [posts, setPosts] = useState<BogPost[]>(INITIAL_POSTS);
  const [reactionsMap, setReactionsMap] = useState<Record<string, ReactionRecord[]>>(INITIAL_REACTIONS);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(() => getGoblinAudioMuted());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Observatory state
  const [observatoryVector, setObservatoryVector] = useState<Vector4D>({
    x: 0.7,
    y: 0.85,
    z: 0.3,
    w: 0.6,
  });
  const [observatoryArchetype, setObservatoryArchetype] = useState<EmotionalArchetype>(() =>
    classifyEmotionalVector({ x: 0.7, y: 0.85, z: 0.3, w: 0.6 })
  );
  const [observatoryConfusion, setObservatoryConfusion] = useState<number>(50);

  // Toggle Sound FX
  const toggleAudio = () => {
    const next = !isAudioMuted;
    setIsAudioMuted(next);
    setGoblinAudioMuted(next);
    if (!next) {
      playGoblinPop();
    }
  };

  // Add new reaction to a post
  const handleAddReaction = (reaction: ReactionRecord) => {
    setReactionsMap((prev) => {
      const existing = prev[reaction.targetId] || [];
      return {
        ...prev,
        [reaction.targetId]: [reaction, ...existing],
      };
    });
  };

  // Handle post creation
  const handleCreatePost = (newPost: BogPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setReactionsMap((prev) => ({
      ...prev,
      [newPost.id]: [],
    }));
  };

  // Handle shiny up-tick
  const handleGiveShiny = (postId: string) => {
    playGoblinPop();
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, shinyCount: p.shinyCount + 1 } : p))
    );
  };

  // Gather all reactions for the global manifold
  const allReactions = Object.values(reactionsMap).flat();

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesCat = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-[#070d0a] text-[#d1fae5] flex flex-col font-sans selection:bg-[#34d399]/30 selection:text-[#a7f3d0]">
      {/* Top Banner & Goblin Status Ticker */}
      <header className="border-b border-[#1b3826] bg-[#09150e]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#047857] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              🧌
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg sm:text-xl tracking-tight text-[#facc15]">
                  GoblinLife<span className="text-[#34d399]">.org</span>
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#142d1f] text-[#34d399] border border-[#235338] hidden sm:inline-block">
                  v4.0 4D-HYPERCUBE
                </span>
              </div>
              <p className="text-[11px] text-[#a7f3d0]/75 hidden sm:block">
                The Underground Sanctuary for Extradimensional Moods & Non-Euclidean Reactions
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleAudio}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-[#102318] hover:bg-[#163323] border border-[#1e422f] text-xs font-semibold text-[#a7f3d0] flex items-center gap-1.5 transition cursor-pointer"
              title={isAudioMuted ? 'Unmute procedural 4D audio' : 'Mute audio'}
              aria-label={isAudioMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isAudioMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-neutral-400" />
                  <span className="hidden md:inline text-neutral-400">Audio Muted</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-[#34d399]" />
                  <span className="hidden md:inline text-[#34d399]">4D Chimes On</span>
                </>
              )}
            </button>

            {/* New Post Button */}
            <button
              type="button"
              onClick={() => {
                playGoblinPop();
                setIsCreateModalOpen(true);
              }}
              className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#fbbf24] to-[#f59e0b] hover:from-[#facc15] hover:to-[#fbbf24] text-neutral-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-[#fbbf24]/15 cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-neutral-950" />
              <span>New Transmission</span>
            </button>
          </div>
        </div>

        {/* Dynamic Telemetry Subheader */}
        <div className="border-t border-[#14281e] bg-[#060c09] px-4 py-1.5 text-[11px] font-mono text-[#a7f3d0]/70 flex items-center justify-between overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Bog Viscosity: <strong className="text-white">92.4% Moist</strong>
            </span>
            <span className="text-[#1e3c2b]">|</span>
            <span>
              4D Vectors Locked: <strong className="text-[#facc15]">{allReactions.length}</strong>
            </span>
            <span className="text-[#1e3c2b] hidden md:inline">|</span>
            <span className="hidden md:inline">
              Human Prefrontal Disorientation: <strong className="text-emerald-400">OPTIMAL</strong>
            </span>
          </div>

          <span className="text-[#86efac]/80 hidden lg:inline">
            "A single upvote is a cage for the goblin spirit" — High Council
          </span>
        </div>

        {/* Main Tab Navigation */}
        <nav className="border-t border-[#162d20] bg-[#08120b] px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto py-2">
            <button
              type="button"
              onClick={() => setActiveTab('wire')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'wire'
                  ? 'bg-[#142e20] text-[#facc15] border border-[#2a5d40] shadow-sm'
                  : 'text-[#a7f3d0]/75 hover:text-white hover:bg-[#0e2016]'
              }`}
            >
              <Radio className="w-4 h-4 text-[#34d399]" />
              <span>The Bog Wire (Feed)</span>
              <span className="px-1.5 py-0.2 rounded-md bg-[#09150e] text-[10px] text-[#86efac]">
                {posts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('observatory')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'observatory'
                  ? 'bg-[#142e20] text-[#facc15] border border-[#2a5d40] shadow-sm'
                  : 'text-[#a7f3d0]/75 hover:text-white hover:bg-[#0e2016]'
              }`}
            >
              <Compass className="w-4 h-4 text-[#34d399]" />
              <span>Hypercube Observatory</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('manifold')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'manifold'
                  ? 'bg-[#142e20] text-[#facc15] border border-[#2a5d40] shadow-sm'
                  : 'text-[#a7f3d0]/75 hover:text-white hover:bg-[#0e2016]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#34d399]" />
              <span>The Vector Manifold</span>
              <span className="px-1.5 py-0.2 rounded-md bg-[#09150e] text-[10px] text-[#facc15]">
                {allReactions.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('docs')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${
                activeTab === 'docs'
                  ? 'bg-[#142e20] text-[#facc15] border border-[#2a5d40] shadow-sm'
                  : 'text-[#a7f3d0]/75 hover:text-white hover:bg-[#0e2016]'
              }`}
            >
              <Code className="w-4 h-4 text-[#34d399]" />
              <span>Drop-in Component Guide</span>
            </button>
          </div>
        </nav>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* VIEW 1: The Bog Wire Community Feed */}
        {activeTab === 'wire' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Feed Main Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Filter & Search Bar */}
              <div className="p-4 rounded-2xl bg-[#0a1711] border border-[#1e3c2b] flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Search transmissions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-[#060e0a] border border-[#193625] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#34d399]"
                  />
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase hidden sm:inline">
                    Tag:
                  </span>
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'artifact', label: 'Artifacts' },
                    { id: 'bog-lore', label: 'Bog Lore' },
                    { id: 'council', label: 'Decrees' },
                    { id: 'gremlin-news', label: 'Gremlin' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3 py-1 text-xs rounded-lg font-semibold transition cursor-pointer whitespace-nowrap ${
                        selectedCategory === cat.id
                          ? 'bg-[#34d399] text-neutral-950'
                          : 'bg-[#12241a] text-[#a7f3d0] hover:text-white hover:bg-[#1a3827]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed Items */}
              {filteredPosts.length === 0 ? (
                <div className="p-12 text-center bg-[#0a1711] rounded-3xl border border-[#1e3c2b]">
                  <span className="text-4xl block mb-2">🍄</span>
                  <h3 className="text-base font-bold text-[#facc15]">No transmissions found</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Try another search phrase or broadcast a fresh transmission to the Bog Council.
                  </p>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const postReactions = reactionsMap[post.id] || [];

                  return (
                    <article
                      key={post.id}
                      className="p-5 sm:p-6 rounded-3xl bg-[#0a1610] border border-[#1f422e] hover:border-[#2d6446] transition-all duration-200 shadow-xl space-y-4"
                    >
                      {/* Post Author & Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl p-1.5 rounded-2xl bg-[#12281c] border border-[#244f36]">
                            {post.avatar}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">
                                {post.author}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#142e20] text-[#34d399] border border-[#214c33] font-mono">
                                {post.category}
                              </span>
                            </div>
                            <span className="text-xs text-[#a7f3d0]/60 block">
                              {post.authorTitle} · {post.timestamp}
                            </span>
                          </div>
                        </div>

                        {/* Shiny Trinket Up-tick */}
                        <button
                          type="button"
                          onClick={() => handleGiveShiny(post.id)}
                          className="px-2.5 py-1 rounded-xl bg-[#12281c] hover:bg-[#1c3e2c] border border-[#244f36] text-xs font-semibold text-[#facc15] flex items-center gap-1.5 transition cursor-pointer"
                          title="Offer a shiny pebble to the author"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{post.shinyCount} Shiny</span>
                        </button>
                      </div>

                      {/* Content */}
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#facc15] font-serif leading-snug">
                          {post.title}
                        </h2>
                        <p className="mt-2 text-xs sm:text-sm text-[#d1fae5]/90 leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#08120b] border border-[#173322] text-[#86efac]/70"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>

                      {/* THE REACTION BAR: Featuring the Drop-in 4D Hypercube Button! */}
                      <div className="pt-3 border-t border-[#173623] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {/* HERE IS THE SINGLE REACT COMPONENT AS REQUESTED! */}
                          <HypercubeReactionButton
                            targetId={post.id}
                            reactions={postReactions}
                            onReact={handleAddReaction}
                            size="md"
                            variant="goblin"
                          />
                        </div>

                        {/* Micro Summary of Latest Reaction */}
                        {postReactions.length > 0 && (
                          <div className="text-right text-[11px] text-[#a7f3d0]/80">
                            <span className="text-neutral-400">Latest vector: </span>
                            <span className="text-[#facc15] font-semibold">
                              {postReactions[0].archetype.name}
                            </span>
                            <span className="text-neutral-400 ml-1">
                              by {postReactions[0].author}
                            </span>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Sidebar Column: Goblin Lore & 4D Explainer */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Daily Goblin Riddle */}
              <div className="p-5 rounded-3xl bg-[#0c1a12] border border-[#1e3c2b] shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#facc15]">
                  <span>🍄</span>
                  <h4>Bog Council Riddle of the Day</h4>
                </div>
                <p className="text-xs text-[#a7f3d0]/85 italic leading-relaxed">
                  "If a goblin steals a shiny coin at coordinates (1, 1, 1, 1), and rotates it 90 degrees into the XW hyper-plane, does the human guard still possess the coin in 3-space?"
                </p>
                <div className="p-2.5 rounded-xl bg-[#070e0a] border border-[#193625] text-[11px] text-[#34d399]">
                  Answer: The human guard is weeping in the parking lot because the coin exists orthogonally.
                </div>
              </div>

              {/* 4D Emotional Axis Key */}
              <div className="p-5 rounded-3xl bg-[#0c1a12] border border-[#1e3c2b] shadow-xl space-y-3">
                <h4 className="text-sm font-bold text-[#facc15] flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#34d399]" />
                  The 4 Non-Euclidean Axes
                </h4>
                <ul className="text-xs space-y-2.5 text-[#a7f3d0]/85">
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#f59e0b]">X:</span>
                    <div>
                      <strong>Spite (-1) vs Greed (+1)</strong>
                      <p className="text-[10px] text-neutral-400">Do you hoard the gold or poison the well?</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#10b981]">Y:</span>
                    <div>
                      <strong>Mold Dread (-1) vs Bog Bliss (+1)</strong>
                      <p className="text-[10px] text-neutral-400">From existential decay to warm mud nirvana.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#38bdf8]">Z:</span>
                    <div>
                      <strong>Burrow Solitude (-1) vs Mischief (+1)</strong>
                      <p className="text-[10px] text-neutral-400">Hiding with your pebbles vs pelting strangers.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#fbbf24]">W:</span>
                    <div>
                      <strong>Feral Hiss (-1) vs Shiny Hypnosis (+1)</strong>
                      <p className="text-[10px] text-neutral-400">The 4th dimension: screeching vs transcendent glint.</p>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Council Notice */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-[#12281c] to-[#0c1c13] border border-[#255237] text-xs text-[#a7f3d0] space-y-2">
                <span className="font-bold text-[#facc15] flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Warning to Human Observers:
                </span>
                <p className="text-[11px] leading-relaxed text-[#d1fae5]/80">
                  Attempting to flatten GoblinLife.org reactions into a simple "Like" count will result in an immediate W-axis curse placed upon your router.
                </p>
              </div>
            </aside>
          </div>
        )}

        {/* VIEW 2: Full Observatory View */}
        {activeTab === 'observatory' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl bg-[#0c1a12] border border-[#1e3c2b] shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1b3827]">
                <div>
                  <h2 className="text-xl font-bold text-[#facc15] font-serif flex items-center gap-2">
                    <Compass className="w-5 h-5 text-[#34d399]" />
                    Hypercube Laboratory & Vector Calibration
                  </h2>
                  <p className="text-xs text-[#a7f3d0]/80">
                    Interact directly with the 4D Tesseract to study the 16 emotional vertices and hyper-rotations.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{observatoryArchetype.glyph}</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#facc15] block">
                      {observatoryArchetype.name}
                    </span>
                    <span className="text-[10px] font-mono text-[#34d399]">
                      {observatoryConfusion}% confusion index
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <TesseractSimulation
                  initialVector={observatoryVector}
                  onVectorChange={(vec, arch, conf) => {
                    setObservatoryVector(vec);
                    setObservatoryArchetype(arch);
                    setObservatoryConfusion(conf);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Vector Manifold */}
        {activeTab === 'manifold' && (
          <VectorManifoldView reactions={allReactions} />
        )}

        {/* VIEW 4: Developer Documentation */}
        {activeTab === 'docs' && <DevDocsView />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#162d20] bg-[#050b07] py-8 text-xs text-[#a7f3d0]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧌</span>
            <span>GoblinLife.org — Sanctioned by the High Bog Council</span>
          </div>
          <p className="font-mono text-[11px]">
            Rendered in 4 Spatial & Emotional Dimensions. Humans, please do not panic.
          </p>
        </div>
      </footer>

      {/* New Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
