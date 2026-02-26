import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LogOut, CheckSquare, LayoutDashboard, CalendarDays, Settings } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface SidebarProps {
    role?: 'user' | 'admin';
    name?: string;
    batch?: 1 | 2;
}

export function Sidebar({ role = 'user', name = 'User', batch = 1 }: SidebarProps) {
    const router = useRouter();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 text-white p-4 flex flex-col shadow-xl">
            <div className="flex items-center gap-2 px-2 py-4 mb-8">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center font-bold">W</div>
                <span className="font-semibold text-lg tracking-tight">Wissen Seats</span>
            </div>

            <div className="px-4 mb-6">
                <p className="text-sm font-medium text-slate-300">{name}</p>
                <p className="text-xs text-slate-500 capitalize">{role} • Batch {batch}</p>
            </div>

            <nav className="flex-1 space-y-2">
                {role === 'user' && (
                    <>
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                            <CheckSquare size={18} />
                            <span>Book Seat</span>
                        </Link>
                    </>
                )}

                {role === 'admin' && (
                    <>
                        <Link href="/admin" className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
                            <LayoutDashboard size={18} />
                            <span>Overview</span>
                        </Link>
                    </>
                )}
            </nav>

            <div className="mt-auto">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
                    onClick={handleLogout}
                >
                    <LogOut size={18} className="mr-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
