import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Filter, ArrowUpDown, Moon, Sun, 
  CheckCircle, Clock, AlertCircle, Layers, Trash2, Edit3,
  Sparkles
} from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, completed: 0 });
  
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const calculateStats = (allTasks) => {
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.status === 'Pending').length;
    const inProgress = allTasks.filter(t => t.status === 'In Progress').length;
    const completed = allTasks.filter(t => t.status === 'Completed').length;
    setStats({ total, pending, inProgress, completed });
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_BASE_URL);
      const data = response.data.tasks || response.data;
      if (Array.isArray(data)) {
        setTasks(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error("Error retrieving tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return alert("Please fill out all task criteria headers.");

    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/${editingId}`, { title, description, status });
        setEditingId(null);
      } else {
        await axios.post(API_BASE_URL, { title, description, status });
      }
      setTitle('');
      setDescription('');
      setStatus('Pending');
      fetchTasks();
    } catch (error) {
      console.error("Submission operational failure:", error);
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to remove this project node entry?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
      fetchTasks();
    } catch (error) {
      console.error("Deletion target pipeline error:", error);
    }
  };

  const processedTasks = tasks
    .filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(search.toLowerCase()) || 
        task.description.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterStatus === 'All' || task.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date || 0);
      const dateB = new Date(b.createdAt || b.date || 0);
      return sortBy === 'Newest First' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 bg-gradient-to-br ${
      darkMode 
        ? 'from-[#090D1A] via-[#0F172A] to-[#1E1B4B] text-slate-100' 
        : 'from-slate-50 via-gray-100 to-blue-50 text-slate-800'
    }`}>
      
      {/* HEADER BAR */}
      <header className={`border-b sticky top-0确定 z-50 backdrop-blur-xl shadow-sm transition-colors duration-500 ${
        darkMode ? 'border-slate-800/80 bg-[#090D1A]/70' : 'border-slate-200/80 bg-white/70'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-indigo-400 to-purple-500 dark:from-white dark:to-slate-300">
                  Project Portal
                </h1>
                <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-md border border-indigo-500/20">
                  v2.0 PRO
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Klenty Recruitment Workspace Evaluation</p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-2xl border transition-all duration-300 transform active:scale-95 ${
              darkMode 
                ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-amber-400 hover:shadow-lg hover:shadow-amber-500/10' 
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:shadow-md'
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* STATS SECTION */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Tracked Logs', count: stats.total, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: Layers },
            { label: 'Pending Lifecycle', count: stats.pending, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: AlertCircle },
            { label: 'In Progress Phase', count: stats.inProgress, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: Clock },
            { label: 'Completed Milestones', count: stats.completed, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle },
          ].map((item, idx) => (
            <div key={idx} className={`p-6 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${
              darkMode 
                ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700/80 shadow-xl backdrop-blur-md' 
                : 'bg-white border-slate-100 shadow-xl shadow-slate-100/50'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{item.label}</p>
                  <p className="text-3xl font-black mt-2 tracking-tight">{item.count}</p>
                </div>
                <div className={`p-3.5 rounded-2xl ${item.bg} ${item.color} shadow-inner`}>
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* TWO-COLUMN GRID ARCHITECTURE */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* TASK CREATION FORM CONTAINER */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-3xl border sticky top-32 transition-all ${
              darkMode ? 'bg-slate-900/50 border-slate-800/80 shadow-2xl backdrop-blur-md' : 'bg-white border-slate-200 shadow-xl'
            }`}>
              <h2 className="text-xs font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-6 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-500" /> {editingId ? "Update Structure Node" : "Deploy Component Node"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold tracking-wide mb-2 uppercase text-slate-400">Task Title</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Provide execution node title..." 
                    className={`w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wide mb-2 uppercase text-slate-400">Scope Description</label>
                  <textarea 
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Outline code specifications scope..." 
                    className={`w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                    }`}
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-wide mb-2 uppercase text-slate-400">Lifecycle State</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-blue-500' : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                    }`}
                  >
                    <option value="Pending">⌛ Pending</option>
                    <option value="In Progress">⚡ In Progress</option>
                    <option value="Completed">✅ Completed</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  {editingId && (
                    <button 
                      type="button"
                      onClick={() => {
                        setEditingId(null);
                        setTitle('');
                        setDescription('');
                        setStatus('Pending');
                      }}
                      className="w-1/3 bg-slate-500/20 hover:bg-slate-500/30 text-slate-400 font-semibold py-3 px-3 rounded-2xl text-sm transition-all"
                    >
                      Cancel
                    </button>
                  )}
                  <button 
                    type="submit"
                    className={`font-bold py-3 px-4 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all transform active:scale-98 text-white ${
                      editingId 
                        ? 'w-2/3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-600/20' 
                        : 'w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/20'
                    }`}
                  >
                    <Plus className="w-4 h-4" /> {editingId ? "Save Changes" : "Push Data Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* PIPELINE FILTERS & LIST VIEW */}
          <div className="lg:col-span-2 space-y-5">
            
            {/* CONTROL PANEL BAR */}
            <div className={`p-4 rounded-3xl border flex flex-col md:flex-row gap-4 items-center justify-between ${
              darkMode ? 'bg-slate-900/50 border-slate-800/80 shadow-xl backdrop-blur-md' : 'bg-white border-slate-200 shadow-lg shadow-slate-100/40'
            }`}>
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 absolute left-4 top-4 text-slate-400" />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter keys, parameters, logs..."
                  className={`w-full pl-11 pr-4 py-3 rounded-2xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 focus:border-indigo-500'
                  }`}
                />
              </div>

              <div className="flex gap-4 w-full md:w-auto justify-end">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <select 
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-slate-400" />
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border focus:outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <option value="Newest First">Newest First</option>
                    <option value="Oldest First">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* LIVE FEED DISPLAY TASKS */}
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-16 text-sm font-semibold tracking-wide animate-pulse text-indigo-400">
                  Indexing secure storage layers...
                </div>
              ) : processedTasks.length === 0 ? (
                <div className={`p-16 text-center rounded-3xl border-2 border-dashed ${
                  darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
                }`}>
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40 text-indigo-500" />
                  <p className="text-sm font-bold">No active threads found matching selection metrics.</p>
                </div>
              ) : (
                processedTasks.map((task) => (
                  <div 
                    key={task._id}
                    className={`p-6 rounded-3xl border transition-all duration-300 group relative overflow-hidden ${
                      darkMode 
                        ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70 shadow-lg' 
                        : 'bg-white border-slate-100 hover:shadow-xl shadow-md shadow-slate-100/40'
                    }`}
                  >
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${
                      task.status === 'Completed' ? 'bg-emerald-500' :
                      task.status === 'In Progress' ? 'bg-purple-500' : 'bg-amber-500'
                    }`} />

                    <div className="flex justify-between items-start gap-6 pl-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg ${
                            task.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            task.status === 'In Progress' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {task.status}
                          </span>
                          <h3 className="font-bold text-base tracking-tight">{task.title}</h3>
                        </div>
                        <p className={`text-xs leading-relaxed font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{task.description}</p>
                      </div>

                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
                        <button 
                          type="button"
                          onClick={() => startEdit(task)}
                          className={`p-2 rounded-xl border transition-all shadow-sm ${
                            darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          type="button"
                          onClick={() => deleteTask(task._id)}
                          className="p-2 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/20 transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}