import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ExternalLink, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

// Icon Map
const iconMap = {
  github: FaGithub,
  live: ExternalLink,
  architecture: ArrowUpRight,
  marketplace: ShoppingBag,
};

export default function ProjectEntry({ title, stack, bullets, links = [], isExpanded, onToggle }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-[#151b2b] shadow-sm transition-shadow hover:shadow-md"
    >
      <button 
        onClick={onToggle}
        className="w-full text-left p-4 md:p-5 flex items-center justify-between group focus:outline-none"
      >
        <div>
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base md:text-lg tracking-tight group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
            {title}
          </h4>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">
            [{stack}]
          </p>
        </div>
        <motion.div 
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 ml-4 shrink-0"
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 md:px-5 border-t border-slate-100 dark:border-slate-800/50 pt-4">
              <ul className="list-disc list-outside ml-4 space-y-2 mb-6">
                {bullets.map((bullet, idx) => (
                  <li key={idx} className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-1">
                    {bullet}
                  </li>
                ))}
              </ul>

              {links && links.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {links.map((link, idx) => {
                    const Icon = link.icon || iconMap[link.type] || ExternalLink;
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-colors border border-slate-200 dark:border-slate-700"
                      >
                        <Icon size={14} />
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
