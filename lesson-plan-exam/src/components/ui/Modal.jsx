import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {children}
                </div>
            </div>
        </div>
    );
};
