import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../../lib/utils'

interface PresetBarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function PresetBar({ isOpen, onToggle }: PresetBarProps) {
    return (
        <motion.aside
            layout
            initial={false}
            animate={{ width: isOpen ? 300 : 64 }}
            className="glass border-l border-border relative flex flex-col shrink-0 z-20"
        >
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute -left-3 top-8 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform z-30"
            >
                {isOpen ? '→' : '←'}
            </button>

            <div className={cn("flex-1 flex flex-col overflow-hidden", !isOpen && "items-center")}>
                <div className="p-6 border-b border-border h-20 flex items-center">
                    <AnimatePresence>
                        {isOpen && (
                            <motion.h3
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="font-bold whitespace-nowrap text-sm"
                            >
                                빠른 실행 (프리셋)
                            </motion.h3>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <button
                            key={i}
                            className={cn(
                                "w-full rounded-2xl flex items-center transition-all active:scale-95",
                                isOpen ? "p-4 glass hover:shadow-lg" : "p-3 justify-center"
                            )}
                            style={{
                                borderLeft: isOpen ? `4px solid hsl(var(--primary))` : '',
                                backgroundColor: isOpen ? '' : 'hsl(var(--primary))',
                                color: isOpen ? '' : 'white'
                            }}
                        >
                            {isOpen ? (
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-sm">식비 (카드)</span>
                                    <span className="text-[10px] text-muted-foreground italic">8,000원 | 점심 식사</span>
                                </div>
                            ) : (
                                <span className="font-bold text-xs">食</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-border bg-muted/30">
                    <button className={cn(
                        "w-full py-3 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity whitespace-nowrap text-xs",
                        !isOpen && "p-2"
                    )}>
                        {isOpen ? '프리셋 수정 모드' : '✏️'}
                    </button>
                </div>
            </div>
        </motion.aside>
    );
}
