'use client';

import { useState } from 'react';
import Link from 'next/link';
import AddTaskModal from '@/components/dashboard/AddTaskModal';

interface Task {
    id: number;
    title: string;
    description: string;
    category: string;
    categoryColor: string;
    priority: 'urgent' | 'todo' | 'completed';
    dueDate?: string;
    dueTime?: string;
    location?: string;
    assignees?: string[];
}

export default function TasksPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All Categories');
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editTitle, setEditTitle] = useState('Call Fertilizer Vendor');
    const [editPriority, setEditPriority] = useState('urgent');
    const [showAllUrgent, setShowAllUrgent] = useState(false);
    const [showAllTodo, setShowAllTodo] = useState(false);
    const [showAllCompleted, setShowAllCompleted] = useState(false);

    const [tasks, setTasks] = useState<Task[]>([
        {
            id: 1,
            title: 'Repair North Tube Well',
            description: 'Pump motor making grinding noise. Need urgent inspection before evening watering cycle.',
            category: 'HIGH PRIORITY',
            categoryColor: 'orange',
            priority: 'urgent',
            dueDate: 'Due by 4:00 PM',
            location: 'North Field',
            assignees: ['user1', '+1']
        },
        {
            id: 2,
            title: 'Call Fertilizer Vendor',
            description: 'Contact vendor about bulk order',
            category: 'HIGH PRIORITY',
            categoryColor: 'orange',
            priority: 'urgent',
            dueDate: 'Due Today'
        },
        {
            id: 3,
            title: 'Check for Locusts',
            description: 'Routine scan of the wheat crop in Sector 4-B. Recent reports from neighbors.',
            category: 'CROP HEALTH',
            categoryColor: 'green',
            priority: 'todo',
            dueDate: 'Est: 2 Hours'
        },
        {
            id: 4,
            title: 'Submit Subsidy Papers',
            description: 'Finalize documents for the solar irrigation subsidy application at District Office.',
            category: 'ADMIN',
            categoryColor: 'blue',
            priority: 'todo',
            dueDate: 'Due: Friday'
        },
        {
            id: 5,
            title: 'Check Fertilizer Stock',
            description: 'Completed by Harpreet today at 9:45 AM',
            category: 'STOCK',
            categoryColor: 'gray',
            priority: 'completed'
        },
        {
            id: 6,
            title: 'Water North Field',
            description: 'Completed yesterday',
            category: 'IRRIGATION',
            categoryColor: 'gray',
            priority: 'completed'
        }
    ]);

    const getCategoryBg = (color: string) => {
        const colors: { [key: string]: string } = {
            orange: 'bg-orange-100 text-[#FF8A00] border-[#FF8A00]/20',
            green: 'bg-lime-100 text-primary border-primary/10',
            blue: 'bg-blue-100 text-blue-700 border-blue-200',
            gray: 'bg-gray-100 text-gray-500'
        };
        return colors[color] || colors.gray;
    };

    const handleCompleteTask = (taskId: number) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, priority: 'completed' as const } : task
            )
        );
    };

    const urgentTasks = tasks.filter(t => t.priority === 'urgent');
    const todoTasks = tasks.filter(t => t.priority === 'todo');
    const completedTasks = tasks.filter(t => t.priority === 'completed');

    const displayedUrgentTasks = showAllUrgent ? urgentTasks : urgentTasks.slice(0, 3);
    const displayedTodoTasks = showAllTodo ? todoTasks : todoTasks.slice(0, 3);
    const displayedCompletedTasks = showAllCompleted ? completedTasks : completedTasks.slice(0, 3);

    return (
        <div className="min-h-screen bg-background-light">
            <main className="min-h-screen overflow-y-auto p-4 md:p-6 lg:p-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary-dark tracking-tight">Task Management</h1>
                                <p className="text-sm md:text-base text-soil-dark font-medium mt-1">Organize your farm activities and daily routines.</p>
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="flex items-center justify-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-primary text-white font-bold rounded-xl shadow-floating hover:bg-primary-dark transition-all transform active:scale-95 text-sm md:text-base whitespace-nowrap"
                            >
                                <span className="material-symbols-outlined text-xl">add_circle</span>
                                New Task
                            </button>
                        </div>

                        {/* Search and Filters */}
                        <div className="bg-harvest-loam border-t border-white/60 shadow-soft-raised rounded-2xl p-3 md:p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                            <div className="relative flex-1">
                                <span className="material-symbols-outlined absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-soil-dark text-xl">search</span>
                                <input
                                    className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3 bg-[#f0eee4] border-none shadow-soft-inset rounded-xl focus:ring-2 focus:ring-lime-accent/50 transition-all outline-none text-sm md:text-base"
                                    placeholder="Search tasks, fields, or tools..."
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-3 md:gap-4">
                                {/* Categories Dropdown - Enhanced */}
                                <div className="relative flex-1 md:flex-none min-w-[160px] md:min-w-[200px]">
                                    <select
                                        className="w-full appearance-none bg-white border-none shadow-soft-raised rounded-xl py-2.5 md:py-3 pl-3 md:pl-4 pr-10 md:pr-12 font-bold text-soil-dark focus:ring-2 focus:ring-lime-accent/50 focus:shadow-floating transition-all outline-none text-sm md:text-base cursor-pointer hover:-translate-y-0.5"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option>All Categories</option>
                                        <option>Irrigation</option>
                                        <option>Pest Control</option>
                                        <option>Harvesting</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-primary pointer-events-none text-xl md:text-2xl">
                                        expand_more
                                    </span>
                                </div>

                                {/* More Filters Button - Enhanced */}
                                <button className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 bg-gradient-to-br from-primary to-primary-dark text-white font-bold rounded-xl shadow-[0_4px_0_rgba(26,54,23,0.9),0_8px_16px_rgba(44,89,38,0.3)] hover:shadow-[0_2px_0_rgba(26,54,23,0.9),0_4px_12px_rgba(44,89,38,0.4)] active:translate-y-1 active:shadow-[0_1px_0_rgba(26,54,23,0.9)] transition-all text-sm md:text-base whitespace-nowrap group">
                                    <span className="material-symbols-outlined text-lg md:text-xl group-hover:rotate-180 transition-transform duration-300">filter_list</span>
                                    <span className="hidden sm:inline">More Filters</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Kanban Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                        {/* Urgent Column */}
                        <div className="flex flex-col gap-4 md:gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-lg md:text-xl font-extrabold text-[#FF8A00] flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                                    Urgent
                                </h2>
                                <span className="bg-[#FF8A00]/10 text-[#FF8A00] px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-bold">{urgentTasks.length}</span>
                            </div>
                            {displayedUrgentTasks.map(task => (
                                editingTaskId === task.id ? (
                                    <InlineEditCard
                                        key={task.id}
                                        title={editTitle}
                                        setTitle={setEditTitle}
                                        priority={editPriority}
                                        setPriority={setEditPriority}
                                        onClose={() => setEditingTaskId(null)}
                                        onSave={() => setEditingTaskId(null)}
                                    />
                                ) : (
                                    <UrgentTaskCard
                                        key={task.id}
                                        task={task}
                                        getCategoryBg={getCategoryBg}
                                        onEdit={() => {
                                            setEditingTaskId(task.id);
                                            setEditTitle(task.title);
                                        }}
                                        onComplete={() => handleCompleteTask(task.id)}
                                    />
                                )
                            ))}
                            {urgentTasks.length > 3 && (
                                <button
                                    onClick={() => setShowAllUrgent(!showAllUrgent)}
                                    className="w-full py-3 text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-1 bg-white/50 hover:bg-white rounded-xl shadow-soft-raised hover:-translate-y-0.5"
                                >
                                    {showAllUrgent ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg">expand_less</span>
                                            Show Less
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                            View More ({urgentTasks.length - 3})
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* To Do Column */}
                        <div className="flex flex-col gap-4 md:gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-lg md:text-xl font-extrabold text-primary-dark flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
                                    To Do
                                </h2>
                                <span className="bg-primary/10 text-primary px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-bold">{todoTasks.length}</span>
                            </div>
                            {displayedTodoTasks.map(task => (
                                <TodoTaskCard
                                    key={task.id}
                                    task={task}
                                    getCategoryBg={getCategoryBg}
                                    onComplete={() => handleCompleteTask(task.id)}
                                />
                            ))}
                            {todoTasks.length > 3 && (
                                <button
                                    onClick={() => setShowAllTodo(!showAllTodo)}
                                    className="w-full py-3 text-sm font-bold text-primary hover:text-primary-dark transition-colors flex items-center justify-center gap-1 bg-white/50 hover:bg-white rounded-xl shadow-soft-raised hover:-translate-y-0.5"
                                >
                                    {showAllTodo ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg">expand_less</span>
                                            Show Less
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                            View More ({todoTasks.length - 3})
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Completed Column */}
                        <div className="flex flex-col gap-4 md:gap-6">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-lg md:text-xl font-extrabold text-soil-dark/60 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-xl md:text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                    Completed
                                </h2>
                                <span className="bg-gray-200 text-soil-dark px-2.5 md:px-3 py-0.5 md:py-1 rounded-full text-xs md:text-sm font-bold">12</span>
                            </div>
                            {displayedCompletedTasks.map(task => (
                                <CompletedTaskCard key={task.id} task={task} getCategoryBg={getCategoryBg} />
                            ))}
                            {completedTasks.length > 3 && (
                                <button
                                    onClick={() => setShowAllCompleted(!showAllCompleted)}
                                    className="w-full py-3 text-sm font-bold text-soil-dark/60 hover:text-primary transition-colors flex items-center justify-center gap-1 bg-white/50 hover:bg-white rounded-xl shadow-soft-raised hover:-translate-y-0.5"
                                >
                                    {showAllCompleted ? (
                                        <>
                                            <span className="material-symbols-outlined text-lg">expand_less</span>
                                            Show Less
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined text-lg">expand_more</span>
                                            View More ({completedTasks.length - 3})
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Voice Button */}
            <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
                <button className="relative flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-gradient-to-b from-primary to-primary-dark text-white shadow-floating transition-transform active:scale-95 border-4 border-lime-accent/30">
                    <div className="absolute inset-x-3 md:inset-x-4 top-1.5 md:top-2 h-1/2 rounded-full bg-white/20"></div>
                    <span className="material-symbols-outlined text-3xl md:text-4xl drop-shadow-md z-10">mic</span>
                </button>
            </div>

            {/* Add Task Modal */}
            <AddTaskModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
        </div>
    );
}

function InlineEditCard({ title, setTitle, priority, setPriority, onClose, onSave }: {
    title: string;
    setTitle: (v: string) => void;
    priority: string;
    setPriority: (v: string) => void;
    onClose: () => void;
    onSave: () => void;
}) {
    return (
        <div className="bg-[#f5fde4] shadow-[0_4px_12px_rgba(0,0,0,0.08)] rounded-2xl p-4 md:p-5 ring-2 ring-lime-accent">
            <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-wide">Inline Editing</span>
                    <button onClick={onClose} className="material-symbols-outlined text-primary-dark font-bold text-xl md:text-2xl hover:text-red-600 transition-colors">
                        close
                    </button>
                </div>
                <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-soil-dark uppercase mb-1 md:mb-1.5 px-1 tracking-wider">Task Title</label>
                    <input
                        className="w-full bg-[#f0eee4] border-none shadow-soft-inset rounded-xl py-2 md:py-2.5 px-3 md:px-4 text-sm md:text-base font-bold text-primary-dark focus:ring-2 focus:ring-lime-accent/50 transition-all outline-none"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-soil-dark uppercase mb-1 md:mb-1.5 px-1 tracking-wider">Priority Level</label>
                    <div className="grid grid-cols-3 gap-1.5 md:gap-2">
                        {['Low', 'Medium', 'Urgent'].map(level => (
                            <button
                                key={level}
                                onClick={() => setPriority(level.toLowerCase())}
                                className={`py-1.5 md:py-2 text-[10px] md:text-xs font-bold rounded-lg transition-all ${priority === level.toLowerCase()
                                    ? level === 'Urgent'
                                        ? 'bg-[#FF8A00] text-white shadow-[0_2px_8px_rgba(255,138,0,0.4)]'
                                        : 'bg-primary text-white shadow-[0_2px_8px_rgba(44,89,38,0.4)]'
                                    : 'bg-harvest-loam shadow-soft-raised text-soil-dark hover:-translate-y-0.5'
                                    }`}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
                <button
                    onClick={onSave}
                    className="w-full py-2.5 md:py-3 bg-gradient-to-b from-[#4d8f43] to-primary text-white font-bold rounded-xl text-xs md:text-sm shadow-[0_4px_0_#1a3617,0_8px_12px_rgba(44,89,38,0.3)] active:translate-y-1 active:shadow-[0_1px_0_#1a3617] transition-all"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}

function UrgentTaskCard({ task, getCategoryBg, onEdit, onComplete }: { task: Task; getCategoryBg: (color: string) => string; onEdit: () => void; onComplete: () => void }) {
    return (
        <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-2xl p-4 md:p-5">
            <div>
                <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider px-1.5 md:px-2 py-0.5 rounded shadow-sm border ${getCategoryBg(task.categoryColor)}`}>
                        {task.category}
                    </div>
                    <div className="flex gap-1.5 md:gap-2">
                        <button onClick={onEdit} className="text-soil-dark hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-base md:text-lg">edit</span>
                        </button>
                        <button className="text-soil-dark hover:text-red-500 transition-colors">
                            <span className="material-symbols-outlined text-base md:text-lg">delete</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                    <label className="relative flex items-center cursor-pointer pt-1">
                        <input
                            type="checkbox"
                            onChange={onComplete}
                            className="peer h-6 w-6 appearance-none rounded-md border-0 bg-[#e6e4dc] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] checked:bg-lime-accent checked:shadow-none focus:ring-0 transition-all cursor-pointer"
                        />
                        <span className="material-symbols-outlined absolute inset-0 text-primary-dark opacity-0 peer-checked:opacity-100 text-lg pointer-events-none flex items-center justify-center font-bold pt-1">check</span>
                    </label>
                    <div className="flex-1">
                        <h3 className="text-base md:text-lg font-extrabold text-primary-dark mb-1">{task.title}</h3>
                        <p className="text-xs md:text-sm text-soil-dark font-medium leading-snug">{task.description}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold text-soil-dark mb-3 md:mb-4">
                    {task.dueDate && (
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">schedule</span> {task.dueDate}
                        </span>
                    )}
                    {task.location && (
                        <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">location_on</span> {task.location}
                        </span>
                    )}
                </div>
                {task.assignees && (
                    <div className="flex -space-x-2">
                        {task.assignees.map((assignee, i) => (
                            <div
                                key={i}
                                className={`size-6 md:size-7 rounded-full border-2 border-white ${assignee.startsWith('+')
                                    ? 'bg-primary text-[9px] md:text-[10px] flex items-center justify-center text-white font-bold'
                                    : 'bg-cover'
                                    }`}
                                style={!assignee.startsWith('+') ? { backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB5_v_lniQz4XLFLkx3O3SeXzO_Vd6OB9PUYPojmux-I3GoGRPWmi8nSbcJqB7cWKvHsKMk0AyD1USWoxF7YsfgQyVHkGQjeNmdw0PR0Qi1wzn-frtFtoHACNhJiXyo8I7REszNvu-udHFbxLRDwTECoRY9bnVSKvnZhHpj2mU4s0rgVqHajBCUdg3GmLxAFMWSCgJF50CnNSZKZWHta7Ba7QWXeau-ssvkjFJMzWM1nN6JbYkzrl4ek9rB58CtkfVSOFTgTDHzGTFO')" } : undefined}
                            >
                                {assignee.startsWith('+') && assignee}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function TodoTaskCard({ task, getCategoryBg, onComplete }: { task: Task; getCategoryBg: (color: string) => string; onComplete: () => void }) {
    return (
        <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-2xl p-4 md:p-5 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-all cursor-grab">
            <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className={`text-[9px] md:text-[10px] font-black uppercase px-1.5 md:px-2 py-0.5 rounded border ${getCategoryBg(task.categoryColor)}`}>
                    {task.category}
                </div>
                <div className="flex gap-1.5 md:gap-2">
                    <button className="text-soil-dark hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-base md:text-lg">edit</span>
                    </button>
                    <button className="text-soil-dark hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-base md:text-lg">delete</span>
                    </button>
                </div>
            </div>
            <div className="flex items-start gap-3 md:gap-4 mb-3 md:mb-4">
                <label className="relative flex items-center cursor-pointer pt-1">
                    <input
                        type="checkbox"
                        onChange={onComplete}
                        className="peer h-6 w-6 appearance-none rounded-md border-0 bg-[#e6e4dc] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] checked:bg-lime-accent checked:shadow-none focus:ring-0 transition-all cursor-pointer"
                    />
                    <span className="material-symbols-outlined absolute inset-0 text-primary-dark opacity-0 peer-checked:opacity-100 text-lg pointer-events-none flex items-center justify-center font-bold pt-1">check</span>
                </label>
                <div className="flex-1">
                    <h3 className="text-base md:text-lg font-bold text-primary-dark mb-1.5 md:mb-2">{task.title}</h3>
                    <p className="text-xs md:text-sm text-soil-dark">{task.description}</p>
                </div>
            </div>
            <div className="pt-2 md:pt-3 border-t border-black/5 flex items-center justify-between">
                <span className="text-[10px] md:text-[11px] font-bold text-primary">{task.dueDate}</span>
                <span className="material-symbols-outlined text-soil-dark text-lg md:text-xl">drag_indicator</span>
            </div>
        </div>
    );
}

function CompletedTaskCard({ task, getCategoryBg }: { task: Task; getCategoryBg: (color: string) => string }) {
    return (
        <div className="bg-gray-50 shadow-[0_2px_8px_rgba(0,0,0,0.08)] rounded-2xl p-4 md:p-5 opacity-60 grayscale-[0.5]">
            <div className="flex justify-between items-start mb-2 md:mb-3">
                <div className={`text-[9px] md:text-[10px] font-black uppercase px-1.5 md:px-2 py-0.5 rounded ${getCategoryBg(task.categoryColor)}`}>
                    {task.category}
                </div>
                <span className="material-symbols-outlined text-primary font-bold text-lg md:text-xl">task_alt</span>
            </div>
            <h3 className="text-base md:text-lg font-bold text-soil-dark line-through mb-1">{task.title}</h3>
            <p className="text-[10px] md:text-xs text-soil-dark font-medium">{task.description}</p>
        </div>
    );
}
