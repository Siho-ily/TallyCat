import { useState } from 'react'
import { motion } from 'motion/react'

function App() {
    const [count, setCount] = useState(0)

    return (
        <div className="min-h-screen bg-neutral-900 text-white flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-6"
            >
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    TallyCat
                </h1>
                <p className="text-neutral-400">Secure. Offline. Local.</p>

                <div className="p-6 bg-neutral-800 rounded-xl border border-neutral-700 shadow-xl">
                    <button
                        onClick={() => setCount((count) => count + 1)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
                    >
                        Count is {count}
                    </button>
                </div>
            </motion.div>
        </div>
    )
}

export default App
