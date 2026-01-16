import React from 'react';
import { Sidebar, MenuKey } from './Sidebar';
import { PresetBar } from './PresetBar';
import { motion, AnimatePresence } from 'motion/react';

interface MainLayoutProps {
    children: React.ReactNode;
    activeMenu: MenuKey;
    onMenuChange: (key: MenuKey) => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
    isPresetBarOpen: boolean;
    onPresetBarToggle: () => void;
    title: string;
}

export function MainLayout({
    children,
    activeMenu,
    onMenuChange,
    theme,
    onThemeToggle,
    isPresetBarOpen,
    onPresetBarToggle,
    title
}: MainLayoutProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300 font-sans">
            <Sidebar
                activeMenu={activeMenu}
                onMenuChange={onMenuChange}
                theme={theme}
                onThemeToggle={onThemeToggle}
            />

            <main className="flex-1 relative overflow-y-auto bg-background/50 flex flex-col">
                <header className="h-16 flex items-center px-8 border-b border-border/50 sticky top-0 z-10 glass">
                    <h2 className="text-xl font-semibold tracking-tight">
                        {title}
                    </h2>
                </header>

                <div className="flex-1 p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeMenu}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-5xl mx-auto h-full"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <PresetBar
                isOpen={isPresetBarOpen}
                onToggle={onPresetBarToggle}
            />
        </div>
    );
}
