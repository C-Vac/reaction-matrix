/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Feather, Sparkles } from 'lucide-react';
import { playGoblinPop } from '../utils/goblinAudio';

export interface BogPost {
  id: string;
  author: string;
  authorTitle: string;
  avatar: string;
  timestamp: string;
  title: string;
  content: string;
  category: 'artifact' | 'bog-lore' | 'council' | 'gremlin-news';
  tags: string[];
  shinyCount: number;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (post: BogPost) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('Grog the Mud-Scraper');
  const [category, setCategory] = useState<BogPost['category']>('bog-lore');
  const [tags, setTags] = useState('shiny, mud, 4d');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    playGoblinPop();
    const newPost: BogPost = {
      id: `post-${Date.now()}`,
      author: author.trim() || 'Anonymous Bog-Lurker',
      authorTitle: 'Spore Enthusiast & Pebble Collector',
      avatar: '🧌',
      timestamp: 'Just now',
      title: title.trim(),
      content: content.trim(),
      category,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      shinyCount: Math.floor(Math.random() * 12) + 1,
    };

    onSubmit(newPost);
    onClose();
    setTitle('');
    setContent('');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-post-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#0b1711] border border-[#235338] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#1b3c29] bg-[#0e2017] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h2 id="new-post-modal-title" className="text-lg font-bold text-[#facc15] font-serif">
              New Bog Transmission
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white bg-[#142d1f] rounded-lg transition"
            aria-label="Close new post modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#a7f3d0] mb-1">
              Goblin / Human Transmitter:
            </label>
            <input
              type="text"
              required
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-[#070e0a] border border-[#1d412b] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#34d399]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a7f3d0] mb-1">
              Category:
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as BogPost['category'])}
              className="w-full text-xs px-3 py-2 bg-[#070e0a] border border-[#1d412b] rounded-xl text-white focus:outline-none focus:border-[#34d399]"
            >
              <option value="artifact">Extradimensional Human Artifact</option>
              <option value="bog-lore">Bog Lore & Slime Wisdom</option>
              <option value="council">High Bog Council Decree</option>
              <option value="gremlin-news">Gremlin Border News</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a7f3d0] mb-1">
              Transmission Subject:
            </label>
            <input
              type="text"
              required
              placeholder="e.g. My toad spoke in orthogonal angles"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-[#070e0a] border border-[#1d412b] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#34d399]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a7f3d0] mb-1">
              Message Body:
            </label>
            <textarea
              required
              rows={4}
              placeholder="Detail your discovery, shiny trinket, or complaint about 1D human culture..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-[#070e0a] border border-[#1d412b] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#34d399]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#a7f3d0] mb-1">
              Tags (comma separated):
            </label>
            <input
              type="text"
              placeholder="mud, shiny, tesseract"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-[#070e0a] border border-[#1d412b] rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#34d399]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#34d399] hover:to-[#10b981] text-neutral-950 font-bold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-lg"
          >
            <Feather className="w-4 h-4" />
            <span>Transmit to The Bog Wire</span>
          </button>
        </form>
      </div>
    </div>
  );
};
