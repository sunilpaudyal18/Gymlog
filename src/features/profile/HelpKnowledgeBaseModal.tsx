import React, { useState } from 'react';
import {
  HelpCircle,
  BookOpen,
  WifiOff,
  Dumbbell,
  Timer,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';

export interface HelpKnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  id: string;
  question: string;
  category: string;
  icon: LucideIcon;
  answer: string;
  bullets?: string[];
}

export const HelpKnowledgeBaseModal: React.FC<HelpKnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>('philosophy');
  const [searchQuery, setSearchQuery] = useState('');

  const faqs: FAQItem[] = [
    {
      id: 'philosophy',
      category: 'Philosophy',
      icon: Sparkles,
      question: 'What is the GYM Philosophy?',
      answer:
        'GYM is built on the core principle: "Less typing. Less thinking. More training." The app prioritizes 1-tap interactions, automatic rest timers, intelligent plate rounding, and distraction-free logging so you can focus 100% of your energy on lifting.',
      bullets: [
        'Automatic weight pre-fills from previous session',
        'Hands-free audio chimes and haptic rest alerts',
        'Rapid set check-offs with zero clutter',
      ],
    },
    {
      id: 'offline',
      category: 'Data & Sync',
      icon: WifiOff,
      question: 'How does Offline Logging work?',
      answer:
        'All routines, exercises, history logs, and personal records are stored in high-performance local browser storage. You can log workouts in gym basements with zero internet connectivity. As soon as connectivity returns, your data automatically validates and updates seamlessly.',
      bullets: [
        'Zero network latency during training',
        'Automatic local persistence across sessions',
        'Safe manual cloud sync trigger available anytime',
      ],
    },
    {
      id: 'custom-exercise',
      category: 'Exercises',
      icon: Dumbbell,
      question: 'How do I create and customize exercises?',
      answer:
        'Navigate to the Exercises library and tap the "+" button in the top right. You can define custom movement names, primary target muscles, equipment (Barbell, Dumbbells, Machine, Cables), and default rep/weight parameters.',
      bullets: [
        'Assign to any primary muscle group',
        'Set default target sets, reps, and load',
        'Instantly add to your routine templates',
      ],
    },
    {
      id: 'timer-settings',
      category: 'Timer',
      icon: Timer,
      question: 'How do rest timers and audio cues work?',
      answer:
        'When you complete a set, the floating rest timer can automatically start counting down. You can customize default recovery intervals (60s, 90s, 120s, 180s) or adjust them on the fly with the floating timer sheet.',
      bullets: [
        'Crisp dual-tone audio chime on timer expiry',
        'Haptic vibration pattern on mobile devices',
        'Quick +30s / -15s timer adjustment pills',
      ],
    },
    {
      id: 'privacy',
      category: 'Privacy',
      icon: ShieldCheck,
      question: 'Where is my workout data stored?',
      answer:
        'Your workout telemetry and personal profile remain completely private. No telemetry is sold or shared with third parties. You have complete control to export or clear your workout logs anytime.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & Knowledge Base" type="sheet">
      <div className="space-y-4 select-none pt-1 pb-4">
        {/* Search FAQ */}
        <div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides & troubleshooting..."
            className="w-full bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl px-4 py-3 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#008B8E] shadow-sm"
          />
        </div>

        {/* Quick Help Categories */}
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            const IconComponent = faq.icon;

            return (
              <div
                key={faq.id}
                className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-[#008B8E] bg-[#008B8E]/5 shadow-sm'
                    : 'border-[#CBD5E1] bg-white hover:border-[#94A3B8]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full p-4 flex items-center justify-between text-left cursor-pointer gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isExpanded
                          ? 'bg-[#008B8E] text-white'
                          : 'bg-[#F1F5F9] text-[#008B8E] border border-[#CBD5E1]'
                      }`}
                    >
                      <IconComponent size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#008B8E] block mb-0.5">
                        {faq.category}
                      </span>
                      <h4 className="text-sm font-bold text-[#0F172A] tracking-tight">
                        {faq.question}
                      </h4>
                    </div>
                  </div>
                  <div className="text-[#64748B] shrink-0">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#334155] leading-relaxed border-t border-[#CBD5E1]/50 space-y-2 animate-fade-in">
                    <p>{faq.answer}</p>
                    {faq.bullets && faq.bullets.length > 0 && (
                      <ul className="space-y-1.5 pt-1 pl-2">
                        {faq.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#008B8E] shrink-0 mt-1.5" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Footer Banner */}
        <div className="bg-[#F1F5F9] border border-[#CBD5E1] rounded-2xl p-4 text-center space-y-1.5 mt-2">
          <span className="text-xs font-bold text-[#0F172A] block">
            GYM • Version 1.0.0
          </span>
          <p className="text-[11px] text-[#475569]">
            Designed for high-output strength athletes. Built for pure performance.
          </p>
        </div>
      </div>
    </Modal>
  );
};
