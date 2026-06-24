import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Sun, Moon, Plus, Trash2, Edit3, Search, Loader2, 
  AlertCircle, CheckCircle, Layers, 
  CheckSquare, Clock, LayoutGrid, SlidersHorizontal
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/tasks';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('theme') === 'dark');
  
  // State management for field parameters
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [editingId, setEditingId] = useState(null);

  // Filter state pipelines
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest');

  // Interactive overlays tracking states
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Hook layout tracking dark mode states across windows
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks([...res.data]); // Forces array reference update to trigger clean React rerender
    } catch (err) {
      showNotification('Failed to connect to backend data infrastructure', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchTasks(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Client-side Validation Checks
    if (!title.trim() || !description.trim()) {
      showNotification('Validation Guard: Fields cannot remain blank!', 'error');
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, { title, description, status });
        showNotification('Task parameters updated cleanly');
      } else {
        await axios.post(API_URL, { title, description, status });
        showNotification('New operational task record initialized');
      }
      // Reset layout variables cleanly before calling fetch
      setTitle(''); 
      setDescription(''); 
      setStatus('Pending'); 
      setEditingId(null);
      
      // Pull latest database slice back into local memory
      await fetchTasks();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Data mutations error occurred', 'error');
    }
  };

  const triggerDeleteConfirm = (id) => {
    setTaskToDelete(id);
    setShowModal(true);
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${taskToDelete}`);
      showNotification('Record purged from data storage arrays');
      setShowModal(false);
      fetchTasks();
    } catch (err) {
      showNotification('Error dropping task index point', 'error');
    }
  };

  const startEdit = (task) => {
    setEditingId(task._id);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
  };

  // Real-time statistical metrics aggregations
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    progress: tasks.filter(t => t.status === 'In Progress').length,
    completed: tasks.filter(t => t.status === 'Completed').length,
  };

  // List pipelines manipulation logic arrays
  const filteredTasks = tasks
    .filter(task => {
      const titleMatch = task.title ? task.title.toLowerCase().includes(search.toLowerCase()) : false;
      const descMatch = task.description ? task.description.toLowerCase().includes(search.toLowerCase()) : false;
      const matchesSearch = titleMatch || descMatch;
      const matchesFilter = filterStatus === 'All' || task.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Toast Alert Systems Popups */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 ${
          toast.type === 'error' 
            ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' 
            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        }`}>
          {toast.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
          <span className="font-semibold text-xs tracking-wide">{toast.msg}</span>
        </div>
      )}

      {/* Confirmation Modals Overlays */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200/60 dark:border-slate-800/80">
            <h3 className="text-lg font-bold tracking-tight">Confirm Resource Deletion</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Are you sure you want to drop this task card? This operation will remove the memory tracking parameters and cannot be reversed.</p>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-colors">Abort</button>
              <button onClick={executeDelete} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors shadow-lg shadow-red-600/20">Purge Data</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Structural Navigation Header */}
      <header className="border-b border-slate-200/60 dark:border-slate-900 sticky top-0 bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-600/20">
              <LayoutGrid size={18} />
            </div>
            <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              Student Mini Project Management Portal <span className="text-[10px] font-bold text-slate-400 ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">PRO PRODUCTION</span>
            </h1>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 dark:text-slate-400 transition-colors">
            {darkMode ? <Sun size={18} className="text-amber-400"/> : <Moon size={18}/>}
          </button>
        </div>
      </header>

      {/* Main Work Area Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Statistics Metric Component Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Task Records', count: stats.total, icon: Layers, color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
            { label: 'Pending Lifecycle', count: stats.pending, icon: Clock, color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
            { label: 'In Progress Phase', count: stats.progress, icon: SlidersHorizontal, color: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/20' },
            { label: 'Completed Milestones', count: stats.completed, icon: CheckSquare, color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' }
          ].map((block, i) => {
            const IconComponent = block.icon;
            return (
              <div key={`stat-${i}`} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-900/60 shadow-xs flex items-center justify-between transition-all hover:-translate-y-0.5 duration-200">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 tracking-wide block">{block.label}</span>
                  <span className="text-3xl font-black tracking-tight">{block.count}</span>
                </div>
                <div className={`p-3 rounded-xl border ${block.color}`}>
                  <IconComponent size={20} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Workspace Layout Columns Configuration split */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* Reactive Input Control Form Box */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-900/60 shadow-xs lg:sticky top-24">
            <h2 className="text-xs font-bold tracking-wider uppercase text-slate-400 mb-5">{editingId ? 'Modify System Attributes' : 'Provision New Portal Entry'}</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-bold block mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wide">Task Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Provide deployment node title..." className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors"/>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wide">Scope Description</label>
                <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} placeholder="Outline code specifications and requirements context..." className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors resize-none"></textarea>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lifecycle State</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm outline-none focus:border-blue-600 transition-colors cursor-pointer">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <button type="submit" className="w-full mt-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/10 cursor-pointer">
                {editingId ? 'Apply Global Scope Mutations' : <><Plus size={16}/> Push Task Entry</>}
              </button>
              {editingId && (
                <button type="button" onClick={() => { setEditingId(null); setTitle(''); setDescription(''); }} className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition-colors">Cancel Modification</button>
              )}
            </form>
          </div>

          {/* Data Filter Management Grid Column Stream output */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filtering Control Operations Header Panel */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-900/60 shadow-xs flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by titles, descriptors, tokens..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-sm outline-none focus:border-blue-600" />
              </div>
              <div className="flex gap-2">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm outline-none cursor-pointer">
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer">
                  {sortOrder === 'newest' ? '🗓️ Newest First' : '🗓️ Oldest First'}
                </button>
              </div>
            </div>

            {/* Core Output Stream Handler Component */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-900/60">
                <Loader2 size={24} className="animate-spin text-blue-600"/>
                <span className="text-xs font-semibold tracking-wider">Compiling data configuration array feeds...</span>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400">
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Empty State Boundary Triggered</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">No structural logs match the current pipeline filtering settings parameters.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {filteredTasks.map((task, index) => (
                  <div key={task._id || `task-${index}`} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-900/60 flex justify-between items-start gap-5 hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-xs group">
                    <div className="space-y-2">
                      <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md border ${
                        task.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                        task.status === 'In Progress' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' :
                        'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}>{task.status}</span>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 tracking-tight pt-1">{task.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">{task.description}</p>
                    </div>
                    <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button onClick={() => startEdit(task)} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"><Edit3 size={15}/></button>
                      <button onClick={() => triggerDeleteConfirm(task._id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"><Trash2 size={15}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}