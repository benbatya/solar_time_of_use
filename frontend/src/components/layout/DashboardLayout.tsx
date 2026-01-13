
import React from 'react';
import { LayoutDashboard, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const location = useLocation();

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <nav className="border-b border-slate-800 bg-slate-950 p-4 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <LayoutDashboard className="text-blue-500" />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                                SolarTimeOfUse
                            </h1>
                        </Link>

                        <div className="flex items-center gap-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
                            <Link
                                to="/"
                                className={clsx(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                                    location.pathname === "/" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                                )}
                            >
                                <LayoutDashboard size={16} />
                                Dashboard
                            </Link>
                            <Link
                                to="/settings"
                                className={clsx(
                                    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                                    location.pathname === "/settings" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
                                )}
                            >
                                <Settings size={16} />
                                Settings
                            </Link>
                        </div>
                    </div>

                    <div className="text-sm text-slate-400">
                        System Status: <span className="text-green-400">Online</span>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto p-4 md:p-6 lg:p-8">
                {children}
            </main>
        </div>
    );
};
