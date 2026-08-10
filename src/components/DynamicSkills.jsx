import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { skillsData } from '../data/resumeContent';

export default function DynamicSkills() {
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Group skills by category
  const groupedSkills = skillsData.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const handleToggle = (category) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  return (
    <div className="w-full space-y-3">
      {Object.entries(groupedSkills).map(([category, skills]) => {
        const isExpanded = expandedCategory === category;

        return (
          <div key={category} className="border border-slate-700/50 rounded-lg overflow-hidden bg-slate-800/30">
            <button
              onClick={() => handleToggle(category)}
              className="w-full px-4 py-3 flex items-center justify-between text-left focus:outline-none hover:bg-slate-700/50 transition-colors"
            >
              <span className="text-sm font-bold text-slate-200">{category}</span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown size={16} className="text-purple-400" />
              </motion.div>
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
                  <div className="p-4 pt-0 border-t border-slate-700/50 bg-slate-900/50 grid grid-cols-2 gap-3">
                    {skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-600">
                        <img 
                          src={skill.icon} 
                          alt={skill.name} 
                          className={`w-5 h-5 object-contain ${skill.invertDark ? 'filter invert' : ''}`}
                        />
                        <span className="text-xs font-medium text-slate-300">{skill.name}</span>
                      </div>
                    ))}
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
