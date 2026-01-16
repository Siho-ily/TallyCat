import { useState, useEffect } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { MenuKey } from './components/layout/Sidebar'

function App() {
    const [activeMenu, setActiveMenu] = useState<MenuKey>('history');
    const [isPresetBarOpen, setIsPresetBarOpen] = useState(true);
    const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');

    // 테마 적용 (시스템 설정 또는 사용자 선택)
    useEffect(() => {
        const root = window.document.documentElement;
        const actualTheme = theme === 'system'
            ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : theme;

        root.classList.remove('light', 'dark');
        root.classList.add(actualTheme);
        root.setAttribute('data-font-size', 'medium');
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
    };

    const menuTitleMap: Record<MenuKey, string> = {
        history: '매출/비용 내역',
        categories: '카테고리 관리',
        automation: '자동화',
        settings: '설정',
        guide: '가이드'
    };

    return (
        <MainLayout
            activeMenu={activeMenu}
            onMenuChange={setActiveMenu}
            theme={theme === 'system' ? 'dark' : theme} // UI 표시용
            onThemeToggle={handleThemeToggle}
            isPresetBarOpen={isPresetBarOpen}
            onPresetBarToggle={() => setIsPresetBarOpen(!isPresetBarOpen)}
            title={menuTitleMap[activeMenu]}
        >
            {/* 각 메뉴별 콘텐츠 렌더링 섹션 */}
            <div className="h-full flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-3xl text-muted-foreground bg-muted/20">
                <div className="text-4xl mb-4 italic opacity-20 font-bold">TallyCat</div>
                <p className="text-lg"><strong>{menuTitleMap[activeMenu]}</strong> 페이지를 준비 중입니다.</p>
                <div className="mt-6 flex gap-3">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">SQLite Interface</span>
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium border border-accent/20">Reactive UI</span>
                </div>
            </div>
        </MainLayout>
    )
}

export default App
