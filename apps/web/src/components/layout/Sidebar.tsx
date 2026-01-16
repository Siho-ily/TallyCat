import { cn } from '../../lib/utils'

export type MenuKey = 'history' | 'categories' | 'automation' | 'settings' | 'guide';

interface SidebarProps {
    activeMenu: MenuKey;
    onMenuChange: (key: MenuKey) => void;
    theme: 'light' | 'dark';
    onThemeToggle: () => void;
}

const menuItems = [
    { key: 'history', label: '매출/비용 내역', icon: '📊' },
    { key: 'categories', label: '카테고리 관리', icon: '🏷️' },
    { key: 'automation', label: '자동화', icon: '⚡' },
    { key: 'settings', label: '설정', icon: '⚙️' },
    { key: 'guide', label: '가이드', icon: '📖' },
];

export function Sidebar({ activeMenu, onMenuChange, theme, onThemeToggle }: SidebarProps) {
    return (
        <aside className="w-64 glass flex flex-col border-r border-border shrink-0 z-20">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent italic">
                    TallyCat
                </h1>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => onMenuChange(item.key as MenuKey)}
                        className={cn(
                            "w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group",
                            activeMenu === item.key
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <span className="text-xl mr-3">{item.icon}</span>
                        <span className="font-medium text-sm">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <button
                    onClick={onThemeToggle}
                    className="w-full p-2 rounded-lg hover:bg-muted transition-colors flex items-center justify-center gap-2 text-xs text-muted-foreground"
                >
                    {theme === 'dark' ? '🌙 다크 모드' : '☀️ 라이트 모드'}
                </button>
            </div>
        </aside>
    );
}
