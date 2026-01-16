import React, { useState } from 'react';
import { CreateEventFormData } from '../types';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: CreateEventFormData) => void;
}

const COLORS = [
  { name: '日落 (Sunset)', value: 'from-orange-500 to-red-500' },
  { name: '海洋 (Ocean)', value: 'from-blue-500 to-cyan-500' },
  { name: '森林 (Forest)', value: 'from-emerald-500 to-green-500' },
  { name: '浆果 (Berry)', value: 'from-pink-500 to-rose-500' },
  { name: '皇家 (Royal)', value: 'from-violet-500 to-purple-500' },
  { name: '鎏金 (Gold)', value: 'from-yellow-400 to-amber-500' },
];

const AddEventModal: React.FC<AddEventModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<CreateEventFormData>({
    title: '',
    date: '',
    time: '00:00',
    color: COLORS[0].value
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) return;
    onAdd(formData);
    onClose();
    // Reset form
    setFormData({ title: '', date: '', time: '00:00', color: COLORS[0].value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-xl font-bold text-white tracking-tight">Create Countdown</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Event Title</label>
            <input
              type="text"
              placeholder="e.g. Project Launch"
              className="w-full glass-input rounded-xl px-4 py-3.5 text-white placeholder-slate-500 focus:outline-none transition-all"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Date</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5 pointer-events-none" />
                <input
                  type="date"
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none transition-all [color-scheme:dark]"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Time</label>
              <div className="relative">
                <Clock className="absolute left-3.5 top-3.5 text-slate-500 w-5 h-5 pointer-events-none" />
                <input
                  type="time"
                  className="w-full glass-input rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none transition-all [color-scheme:dark]"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Theme Color Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Theme Color</label>
            <div className="grid grid-cols-6 gap-3">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`relative group w-full aspect-square rounded-full transition-all duration-300 flex items-center justify-center
                    ${formData.color === color.value ? 'ring-2 ring-white scale-110 shadow-lg shadow-white/20' : 'hover:scale-105 opacity-80 hover:opacity-100'}`}
                  title={color.name}
                >
                  <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${color.value}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 transition-all shadow-lg shadow-primary-500/25 active:scale-[0.98] border border-white/10"
            >
              Start Countdown
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;