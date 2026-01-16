import React, { useState, useMemo } from 'react';
import { CountdownEvent, TimeUnit } from '../types';
import { Trash2, Calendar, Info } from 'lucide-react';

interface CountdownCardProps {
  event: CountdownEvent;
  now: number;
  onDelete?: (id: string) => void;
}

const CountdownCard: React.FC<CountdownCardProps> = ({ event, now, onDelete }) => {
  const [unit, setUnit] = useState<TimeUnit>(TimeUnit.DAYS);

  const targetTime = useMemo(() => new Date(event.date).getTime(), [event.date]);
  const diff = Math.max(0, targetTime - now);

  const displayValue = useMemo(() => {
    switch (unit) {
      case TimeUnit.DAYS:
        return (diff / (1000 * 60 * 60 * 24)).toFixed(1);
      case TimeUnit.HOURS:
        return (diff / (1000 * 60 * 60)).toFixed(1);
      case TimeUnit.MINUTES:
        return Math.floor(diff / (1000 * 60)).toLocaleString();
      case TimeUnit.SECONDS:
        return Math.floor(diff / 1000).toLocaleString();
      default:
        return "0";
    }
  }, [diff, unit]);

  const unitLabel = useMemo(() => {
    switch (unit) {
      case TimeUnit.DAYS: return '天';
      case TimeUnit.HOURS: return '小时';
      case TimeUnit.MINUTES: return '分钟';
      case TimeUnit.SECONDS: return '秒';
    }
  }, [unit]);

  // Determine if date is passed
  const isPast = diff <= 0;

  return (
    <div className="glass-card relative group overflow-hidden rounded-2xl hover:transform hover:-translate-y-1 transition-all duration-500 h-full flex flex-col">
      {/* Dynamic Background Glow */}
      <div className={`absolute -inset-20 bg-gradient-to-br ${event.color} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700`} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-4 flex flex-col h-full z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 pr-2">
            <div className="flex items-center gap-2 mb-1">
              {event.type === 'holiday' ? (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20">
                  节假日
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/20">
                  个人
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-white leading-tight line-clamp-1 group-hover:text-primary-200 transition-colors">
              {event.title}
            </h3>
            <div className="flex items-center text-slate-400 text-xs mt-1">
              <Calendar className="w-3 h-3 mr-1 opacity-70" />
              {new Date(event.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
            </div>
          </div>

          {onDelete && (
            <button
              onClick={() => onDelete(event.id)}
              className="p-2.5 rounded-full hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 duration-300"
              title="Delete Event"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>

        {/* Main Countdown Display */}
        <div className="flex-1 flex flex-col justify-center items-center py-2 overflow-hidden">
          {isPast ? (
            <div className="text-lg font-bold text-slate-600 uppercase tracking-widest font-mono">已结束</div>
          ) : (
            <div className="text-center relative w-full">
              {/* Glowing Background behind numbers */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-tr ${event.color} opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700 rounded-full`} />

              <div className={`font-mono font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 
                ${unit === TimeUnit.SECONDS ? 'text-3xl' : unit === TimeUnit.MINUTES ? 'text-4xl' : 'text-4xl'} 
                tracking-tighter transition-all duration-300 relative z-10`}>
                {displayValue}
              </div>
              <div className="text-primary-300 text-xs font-bold uppercase tracking-widest relative z-10">
                {unitLabel}
              </div>
            </div>
          )}
        </div>

        {/* Footer / Controls */}
        <div className="mt-auto pt-3 border-t border-white/5 space-y-2">

          {/* Holiday Enhanced Info */}
          {event.type === 'holiday' && (
            <div className="space-y-3">
              {/* Days Off & Holiday Type Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {event.daysOff && event.daysOff > 0 && (
                  <span className="px-2 py-1 text-xs font-bold bg-primary-500/20 text-primary-300 rounded-lg">
                    放假 {event.daysOff} 天
                  </span>
                )}
                {event.holidayType === 'public' && (
                  <span className="px-2 py-1 text-xs font-medium bg-amber-500/20 text-amber-300 rounded-lg">法定假日</span>
                )}
                {event.holidayType === 'traditional' && (
                  <span className="px-2 py-1 text-xs font-medium bg-orange-500/20 text-orange-300 rounded-lg">传统节日</span>
                )}
              </div>

              {/* Traditions */}
              {event.traditions && event.traditions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {event.traditions.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs bg-white/5 text-slate-400 rounded-md border border-white/5">
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {/* Greetings */}
              {event.greetings && (
                <div className="text-sm text-slate-300 italic bg-gradient-to-r from-white/5 to-transparent p-2 rounded-lg border-l-2 border-primary-500">
                  "{event.greetings}"
                </div>
              )}
            </div>
          )}

          {/* Description (for both types) */}
          {event.description && event.type !== 'holiday' && (
            <div className="flex items-start gap-2 text-xs text-slate-400 bg-black/20 p-3 rounded-xl border border-white/5">
              <Info size={14} className="mt-0.5 text-primary-400 flex-shrink-0" />
              <p className="line-clamp-2 leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Holiday Description */}
          {event.description && event.type === 'holiday' && (
            <p className="text-xs text-slate-500 leading-relaxed">{event.description}</p>
          )}

          <div className="flex p-1 rounded-xl bg-black/20 border border-white/5 backdrop-blur-md">
            {[TimeUnit.DAYS, TimeUnit.HOURS, TimeUnit.MINUTES, TimeUnit.SECONDS].map((u) => (
              <button
                key={u}
                onClick={() => setUnit(u)}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 
                    ${unit === u
                    ? 'bg-white/10 text-white shadow-lg shadow-black/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
              >
                {u === TimeUnit.DAYS ? '天' : u === TimeUnit.HOURS ? '时' : u === TimeUnit.MINUTES ? '分' : '秒'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownCard;