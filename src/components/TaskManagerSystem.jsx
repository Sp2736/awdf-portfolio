import { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  Terminal, 
  Zap,
  Info,
  Cpu,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import MathCurveLoader from './MathCurveLoader';

const API_BASE = 'http://localhost:5000';
const ITEMS_PER_PAGE = 3;

const METHOD_EXAMPLES = {
  GET: {
    endpoint: '/tasks',
    headers: '{"Content-Type": "application/json"}',
    body: ''
  },
  POST: {
    endpoint: '/tasks',
    headers: '{"Content-Type": "application/json"}',
    body: JSON.stringify({
      title: "Deploy Microservices Engine",
      description: "Provision load balancers and route task traffic",
      priority: "high"
    }, null, 2)
  },
  PUT: {
    endpoint: '/tasks/1',
    headers: '{"Content-Type": "application/json"}',
    body: JSON.stringify({
      title: "Design API Schema (Updated)",
      completed: true,
      priority: "high"
    }, null, 2)
  },
  DELETE: {
    endpoint: '/tasks/1',
    headers: '{"Content-Type": "application/json"}',
    body: ''
  }
};

export default function TaskManagerSystem({ darkMode, setDarkMode }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  // Filter & Pagination State
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Interactive API Console / Developer Studio State
  const [testMethod, setTestMethod] = useState('GET');
  const [testEndpoint, setTestEndpoint] = useState(METHOD_EXAMPLES.GET.endpoint);
  const [testBody, setTestBody] = useState(METHOD_EXAMPLES.GET.body);
  const [testHeaders, setTestHeaders] = useState(METHOD_EXAMPLES.GET.headers);
  const [testResponse, setTestResponse] = useState(null);
  const [testLoading, setTestLoading] = useState(false);

  // Action-specific loading & error states
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  // Reset to page 1 whenever filter changes
  const handleFilterChange = (f) => {
    setFilter(f);
    setCurrentPage(1);
  };

  // Handle Method change to dynamically update endpoint & body templates
  const handleMethodSelect = (method) => {
    setTestMethod(method);
    const example = METHOD_EXAMPLES[method] || METHOD_EXAMPLES.GET;
    setTestEndpoint(example.endpoint);
    setTestBody(example.body);
    setTestHeaders(example.headers);
    setTestResponse(null);
  };

  // Fetch all tasks
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      setTasks(json.data || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/tasks`);
        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}`);
        }
        const json = await res.json();
        if (isMounted) setTasks(json.data || []);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to connect to backend server');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to create task');
      }

      setNewTitle('');
      setNewDescription('');
      setNewPriority('medium');
      setCurrentPage(1); // Jump to first page to see newly added task
      await fetchTasks();
    } catch (err) {
      setActionError(`Create Error: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (task) => {
    const taskId = task.id || task._id;
    setTogglingId(taskId);
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to update task');
      }
      await fetchTasks();
    } catch (err) {
      setActionError(`Update Error: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Delete Task
  const handleDeleteTask = async (task) => {
    const taskId = typeof task === 'object' ? (task.id || task._id) : task;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setDeletingId(taskId);
    setActionError(null);
    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.message || 'Failed to delete task');
      }
      await fetchTasks();
    } catch (err) {
      setActionError(`Delete Error: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Execute manual API test request
  const handleRunApiTest = async () => {
    setTestLoading(true);
    setTestResponse(null);
    const startTime = performance.now();
    try {
      let parsedHeaders = {};
      try {
        parsedHeaders = JSON.parse(testHeaders);
      } catch {
        throw new Error('Invalid JSON format in Request Headers field');
      }

      const options = {
        method: testMethod,
        headers: parsedHeaders
      };

      if (['POST', 'PUT'].includes(testMethod) && testBody.trim()) {
        options.body = testBody;
      }

      const res = await fetch(`${API_BASE}${testEndpoint}`, options);
      const endTime = performance.now();
      const status = res.status;
      const statusText = res.statusText;
      
      let bodyData;
      const text = await res.text();
      try {
        bodyData = JSON.parse(text);
      } catch {
        bodyData = text;
      }

      setTestResponse({
        status,
        statusText,
        timeMs: Math.round(endTime - startTime),
        data: bodyData
      });

      // Refresh task list if mutation occurred
      if (['POST', 'PUT', 'DELETE'].includes(testMethod) && status < 400) {
        fetchTasks();
      }
    } catch (err) {
      setTestResponse({
        error: true,
        message: err.message
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Filtering
  const filteredTasks = tasks.filter(t => {
    if (filter === 'completed') return t.completed;
    if (filter === 'pending') return !t.completed;
    return true;
  });

  // Pagination calculation (3 items per page)
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 relative z-10">
      
      {/* Top Bento Row: Hero Banner & REST API Studio (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Top-Left Bento Item: Hero Header (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-2xl text-slate-900 dark:text-white relative">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 translate-y-12 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-xs font-mono font-medium tracking-wide uppercase">
                <Cpu size={14} />
                <span>Full-Stack REST Architecture</span>
              </div>

              {setDarkMode && (
                <button
                  type="button"
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-2 text-xs font-mono cursor-none"
                  title="Toggle Theme"
                >
                  {darkMode ? <Sun size={15} className="text-amber-500 dark:text-amber-400" /> : <Moon size={15} className="text-indigo-600 dark:text-indigo-400" />}
                  <span className="hidden sm:inline font-sans">{darkMode ? 'Light' : 'Dark'}</span>
                </button>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Task Flow Engine
            </h1>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              A high-performance task management system powered by an Express REST API backend pipeline, strict payload validation, request auditing middleware, and centralized error handling.
            </p>
          </div>

          <div className="relative z-10 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3.5 w-3.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${error ? 'bg-rose-400' : 'bg-emerald-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${error ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
              </div>
              <div className="font-mono text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Service Status: </span>
                <span className="text-slate-900 dark:text-white font-bold">{error ? 'Offline' : 'Active (Port 5000)'}</span>
              </div>
            </div>

            <MathCurveLoader size={40} />
          </div>
        </div>

        {/* Top-Right Bento Item: REST API Studio (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-900 dark:text-slate-100 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
                <Terminal size={16} />
                <span>REST API Studio</span>
              </h2>
              <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-semibold">
                HTTP Console
              </span>
            </div>

            {/* Method Tab Buttons */}
            <div className="space-y-1.5 font-mono text-xs">
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Select HTTP Method</label>
              <div className="grid grid-cols-4 gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
                {['GET', 'POST', 'PUT', 'DELETE'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleMethodSelect(m)}
                    className={`py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                      testMethod === m
                        ? m === 'GET'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : m === 'POST'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : m === 'PUT'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Endpoint Input */}
            <div className="space-y-1 font-mono text-xs">
              <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Target Endpoint</label>
              <input
                type="text"
                value={testEndpoint}
                onChange={(e) => setTestEndpoint(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                placeholder="/tasks"
              />
            </div>

            {/* Headers */}
            {['POST', 'PUT'].includes(testMethod) && (
              <div className="space-y-1 font-mono text-xs">
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Headers</label>
                <input
                  type="text"
                  value={testHeaders}
                  onChange={(e) => setTestHeaders(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-800 dark:text-slate-300 focus:outline-none"
                />
              </div>
            )}

            {/* JSON Payload Template */}
            {['POST', 'PUT'].includes(testMethod) && (
              <div className="space-y-1 font-mono text-xs">
                <label className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">JSON Payload Template</label>
                <textarea
                  rows={4}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-300 font-mono text-[11px] focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleRunApiTest}
              disabled={testLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs font-mono rounded-xl flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
            >
              {testLoading ? <MathCurveLoader size={20} /> : <Zap size={14} />}
              <span>Execute {testMethod} Request</span>
            </button>

            {/* Response Inspector */}
            {testResponse && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Response:</span>
                  {testResponse.error ? (
                    <span className="text-rose-500 font-bold">CLIENT ERROR</span>
                  ) : (
                    <span className={`font-bold px-2 py-0.5 rounded-md ${
                      testResponse.status < 300 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800' 
                        : testResponse.status < 500
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800'
                    }`}>
                      {testResponse.status} {testResponse.statusText} ({testResponse.timeMs}ms)
                    </span>
                  )}
                </div>

                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-emerald-400 overflow-x-auto max-h-48 leading-relaxed font-mono">
                  {testResponse.error 
                    ? testResponse.message 
                    : JSON.stringify(testResponse.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bottom Bento Row: Create New Task & Task Stream (Side by Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Bottom-Left Bento Item: Create Task Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus size={18} className="text-indigo-500" />
              <span>New Task Entry</span>
            </h2>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 font-medium">POST /tasks</span>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Task Title</label>
              <input
                type="text"
                placeholder="Enter task title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <input
                type="text"
                placeholder="Brief description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting || !newTitle.trim()}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
              <span>Submit Task</span>
            </button>
          </form>
        </div>

        {/* Bottom-Right Bento Item: Task Stream List (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Task Stream Collection</h2>
                <span className="px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold font-mono rounded-full">
                  {filteredTasks.length}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchTasks}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  title="Sync with Backend"
                >
                  <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-500' : ''} />
                </button>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                  {['all', 'pending', 'completed'].map((f) => (
                    <button
                      key={f}
                      onClick={() => handleFilterChange(f)}
                      className={`px-3 py-1 capitalize rounded-lg transition-all ${
                        filter === f
                          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 rounded-xl flex items-start gap-3 text-rose-700 dark:text-rose-300 text-sm">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Backend Connection Offline</div>
                  <div className="text-xs mt-0.5 opacity-90">{error}. Run <code>node server.js</code> to initialize the Express service.</div>
                </div>
              </div>
            )}

            {/* Action Specific Error Banner */}
            {actionError && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl flex items-center justify-between text-amber-800 dark:text-amber-300 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0 text-amber-500" />
                  <span>{actionError}</span>
                </div>
                <button onClick={() => setActionError(null)} className="font-bold underline text-[10px]">Dismiss</button>
              </div>
            )}

            {/* Tasks List */}
            {loading && tasks.length === 0 ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                <MathCurveLoader size={54} />
                <p className="text-sm font-medium">Synchronizing live task stream...</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="py-16 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl">
                <Info size={24} className="mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium">No tasks found</p>
                <p className="text-xs text-slate-500">Submit a task using the entry form to populate.</p>
              </div>
            ) : (
              <div className="space-y-3 min-h-[260px]">
                {paginatedTasks.map((t) => {
                  const tid = t.id || t._id;
                  const isToggling = togglingId === tid;
                  const isDeleting = deletingId === tid;

                  return (
                    <div
                      key={tid}
                      className={`group flex items-start justify-between p-4 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800 rounded-2xl transition-all ${
                        isToggling || isDeleting ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <button
                          onClick={() => handleToggleTask(t)}
                          disabled={isToggling || isDeleting}
                          className="mt-0.5 text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                          {isToggling ? (
                            <RefreshCw size={20} className="animate-spin text-indigo-500" />
                          ) : t.completed ? (
                            <CheckCircle2 size={20} className="text-emerald-500" />
                          ) : (
                            <Circle size={20} />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-semibold ${t.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                              {t.title}
                            </span>
                            
                            <span className={`text-[10px] uppercase tracking-wider font-mono font-bold px-2 py-0.5 rounded-md ${
                              t.priority === 'high' 
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                : t.priority === 'medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                                : 'bg-sky-100 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-900'
                            }`}>
                              {t.priority || 'medium'}
                            </span>

                            <span className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">#{tid}</span>
                          </div>

                          {t.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                              {t.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteTask(t)}
                        disabled={isToggling || isDeleting}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors opacity-70 group-hover:opacity-100"
                        title="Delete task"
                      >
                        {isDeleting ? <RefreshCw size={16} className="animate-spin text-rose-500" /> : <Trash2 size={16} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pagination Controls (3 Tasks Per Page) */}
          {filteredTasks.length > 0 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800 text-xs font-mono">
              <span className="text-slate-500 dark:text-slate-400">
                Showing {startIndex + 1} - {Math.min(startIndex + ITEMS_PER_PAGE, filteredTasks.length)} of {filteredTasks.length} tasks
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={validCurrentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
                  title="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 px-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold font-mono transition-all ${
                        validCurrentPage === page
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={validCurrentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-all"
                  title="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
