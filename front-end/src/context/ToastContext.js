"use client";

import { createContext, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const removeToast = (id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    };

    const pushToast = ({ title, description, tone = "neutral" }) => {
        const id = ++toastId;

        setToasts((current) => [
            ...current,
            {
                id,
                title,
                description,
                tone,
            },
        ]);

        window.setTimeout(() => removeToast(id), 2800);
    };

    const value = useMemo(() => ({ pushToast, removeToast }), []);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-3 sm:right-6 sm:top-6 sm:w-full">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto panel-soft transform overflow-hidden border-l-4 p-4 shadow-2xl transition duration-300 animate-[toast-in_0.22s_ease-out] ${
                            toast.tone === "success"
                                ? "border-l-emerald-500"
                                : toast.tone === "error"
                                ? "border-l-rose-500"
                                : "border-l-slate-900"
                        }`}
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
                                {toast.description ? (
                                    <p className="mt-1 text-sm leading-6 text-slate-600">{toast.description}</p>
                                ) : null}
                            </div>

                            <button
                                type="button"
                                onClick={() => removeToast(toast.id)}
                                className="rounded-full px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                aria-label="Dismiss notification"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }

    return context;
}