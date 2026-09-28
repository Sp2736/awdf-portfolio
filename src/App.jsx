import { useState, useEffect, Suspense, lazy } from 'react';
import LandingHero from './components/LandingHero';
import GlobalCustomCursor from './components/GlobalCustomCursor';
import DynamicMotionBackground from './components/DynamicMotionBackground';
import { Moon, Sun } from 'lucide-react';
import MathCurveLoader from './components/MathCurveLoader'; // Need a loader

const Resume = lazy(() => import('./components/Resume'));
const TaskManagerSystem = lazy(() => import('./components/TaskManagerSystem'));

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'resume', 'taskEngine'

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleEnterResume = () => {
    setCurrentView('resume');
    window.scrollTo(0, 0);
  };

  // Fallback UI
  const FallbackUI = () => (
    <div className="flex justify-center items-center h-screen w-full relative z-10 text-slate-800 dark:text-slate-200">
      <div className="flex flex-col items-center gap-4">
        {MathCurveLoader ? <MathCurveLoader size={60} /> : <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>}
        <p className="font-mono text-sm tracking-wide animate-pulse">Loading component chunk...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans relative ${darkMode ? 'dark' : ''}`}>
      
      {/* Global Interactive Custom Pointer */}
      <GlobalCustomCursor />

      {/* Dynamic Animated Motion Mesh Background */}
      <DynamicMotionBackground />

      {/* Global Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white px-4 py-3 cursor-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => setCurrentView('landing')} 
            className="flex items-center gap-2 font-bold text-sm tracking-wide text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors cursor-none"
          >
            <span>AWDF PORTFOLIO</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setCurrentView('resume')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-none ${
                currentView === 'resume' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Developer Portfolio
            </button>
            <button
              onClick={() => setCurrentView('taskEngine')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 cursor-none ${
                currentView === 'taskEngine' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Task Engine
            </button>
          </div>

          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 cursor-none"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* View Content */}
      <main className="relative z-10">
        {currentView === 'landing' && (
          <LandingHero onEnterResume={handleEnterResume} />
        )}
        <Suspense fallback={<FallbackUI />}>
          {currentView === 'resume' && (
            <Resume darkMode={darkMode} setDarkMode={setDarkMode} />
          )}
          {currentView === 'taskEngine' && (
            <TaskManagerSystem darkMode={darkMode} setDarkMode={setDarkMode} />
          )}
        </Suspense>
      </main>
    </div>
  );
}

