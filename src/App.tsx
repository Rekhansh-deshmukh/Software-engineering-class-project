import React, { useState, useEffect, KeyboardEvent } from 'react';
import { format, isToday, parseISO, addDays } from 'date-fns';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  Circle,
  Flag,
  Home,
  Inbox,
  LayoutGrid,
  Menu,
  Plus,
  Search,
  Settings,
  Tag,
  Trash2,
  CalendarDays,
  ArrowUpCircle,
  Clock,
} from 'lucide-react';
import { Menu as HeadlessMenu } from '@headlessui/react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
  project?: string;
  priority: 1 | 2 | 3 | 4;
  dueDate?: Date;
  createdAt: Date;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

type SortOption = 'priority' | 'date' | 'alphabetical';

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('todos');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((todo: any) => ({
        ...todo,
        dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
        createdAt: new Date(todo.createdAt),
      }));
    }
    return [
      { 
        id: 1, 
        text: 'Complete project presentation', 
        completed: false, 
        project: 'Work', 
        priority: 1, 
        dueDate: new Date(),
        createdAt: new Date()
      },
      { 
        id: 2, 
        text: 'Buy groceries', 
        completed: false, 
        project: 'Personal', 
        priority: 3,
        createdAt: new Date()
      },
      { 
        id: 3, 
        text: 'Schedule dentist appointment', 
        completed: false, 
        priority: 2,
        createdAt: new Date()
      },
    ];
  });

  const [newTodo, setNewTodo] = useState('');
  const [selectedProject, setSelectedProject] = useState('inbox');
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const projects: Project[] = [
    { id: 'work', name: 'Work', color: 'bg-blue-500' },
    { id: 'personal', name: 'Personal', color: 'bg-green-500' },
  ];

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '/' && !showSearch) {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };

    document.addEventListener('keydown', handleKeyPress as any);
    return () => document.removeEventListener('keydown', handleKeyPress as any);
  }, [showSearch]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      const dueDateMatch = newTodo.match(/\s*#due\s+(\d{4}-\d{2}-\d{2})\s*$/);
      const priorityMatch = newTodo.match(/\s*#p(\d)\s*$/);
      const projectMatch = newTodo.match(/\s*#(\w+)\s*$/);

      let text = newTodo.trim();
      let dueDate: Date | undefined;
      let priority = 4;
      let project = selectedProject !== 'inbox' ? selectedProject : undefined;

      if (dueDateMatch) {
        text = text.replace(dueDateMatch[0], '');
        dueDate = parseISO(dueDateMatch[1]);
      }

      if (priorityMatch) {
        text = text.replace(priorityMatch[0], '');
        priority = parseInt(priorityMatch[1], 10);
      }

      if (projectMatch && projects.some(p => p.id === projectMatch[1])) {
        text = text.replace(projectMatch[0], '');
        project = projectMatch[1];
      }

      setTodos([
        ...todos,
        {
          id: Date.now(),
          text,
          completed: false,
          priority,
          project,
          dueDate,
          createdAt: new Date(),
        },
      ]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return 'text-red-500';
      case 2:
        return 'text-orange-500';
      case 3:
        return 'text-blue-500';
      default:
        return 'text-gray-400';
    }
  };

  const getDueDateColor = (date?: Date) => {
    if (!date) return 'text-gray-400';
    const today = new Date();
    if (date < today) return 'text-red-500';
    if (isToday(date)) return 'text-orange-500';
    return 'text-gray-400';
  };

  const filteredAndSortedTodos = todos
    .filter((todo) => {
      // Filter by project
      if (selectedProject === 'today') {
        return todo.dueDate && isToday(todo.dueDate);
      }
      if (selectedProject !== 'inbox' && todo.project !== selectedProject) {
        return false;
      }
      
      // Filter by search
      if (searchQuery) {
        return todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort based on selected option
      switch (sortOption) {
        case 'priority':
          return a.priority - b.priority;
        case 'date':
          return (b.dueDate?.getTime() || 0) - (a.dueDate?.getTime() || 0);
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-4">
        <div className="flex items-center justify-between mb-8">
          <Menu className="w-6 h-6" />
          <div className="flex space-x-2">
            <button 
              className="p-2 hover:bg-gray-800 rounded"
              onClick={() => setShowSearch(true)}
              title="Search (Press '/')"
            >
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="space-y-1">
          <button
            className={`flex items-center space-x-3 w-full p-2 rounded ${
              selectedProject === 'inbox' ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
            onClick={() => setSelectedProject('inbox')}
          >
            <Inbox className="w-5 h-5" />
            <span>Inbox</span>
          </button>
          <button
            className={`flex items-center space-x-3 w-full p-2 rounded ${
              selectedProject === 'today' ? 'bg-gray-800' : 'hover:bg-gray-800'
            }`}
            onClick={() => setSelectedProject('today')}
          >
            <Calendar className="w-5 h-5" />
            <span>Today</span>
          </button>
        </nav>

        <div className="mt-8">
          <div className="text-gray-400 text-sm font-medium mb-2">Projects</div>
          {projects.map((project) => (
            <button
              key={project.id}
              className={`flex items-center space-x-3 w-full p-2 rounded ${
                selectedProject === project.id ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
              onClick={() => setSelectedProject(project.id)}
            >
              <div className={`w-3 h-3 rounded-full ${project.color}`} />
              <span>{project.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          <div className="text-gray-400 text-sm font-medium mb-2">Sort By</div>
          <div className="space-y-1">
            <button
              className={`flex items-center space-x-3 w-full p-2 rounded ${
                sortOption === 'priority' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
              onClick={() => setSortOption('priority')}
            >
              <Flag className="w-5 h-5" />
              <span>Priority</span>
            </button>
            <button
              className={`flex items-center space-x-3 w-full p-2 rounded ${
                sortOption === 'date' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
              onClick={() => setSortOption('date')}
            >
              <CalendarDays className="w-5 h-5" />
              <span>Due Date</span>
            </button>
            <button
              className={`flex items-center space-x-3 w-full p-2 rounded ${
                sortOption === 'alphabetical' ? 'bg-gray-800' : 'hover:bg-gray-800'
              }`}
              onClick={() => setSortOption('alphabetical')}
            >
              <ArrowUpCircle className="w-5 h-5" />
              <span>Alphabetical</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {selectedProject === 'inbox' ? 'Inbox' : selectedProject === 'today' ? 'Today' : 'All Tasks'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{format(new Date(), 'EEEE, MMMM d')}</p>
        </header>

        <main className="px-6 py-4">
          {showSearch && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks... (ESC to close)"
                  className="flex-1 outline-none text-gray-700"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Add Todo Form */}
          <form onSubmit={addTodo} className="mb-6">
            <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-2">
              <Plus className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add task (Use #due YYYY-MM-DD, #p1-4 for priority, #project)"
                className="flex-1 outline-none text-gray-700"
              />
            </div>
          </form>

          {/* Todo List */}
          <div className="space-y-2">
            {filteredAndSortedTodos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  todo.completed ? 'bg-gray-50' : 'bg-white'
                } border border-gray-200 hover:border-gray-300 group`}
              >
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleTodo(todo.id)}
                    className={`focus:outline-none ${
                      todo.completed ? 'text-green-500' : 'text-gray-400'
                    } hover:text-green-600`}
                  >
                    {todo.completed ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                  <div>
                    <span
                      className={`text-sm ${
                        todo.completed ? 'text-gray-500 line-through' : 'text-gray-700'
                      }`}
                    >
                      {todo.text}
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      {todo.project && (
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{todo.project}</span>
                        </div>
                      )}
                      {todo.dueDate && (
                        <div className="flex items-center space-x-1">
                          <Clock className={`w-3 h-3 ${getDueDateColor(todo.dueDate)}`} />
                          <span className={`text-xs ${getDueDateColor(todo.dueDate)}`}>
                            {format(todo.dueDate, 'MMM d')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100">
                  <HeadlessMenu as="div" className="relative">
                    <HeadlessMenu.Button className="p-1 hover:bg-gray-100 rounded">
                      <Flag className={`w-4 h-4 ${getPriorityColor(todo.priority)}`} />
                    </HeadlessMenu.Button>
                  </HeadlessMenu>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAndSortedTodos.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <LayoutGrid className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">All clear</p>
              <p className="text-sm">Looks like everything's organized in the right place.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;