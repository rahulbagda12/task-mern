import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths } from 'date-fns';

const mockEvents = [
  { date: new Date(2026, 2, 17), title: 'Sprint Review', color: 'indigo' },
  { date: new Date(2026, 2, 17), title: 'Design Handoff', color: 'purple' },
  { date: new Date(2026, 2, 20), title: 'API Deadline', color: 'rose' },
  { date: new Date(2026, 2, 22), title: 'Team Standup', color: 'emerald' },
  { date: new Date(2026, 2, 25), title: 'Stakeholder Meeting', color: 'amber' },
  { date: new Date(2026, 2, 28), title: 'Monthly Report', color: 'blue' },
  { date: new Date(2026, 2, 10), title: 'Kickoff Call', color: 'indigo' },
];

const colorMap = {
  indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  rose:   'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  emerald:'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  amber:  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  blue:   'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
};

const CalendarPage = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 2, 1));
  const [selectedDay, setSelectedDay] = useState(new Date(2026, 2, 17));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startWeekday = getDay(monthStart); // 0 = Sun
  const blanks = Array(startWeekday).fill(null);

  const eventsForDay = (day) => mockEvents.filter(e => isSameDay(e.date, day));
  const selectedEvents = eventsForDay(selectedDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Deadlines and events at a glance.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-colors text-sm">
          <Plus size={16} />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} className="text-center text-xs font-semibold text-slate-400 uppercase py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`blank-${i}`} />)}
            {days.map(day => {
              const events = eventsForDay(day);
              const isSelected = isSameDay(day, selectedDay);
              const today = isToday(day);
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDay(day)}
                  className={`relative min-h-[64px] p-1.5 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                      : 'border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/40'
                  }`}
                >
                  <span className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full mb-1 ${
                    today ? 'bg-indigo-600 text-white' : 'text-slate-600 dark:text-slate-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  <div className="space-y-0.5">
                    {events.slice(0, 2).map((ev, i) => (
                      <div key={i} className={`text-[9px] font-semibold px-1 py-0.5 rounded truncate ${colorMap[ev.color]}`}>
                        {ev.title}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-[9px] text-slate-400 px-1">+{events.length - 2} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
              {format(selectedDay, 'EEEE, MMMM d')}
            </h3>
            <p className="text-xs text-slate-400 mb-4">{selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}</p>
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No events on this day.</p>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map((ev, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${colorMap[ev.color]}`}>
                    <div className={`w-2 h-2 rounded-full bg-current opacity-70 flex-shrink-0`}></div>
                    <p className="text-sm font-semibold">{ev.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Upcoming</h3>
            <div className="space-y-3">
              {mockEvents
                .filter(e => e.date >= new Date())
                .sort((a, b) => a.date - b.date)
                .slice(0, 5)
                .map((ev, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="text-center w-10 flex-shrink-0">
                      <p className="text-xs text-slate-400">{format(ev.date, 'MMM')}</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{format(ev.date, 'd')}</p>
                    </div>
                    <div className={`flex-1 text-sm font-medium px-2.5 py-1.5 rounded-lg ${colorMap[ev.color]}`}>
                      {ev.title}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarPage;
