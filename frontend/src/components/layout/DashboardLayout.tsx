import React from 'react';
import { LayoutDashboard, Zap, Battery, Sun } from 'lucide-react';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <nav className="border-b border-slate-800 bg-slate-950 p-4 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutDashboard className="text-blue-500" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                            SolarTimeOfUse
                        </h1>
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
