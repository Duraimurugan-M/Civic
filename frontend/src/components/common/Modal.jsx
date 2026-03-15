import { motion, AnimatePresence } from 'framer-motion';

export default function Modal({ open, onClose, title, children, size='md' }) {
  const widths = { sm:'max-w-sm', md:'max-w-lg', lg:'max-w-2xl', xl:'max-w-4xl' };
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{opacity:0, y:60}}
            animate={{opacity:1, y:0}}
            exit={{opacity:0, y:60}}
            transition={{type:'spring', stiffness:300, damping:30}}
            className={`relative bg-white w-full ${widths[size]}
              rounded-t-3xl sm:rounded-2xl shadow-modal max-h-[90vh] overflow-y-auto z-10`}>
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl z-10">
              {/* Mobile handle */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-200 rounded-full sm:hidden" />
              <h2 className="text-base font-bold text-slate-800 mt-1 sm:mt-0">{title}</h2>
              <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 text-sm">✕</button>
            </div>
            <div className="px-5 sm:px-6 py-5">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
