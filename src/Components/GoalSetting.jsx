import { useState, useEffect } from 'react';
import { getTimestamp } from '../utils/Constants';

const GoalSetting = () => {
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    category: 'general',
    targetDate: '',
    priority: 'medium'
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const categories = [
    { id: 'general', label: 'General Wellness', color: 'bg-blue-500' },
    { id: 'emotional', label: 'Emotional Health', color: 'bg-purple-500' },
    { id: 'relationships', label: 'Relationships', color: 'bg-pink-500' },
    { id: 'career', label: 'Career/Work', color: 'bg-green-500' },
    { id: 'personal', label: 'Personal Growth', color: 'bg-yellow-500' },
    { id: 'health', label: 'Physical Health', color: 'bg-red-500' }
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: 'text-gray-500' },
    { id: 'medium', label: 'Medium', color: 'text-blue-500' },
    { id: 'high', label: 'High', color: 'text-red-500' }
  ];

  // Load goals from localStorage on component mount
  useEffect(() => {
    const savedGoals = localStorage.getItem('therapyApp_goals');
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save goals to localStorage whenever goals change
  useEffect(() => {
    localStorage.setItem('therapyApp_goals', JSON.stringify(goals));
  }, [goals]);

  const handleAddGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal = {
      id: Date.now(),
      ...newGoal,
      status: 'active',
      progress: 0,
      milestones: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };

    setGoals(prev => [goal, ...prev]);
    setNewGoal({
      title: '',
      description: '',
      category: 'general',
      targetDate: '',
      priority: 'medium'
    });
    setShowAddForm(false);
  };

  const handleUpdateGoal = () => {
    if (!editingGoal || !editingGoal.title.trim()) return;

    setGoals(prev => prev.map(goal => 
      goal.id === editingGoal.id 
        ? { ...goal, ...editingGoal, lastUpdated: new Date().toISOString() }
        : goal
    ));
    setEditingGoal(null);
  };

  const handleDeleteGoal = (id) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const updateProgress = (id, progress) => {
    setGoals(prev => prev.map(goal => 
      goal.id === id 
        ? { ...goal, progress: Math.max(0, Math.min(100, progress)), lastUpdated: new Date().toISOString() }
        : goal
    ));
  };

  const addMilestone = (goalId, milestone) => {
    if (!milestone.trim()) return;

    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            milestones: [...goal.milestones, {
              id: Date.now(),
              text: milestone,
              completed: false,
              createdAt: new Date().toISOString()
            }],
            lastUpdated: new Date().toISOString()
          }
        : goal
    ));
  };

  const toggleMilestone = (goalId, milestoneId) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { 
            ...goal, 
            milestones: goal.milestones.map(milestone => 
              milestone.id === milestoneId 
                ? { ...milestone, completed: !milestone.completed }
                : milestone
            ),
            lastUpdated: new Date().toISOString()
          }
        : goal
    ));
  };

  const getGoalStats = () => {
    const total = goals.length;
    const completed = goals.filter(goal => goal.progress === 100).length;
    const active = goals.filter(goal => goal.status === 'active').length;
    const overdue = goals.filter(goal => {
      if (!goal.targetDate) return false;
      return new Date(goal.targetDate) < new Date() && goal.progress < 100;
    }).length;

    return { total, completed, active, overdue };
  };

  const stats = getGoalStats();

  return (
    <div className="px-4 py-6 md:max-w-6xl md:mx-auto md:p-6">
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">Goals</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md min-h-[44px] flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="hidden sm:inline">Add Goal</span>
          </button>
        </div>
        <p className="text-gray-600 text-sm md:text-base">Set and track your personal development goals</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 md:p-6 text-center transform hover:scale-105 transition-all duration-200">
          <div className="text-xl md:text-2xl font-bold text-blue-600 mb-1">{stats.total}</div>
          <div className="text-xs md:text-sm text-gray-600 font-medium">Total Goals</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 md:p-6 text-center transform hover:scale-105 transition-all duration-200">
          <div className="text-xl md:text-2xl font-bold text-green-600 mb-1">{stats.completed}</div>
          <div className="text-xs md:text-sm text-gray-600 font-medium">Completed</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 md:p-6 text-center transform hover:scale-105 transition-all duration-200">
          <div className="text-xl md:text-2xl font-bold text-yellow-600 mb-1">{stats.active}</div>
          <div className="text-xs md:text-sm text-gray-600 font-medium">Active</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 md:p-6 text-center transform hover:scale-105 transition-all duration-200">
          <div className="text-xl md:text-2xl font-bold text-red-600 mb-1">{stats.overdue}</div>
          <div className="text-xs md:text-sm text-gray-600 font-medium">Overdue</div>
        </div>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 md:p-8 mb-6 md:mb-8 animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900">Add New Goal</h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  placeholder="What do you want to achieve?"
                  className="w-full p-3 md:p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newGoal.category}
                  onChange={(e) => setNewGoal({...newGoal, category: e.target.value})}
                  className="w-full p-3 md:p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-base"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <input
                  type="date"
                  value={newGoal.targetDate}
                  onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                  className="w-full p-3 md:p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal({...newGoal, priority: e.target.value})}
                  className="w-full p-3 md:p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-base"
                >
                  {priorities.map(priority => (
                    <option key={priority.id} value={priority.id}>{priority.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                placeholder="Describe your goal in detail..."
                className="w-full p-3 md:p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none text-base"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGoal}
                className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4 md:space-y-6">
        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 md:p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No goals yet</h3>
            <p className="text-gray-500 text-sm md:text-base">Start by adding your first goal to begin tracking your progress</p>
          </div>
        ) : (
          goals.map((goal, index) => (
            <div 
              key={goal.id} 
              className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 md:p-8 transform hover:scale-[1.02] transition-all duration-200 animate-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {editingGoal?.id === goal.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                      <input
                        type="text"
                        value={editingGoal.title}
                        onChange={(e) => setEditingGoal({...editingGoal, title: e.target.value})}
                        className="w-full p-3 md:p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={editingGoal.category}
                        onChange={(e) => setEditingGoal({...editingGoal, category: e.target.value})}
                        className="w-full p-3 md:p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 text-base"
                      >
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={editingGoal.description}
                      onChange={(e) => setEditingGoal({...editingGoal, description: e.target.value})}
                      className="w-full p-3 md:p-4 border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 resize-none text-base"
                      rows="3"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setEditingGoal(null)}
                      className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateGoal}
                      className="px-6 py-3 bg-blue-500 text-white rounded-2xl font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900 truncate">{goal.title}</h3>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full text-white ${
                          categories.find(cat => cat.id === goal.category)?.color || 'bg-gray-500'
                        }`}>
                          {categories.find(cat => cat.id === goal.category)?.label}
                        </span>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          goal.priority === 'high' ? 'bg-red-100 text-red-700' :
                          goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {priorities.find(p => p.id === goal.priority)?.label}
                        </span>
                      </div>
                      {goal.description && (
                        <p className="text-gray-600 mb-3 text-sm md:text-base leading-relaxed">{goal.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-gray-500">
                        <span>Created {new Date(goal.createdAt).toLocaleDateString()}</span>
                        {goal.targetDate && (
                          <span>Target {new Date(goal.targetDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1 ml-4">
                      <button
                        onClick={() => setEditingGoal(goal)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-900">Progress</span>
                      <span className="text-sm font-bold text-blue-600">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => updateProgress(goal.id, goal.progress - 10)}
                        className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      >
                        -10%
                      </button>
                      <button
                        onClick={() => updateProgress(goal.id, goal.progress + 10)}
                        className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
                      >
                        +10%
                      </button>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Milestones</h4>
                    <div className="space-y-3 mb-4">
                      {goal.milestones.map(milestone => (
                        <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-200/50">
                          <button
                            onClick={() => toggleMilestone(goal.id, milestone.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                              milestone.completed 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {milestone.completed && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <span className={`text-sm flex-1 ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                            {milestone.text}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Add a milestone..."
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addMilestone(goal.id, e.target.value);
                            e.target.value = '';
                          }
                        }}
                        className="flex-1 p-3 text-sm border border-gray-200 rounded-2xl bg-gray-50/50 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
                      />
                      <button
                        onClick={(e) => {
                          const input = e.target.previousElementSibling;
                          addMilestone(goal.id, input.value);
                          input.value = '';
                        }}
                        className="px-4 py-3 bg-blue-500 text-white rounded-2xl text-sm font-medium hover:bg-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GoalSetting;
