import { useState, useEffect, useRef } from 'react';
import { GitHubCalendar } from 'react-github-calendar';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { motion } from 'framer-motion';
import { XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GitBranch, Star, Users, ExternalLink, Activity, BookOpen, Terminal } from 'lucide-react';
import MathCurveLoader from './MathCurveLoader';

const USERNAME = 'Sp2736';

export default function GithubActivity({ isDarkMode }) {
  const [readme, setReadme] = useState('');
  const [repos, setRepos] = useState([]);
  const [following, setFollowing] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const calendarRef = useRef(null);

  // Salt drop animation for GitHub Calendar
  useEffect(() => {
    if (!loading && calendarRef.current) {
      let isAnimating = false;
      const observer = new MutationObserver(() => {
        if (isAnimating) return;
        const rects = calendarRef.current.querySelectorAll('rect');
        if (rects.length > 0) {
          isAnimating = true;
          // Small delay to ensure all rects are in DOM
          setTimeout(() => {
            rects.forEach(rect => {
              const fill = rect.getAttribute('fill');
              // If it's a colored block
              if (fill !== '#1e293b' && fill !== 'transparent' && fill !== 'none') {
                rect.style.opacity = '0';
                rect.style.transform = 'translateY(-20px) scale(0.5)';
                rect.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                rect.style.transitionDelay = `${Math.random() * 1.5}s`;
                setTimeout(() => {
                  rect.style.opacity = '1';
                  rect.style.transform = 'translateY(0) scale(1)';
                }, 50);
              } else {
                // Empty blocks fade in
                rect.style.opacity = '0';
                rect.style.transition = 'opacity 0.5s ease';
                setTimeout(() => { rect.style.opacity = '1'; }, 50);
              }
            });
          }, 100);
          // Don't disconnect immediately, the SVG may update
        }
      });
      observer.observe(calendarRef.current, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [loading]);

  const fetchGithubData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch Profile README
      const readmeRes = await fetch(`https://api.github.com/repos/${USERNAME}/${USERNAME}/readme`, {
        headers: { 'Accept': 'application/vnd.github.v3.raw' }
      });
      if (readmeRes.ok) {
        const text = await readmeRes.text();
        setReadme(text);
      }

      // Fetch Recent Repos
      const reposRes = await fetch(`https://api.github.com/users/${USERNAME}/repos?sort=updated&per_page=100`);
      if (!reposRes.ok) throw new Error('Failed to fetch repositories');
      const reposData = await reposRes.json();
      // Filter out forks and get top 5 recently updated
      const recentRepos = reposData
        .filter(repo => !repo.fork)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, 5);
      setRepos(recentRepos);

      // Fetch Following for Top Connections
      const followingRes = await fetch(`https://api.github.com/users/${USERNAME}/following?per_page=6`);
      if (followingRes.ok) {
        const followingData = await followingRes.json();
        setFollowing(followingData);
      }

      // Generate 30-day activity chart data from PushEvents
      const eventsRes = await fetch(`https://api.github.com/users/${USERNAME}/events?per_page=100`);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        
        const last30Days = [...Array(30)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (29 - i));
          return { date: d.toISOString().split('T')[0], commits: 0 };
        });

        eventsData.forEach(event => {
          if (event.type === 'PushEvent') {
            const dateStr = event.created_at.split('T')[0];
            const dayObj = last30Days.find(d => d.date === dateStr);
            if (dayObj) {
              dayObj.commits += event.payload.commits ? event.payload.commits.length : 1;
            }
          }
        });
        setChartData(last30Days);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGithubData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4">
        <MathCurveLoader size={64} />
        <p className="font-mono text-sm tracking-wide text-indigo-400">Syncing with GitHub API...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl transition-colors duration-300">
        <Terminal className="w-12 h-12 text-red-500 dark:text-red-400 mb-4 opacity-50" />
        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Failed to load GitHub Activity</h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button 
          onClick={fetchGithubData}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* GitHub Calendar (Matrix) */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Terminal size={120} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Contribution Matrix
        </h3>
        <div className="overflow-x-auto pb-2" ref={calendarRef}>
          <div className="min-w-max text-slate-300">
            <GitHubCalendar 
              username={USERNAME} 
              colorScheme={isDarkMode ? "dark" : "light"}
              theme={{
                light: ['#f1f5f9', '#d8b4fe', '#a855f7', '#9333ea', '#6b21a8'],
                dark: ['#1e293b', '#6b21a8', '#9333ea', '#a855f7', '#d8b4fe'] // Purple theme
              }}
            />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile README */}
        {readme && (
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl overflow-hidden flex flex-col h-[500px] transition-colors duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 shrink-0">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Profile Readme
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 prose dark:prose-invert prose-purple max-w-none text-xs leading-relaxed
                            scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{readme}</Markdown>
            </div>
          </motion.div>
        )}

        {/* 30-Day Activity Chart & Top Connections */}
        <div className="flex flex-col gap-8">
          
          {/* Chart */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl transition-colors duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              30-Day Commit Activity
            </h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke={isDarkMode ? "#475569" : "#94a3b8"} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', 
                      borderColor: isDarkMode ? '#1e293b' : '#e2e8f0', 
                      borderRadius: '8px', 
                      color: isDarkMode ? '#fff' : '#0f172a' 
                    }}
                    itemStyle={{ color: '#a855f7' }}
                    cursor={{ stroke: isDarkMode ? '#1e293b' : '#e2e8f0', strokeWidth: 2 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="commits" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCommits)"
                    animationDuration={2000}
                    animationEasing="ease-in-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Top Connections */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl flex-1 transition-colors duration-300">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Top Connections
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-3 gap-4">
              {following.map(user => (
                <a 
                  key={user.id} 
                  href={user.html_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 group-hover:border-purple-500 dark:group-hover:border-purple-400 transition-colors">
                    <img src={user.avatar_url} alt={user.login} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-purple-600 dark:group-hover:text-purple-300 truncate w-full text-center transition-colors">
                    @{user.login}
                  </span>
                </a>
              ))}
              {following.length === 0 && (
                <p className="text-sm text-slate-500 col-span-full">No recent connections found.</p>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Repositories */}
      <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xl transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Recently Pushed Repositories
          </h3>
          <input 
            type="text" 
            placeholder="Filter repositories..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-300 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500 w-full sm:w-48 transition-colors duration-300"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map(repo => (
            <a 
              key={repo.id} 
              href={repo.html_url}
              target="_blank"
              rel="noreferrer" 
              className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500/50 p-5 rounded-lg transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-purple-600 dark:text-purple-400 font-bold text-lg truncate pr-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  {repo.name}
                </h4>
                <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 flex-1 mb-4 transition-colors">
                {repo.description || 'No description provided.'}
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500 mt-auto">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" /> {repo.stargazers_count}
                </span>
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3 h-3" /> {repo.forks_count}
                </span>
              </div>
            </a>
          ))}
          {repos.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
            <p className="text-sm text-slate-500 col-span-full py-4 text-center">No repositories match your search.</p>
          )}
        </div>
      </motion.div>

    </motion.div>
  );
}
