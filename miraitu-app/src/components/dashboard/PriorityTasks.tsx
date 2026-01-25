'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Task {
    id: number;
    text: string;
    subtext: string;
    urgent?: boolean;
    completed: boolean;
}

export default function PriorityTasks() {
    const [tasks, setTasks] = useState<Task[]>([
        { id: 1, text: 'Water North Field', subtext: 'Due: 2:00 PM', completed: false },
        { id: 2, text: 'Call Distributor', subtext: 'Urgent • Due: 4:00 PM', urgent: true, completed: false },
        { id: 3, text: 'Check Fertilizer Stock', subtext: 'Completed', completed: true },
    ]);

    const toggleTask = (id: number) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    return (
        <div className="col-span-1 lg:col-span-4 rounded-2xl bg-harvest-loam p-1 shadow-soft-raised border border-[#e0e5df] flex flex-col">
            <div className="bg-[#fbfbf7] rounded-xl flex-1 flex flex-col p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-primary-dark flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">task_alt</span>
                        Priority Tasks
                    </h3>
                    <Link href="/tasks" className="text-sm font-bold text-primary hover:underline">
                        View All
                    </Link>
                </div>

                <div className="flex flex-col gap-4">
                    {tasks.map((task) => (
                        <label key={task.id} className="group flex items-start gap-4 cursor-pointer select-none">
                            <div className="relative flex items-center pt-1">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => toggleTask(task.id)}
                                    className="peer h-6 w-6 appearance-none rounded-md border-0 bg-[#e6e4dc] shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1)] checked:bg-lime-accent checked:shadow-none focus:ring-0 transition-all"
                                />
                                <span className="material-symbols-outlined absolute inset-0 text-primary-dark opacity-0 peer-checked:opacity-100 text-lg pointer-events-none flex items-center justify-center font-bold pt-1">check</span>
                            </div>
                            <div className="flex flex-col group-hover:-translate-y-0.5 transition-transform">
                                <span
                                    className={`text-base font-bold text-forest-charcoal transition-all ${task.completed ? 'line-through opacity-50' : ''
                                        }`}
                                >
                                    {task.text}
                                </span>
                                <span className={`text-sm font-medium ${task.urgent ? 'text-red-600' : 'text-primary'}`}>
                                    {task.subtext}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}
