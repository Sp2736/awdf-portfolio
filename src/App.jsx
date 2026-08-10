import { useState, useEffect } from 'react';
import LandingHero from './components/LandingHero';
import Resume from './components/Resume';
import { Moon, Sun } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [showResume, setShowResume] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleEnterResume = () => {
    setShowResume(true);
    window.scrollTo(0, 0);
  };

  return (
    <div className={`min-h-screen font-sans ${darkMode ? 'dark bg-[#0b0f19]' : 'bg-slate-50'}`}>
      
      {/* Floating Theme Toggle */}
      {!showResume && (
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="fixed top-6 right-6 z-50 flex items-center gap-2 text-xs px-3 py-1.5 border border-white/10 dark:border-white/10 rounded-full bg-black/20 backdrop-blur-md hover:bg-white/10 transition-colors text-white shadow-lg"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          <span className="font-medium hidden sm:inline">{darkMode ? 'Light' : 'Dark'}</span>
        </button>
      )}

      {!showResume ? (
        <LandingHero onEnterResume={handleEnterResume} />
      ) : (
        <Resume darkMode={darkMode} setDarkMode={setDarkMode} />
      )}
    </div>
  );
}
