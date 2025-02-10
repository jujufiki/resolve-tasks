import React, { useState } from 'react';

type Length = 'Long' | 'Medium' | 'Short' | 'Micro';
type Category = 'Work' | 'Passions' | 'Self' | 'Others';
type Tab = 'Now' | 'Holding' | 'Not Right Now';
type PullMode = 'Category' | 'Length' | 'Chaos';

interface Task {
  id: string;
  title: string;
  length: Length;
  category: Category;
  unresolvedCount: number;
}

export default function TaskManager() {
  const [activeTab, setActiveTab] = useState<Tab>('Now');
  const [nowTasks, setNowTasks] = useState<Task[]>([]);
  const [holdingTasks, setHoldingTasks] = useState<Task[]>([]);
  const [notRightNowTasks, setNotRightNowTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedLength, setSelectedLength] = useState<Length>('Short');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Work');
  const [pullMode, setPullMode] = useState<PullMode>('Category');

  const findMatchingTask = (tasks: Task[], referenceTask: Task): Task | null => {
    switch (pullMode) {
      case 'Category':
        return tasks.find(t => t.category === referenceTask.category) || tasks[0];
      case 'Length':
        return tasks.find(t => t.length === referenceTask.length) || tasks[0];
      case 'Chaos':
        return tasks[Math.floor(Math.random() * tasks.length)];
      default:
        return tasks[0];
    }
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: Math.random().toString(),
      title: newTaskTitle.trim(),
      length: selectedLength,
      category: selectedCategory,
      unresolvedCount: 0
    };

    if (nowTasks.length < 5) {
      setNowTasks(prev => [...prev, newTask]);
    } else {
      setHoldingTasks(prev => [...prev, newTask]);
    }
    setNewTaskTitle('');
  };

  const dismissTask = async (taskId: string, resolved: boolean) => {
    const task = nowTasks.find(t => t.id === taskId);
    if (!task) return;

    // Create a copy of the current Now tasks
    const updatedNowTasks = [...nowTasks];
    const taskIndex = updatedNowTasks.findIndex(t => t.id === taskId);
    
    // Handle unresolved tasks
    if (!resolved) {
      const updatedTask = { ...task, unresolvedCount: task.unresolvedCount + 1 };
      if (updatedTask.unresolvedCount >= 2) {
        setNotRightNowTasks(prev => [...prev, updatedTask]);
      } else {
        setHoldingTasks(prev => [...prev, updatedTask]);
      }
    }

    // Find replacement task
    let replacementTask: Task | null = null;
    
    if (holdingTasks.length > 0) {
      const nextTask = findMatchingTask(holdingTasks, task);
      if (nextTask) {
        replacementTask = nextTask;
        setHoldingTasks(prev => prev.filter(t => t.id !== nextTask.id));
      }
    } else if (notRightNowTasks.length > 0) {
      const nextTask = findMatchingTask(notRightNowTasks, task);
      if (nextTask) {
        replacementTask = { ...nextTask, unresolvedCount: 0 };
        setNotRightNowTasks(prev => prev.filter(t => t.id !== nextTask.id));
      }
    }

    // Update the task at the specific index
    if (replacementTask) {
      updatedNowTasks[taskIndex] = replacementTask;
    } else {
      updatedNowTasks.splice(taskIndex, 1);
    }
    
    setNowTasks(updatedNowTasks);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Task</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Task title"
            className="flex-1 p-2 border rounded"
          />
          <select
            value={selectedLength}
            onChange={(e) => setSelectedLength(e.target.value as Length)}
            className="p-2 border rounded"
          >
            {['Long', 'Medium', 'Short', 'Micro'].map(length => (
              <option key={length} value={length}>{length}</option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as Category)}
            className="p-2 border rounded"
          >
            {['Work', 'Passions', 'Self', 'Others'].map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <button
            onClick={addTask}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        <div className="flex gap-2 items-center text-sm text-gray-600">
          <span>Pull Mode:</span>
          {(['Category', 'Length', 'Chaos'] as PullMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setPullMode(mode)}
              className={`px-3 py-1 rounded ${
                pullMode === mode 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 border-b">
        <div className="flex gap-4">
          {['Now', 'Holding', 'Not Right Now'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as Tab)}
              className={`py-2 px-4 -mb-px ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 font-semibold'
                  : 'text-gray-500'
              }`}
            >
              {tab}
              {tab === 'Now' && ` (${nowTasks.length}/5)`}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'Now' && (
        <div className="space-y-2">
          {nowTasks.map(task => (
            <div key={task.id} className="p-4 border rounded flex justify-between items-center">
              <div>
                <span className="font-medium">{task.title}</span>
                <div className="text-sm text-gray-600">
                  {task.length} • {task.category}
                </div>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => dismissTask(task.id, true)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  Resolved
                </button>
                <button
                  onClick={() => dismissTask(task.id, false)}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                  Unresolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Holding' && (
        <div className="space-y-2">
          {holdingTasks.map(task => (
            <div key={task.id} className="p-4 border rounded">
              <span className="font-medium">{task.title}</span>
              <div className="text-sm text-gray-600">
                {task.length} • {task.category} • Unresolved {task.unresolvedCount} time(s)
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'Not Right Now' && (
        <div className="space-y-2">
          {notRightNowTasks.map(task => (
            <div key={task.id} className="p-4 border rounded">
              <span className="font-medium">{task.title}</span>
              <div className="text-sm text-gray-600">
                {task.length} • {task.category}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
