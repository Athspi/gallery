import React, { useState } from 'react';
import { Calendar, Bell, Mail, Smartphone, Play, CheckCircle, Clock, Send, ShieldCheck, Zap } from 'lucide-react';
import { audioSynth } from '../../services/audioSynthesizer';

interface ActionLog {
  id: string;
  timestamp: string;
  category: string;
  action: string;
  payload: any;
  status: 'success' | 'pending';
}

export const MobileActionsView: React.FC = () => {
  const [logs, setLogs] = useState<ActionLog[]>([
    {
      id: 'log-1',
      timestamp: 'Just now',
      category: 'Calendar',
      action: 'Create Calendar Event',
      payload: { title: 'AI Edge Tech Sync', date: '2026-08-20 10:00 AM', location: 'Google Meet' },
      status: 'success',
    },
  ]);

  // Action Forms State
  const [calTitle, setCalTitle] = useState('Sync with Product Team');
  const [calDate, setCalDate] = useState('2026-08-21T14:30');
  const [notifTitle, setNotifTitle] = useState('Standup Reminder');
  const [notifBody, setNotifBody] = useState('Your daily engineering standup begins in 5 minutes.');
  const [emailTo, setEmailTo] = useState('team@edge.google.dev');
  const [emailSubject, setEmailSubject] = useState('Latest On-Device Benchmark Report');
  const [activeAlert, setActiveAlert] = useState<string | null>(null);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    audioSynth.playSoundEffect('click');
    const newLog: ActionLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'Calendar',
      action: 'Calendar Event Created',
      payload: { title: calTitle, dateTime: calDate },
      status: 'success',
    };
    setLogs([newLog, ...logs]);
    audioSynth.playSoundEffect('success');
  };

  const handleScheduleNotif = (e: React.FormEvent) => {
    e.preventDefault();
    audioSynth.playSoundEffect('click');
    setActiveAlert(`Notification scheduled: "${notifTitle}"`);
    setTimeout(() => {
      audioSynth.playSoundEffect('alert');
      setActiveAlert(`🔔 ALERT: ${notifTitle} - ${notifBody}`);
    }, 2500);

    const newLog: ActionLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'Notification',
      action: 'Alarm Scheduled (3s)',
      payload: { title: notifTitle, message: notifBody },
      status: 'success',
    };
    setLogs([newLog, ...logs]);
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    audioSynth.playSoundEffect('click');
    const newLog: ActionLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      category: 'Email',
      action: 'Email Intent Dispatched',
      payload: { to: emailTo, subject: emailSubject },
      status: 'success',
    };
    setLogs([newLog, ...logs]);
    audioSynth.playSoundEffect('success');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>Mobile Actions & Intent Automation</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-full font-mono">
              Android Intent System
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Simulate native Android and iOS operating system intent bridges triggered by autonomous AI agent tool calls.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local Device Sandboxed</span>
        </div>
      </div>

      {/* Notification Toast simulation */}
      {activeAlert && (
        <div className="p-4 bg-indigo-950/80 border border-indigo-500/40 rounded-2xl flex items-center justify-between text-xs text-indigo-200 animate-bounce">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">{activeAlert}</span>
          </div>
          <button
            onClick={() => setActiveAlert(null)}
            className="text-slate-400 hover:text-white font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Action Trigger Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calendar Action */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Calendar Intent</h3>
                <p className="text-[11px] text-slate-400">Schedule appointments</p>
              </div>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400">Event Title</label>
                <input
                  type="text"
                  value={calTitle}
                  onChange={(e) => setCalTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Date & Time</label>
                <input
                  type="datetime-local"
                  value={calDate}
                  onChange={(e) => setCalDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Create Calendar Event</span>
              </button>
            </form>
          </div>
        </div>

        {/* Push Notification Action */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">System Notification</h3>
                <p className="text-[11px] text-slate-400">Alarm & reminder scheduler</p>
              </div>
            </div>

            <form onSubmit={handleScheduleNotif} className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400">Notification Title</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Message Body</label>
                <input
                  type="text"
                  value={notifBody}
                  onChange={(e) => setNotifBody(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Test Alert (3s Delay)</span>
              </button>
            </form>
          </div>
        </div>

        {/* Email Intent Action */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Send Email Intent</h3>
                <p className="text-[11px] text-slate-400">Draft or dispatch email</p>
              </div>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-400">Recipient Email</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Subject Line</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow"
              >
                <Send className="w-3 h-3" />
                <span>Send Email Action</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Action Audit Logs */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
          Action Execution History & Audit Logs
        </h3>

        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-slate-200">{log.action}</span>
                  <span className="text-slate-500 text-[11px] ml-2 font-mono">{log.timestamp}</span>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {JSON.stringify(log.payload)}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold rounded font-mono self-start sm:self-auto">
                INTENT_OK
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
