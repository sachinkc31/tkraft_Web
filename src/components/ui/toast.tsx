"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { useUIStore } from "@/store";

export function Toast() {
  const { toast, clearToast } = useUIStore();

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-[hsl(142,71%,45%)]" />,
    error: <XCircle className="h-5 w-5 text-[hsl(0,72%,51%)]" />,
    info: <Info className="h-5 w-5 text-[hsl(199,89%,48%)]" />,
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 bg-white shadow-xl rounded-2xl border border-[hsl(214,13%,90%)] max-w-sm w-full"
        >
          {icons[toast.type]}
          <p className="text-sm font-medium text-[hsl(222,47%,11%)] flex-1">{toast.message}</p>
          <button onClick={clearToast} className="text-[hsl(215,14%,70%)] hover:text-[hsl(215,16%,47%)]">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
