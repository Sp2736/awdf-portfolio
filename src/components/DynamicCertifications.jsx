import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Brain, Code, Database, Shield, Cloud, Code2 } from 'lucide-react';
import { certData } from '../data/resumeContent';

// Map string icon names to actual Lucide components
const iconMap = {
  Brain,
  Code,
  Database,
  Shield,
  Cloud,
  Code2
};

export default function DynamicCertifications() {
  const [expandedId, setExpandedId] = useState(null);

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="w-full space-y-3">
      {certData.map((cert) => {
        const isExpanded = expandedId === cert.id;
        const Icon = iconMap[cert.icon] || Code;

        return (
          <div key={cert.id} className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/30 group">
            <button
              onClick={() => handleToggle(cert.id)}
              className="w-full p-4 flex items-start gap-4 text-left focus:outline-none hover:bg-slate-700/50 transition-colors"
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-200">{cert.title}</h4>
                  <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={16} className="text-slate-500" />
                  </motion.div>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1 inline-block">
                  {cert.issuer}
                </span>
              </div>
            </button>
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-slate-700/50 bg-slate-900/50">
                    <div className="flex flex-wrap gap-1.5 mb-4 mt-3">
                      {cert.skills.map((skill, i) => (
                        <span key={i} className="text-[10px] font-mono text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full">
                          #{skill.replace(/\s+/g, "")}
                        </span>
                      ))}
                    </div>
                    <ul className="space-y-2">
                      {cert.certs.map((c, i) => (
                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">▹</span>
                          <span className="leading-snug">{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
