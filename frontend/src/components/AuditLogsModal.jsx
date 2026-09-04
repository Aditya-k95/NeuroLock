import React, { useState } from 'react';
import { X, FileText, Download, ShieldAlert, CheckCircle2, Terminal, Filter } from 'lucide-react';

export default function AuditLogsModal({ isOpen, onClose, alerts = [] }) {
  const [filter, setFilter] = useState('ALL');

  if (!isOpen) return null;

  const mockLogs = [
    {
      id: 'LOG-89102',
      timestamp: '2026-09-04 18:28:14',
      event: 'AUTH_BURST_FAILURE',
      sourceIp: '194.26.29.112',
      location: 'Frankfurt, DE',
      asn: 'AS44050 (Proxy)',
      status: 'BLOCKED',
      riskScore: 96
    },
    {
      id: 'LOG-89101',
      timestamp: '2026-09-04 18:24:02',
      event: 'GEO_IMPOSSIBLE_TRAVEL',
      sourceIp: '185.220.101.5',
      location: 'Mumbai -> London',
      asn: 'AS14061 (Tor Node)',
      status: 'CHALLENGED',
      riskScore: 89
    },
    {
      id: 'LOG-89100',
      timestamp: '2026-09-04 18:20:55',
      event: 'DEVICE_DEVIATION',
      sourceIp: '45.154.255.88',
      location: 'Singapore, SG',
      asn: 'AS200052 (Cloud)',
      status: 'LOGGED',
      riskScore: 62
    },
    {
      id: 'LOG-89099',
      timestamp: '2026-09-04 18:18:10',
      event: 'NOMINAL_AUTH_SUCCESS',
      sourceIp: '103.21.244.1',
      location: 'Bengaluru, IN',
      asn: 'AS133612 (ISP)',
      status: 'ALLOWED',
      riskScore: 4
    },
    {
      id: 'LOG-89098',
      timestamp: '2026-09-04 18:15:30',
      event: 'NOMINAL_AUTH_SUCCESS',
      sourceIp: '49.207.210.19',
      location: 'Hyderabad, IN',
      asn: 'AS45820 (ISP)',
      status: 'ALLOWED',
      riskScore: 2
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0a14]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-[#151220] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#231d38] bg-[#110d1c]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                Security Telemetry & Audit Logs
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Immutable chronological event stream with heuristic risk scores
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          {/* Table Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Stream Filter:</span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0e0a17] border border-[#231d38] text-xs">
                {['ALL', 'CRITICAL', 'ANOMALIES', 'NOMINAL'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      filter === f ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => alert('Exporting live CSV audit log...')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#221a38] hover:bg-[#2c2248] text-purple-300 border border-purple-500/30 text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Logs Table */}
          <div className="rounded-2xl border border-[#231d38] overflow-hidden bg-[#0e0a17]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#110d1c] border-b border-[#231d38] text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Log ID</th>
                  <th className="p-3.5">Timestamp</th>
                  <th className="p-3.5">Event Vector</th>
                  <th className="p-3.5">Source IP / Geo</th>
                  <th className="p-3.5">Risk Score</th>
                  <th className="p-3.5">Remediation Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#231d38]/60 font-mono">
                {mockLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#151220]/70 transition-colors">
                    <td className="p-3.5 font-bold text-purple-300">{log.id}</td>
                    <td className="p-3.5 text-slate-400">{log.timestamp}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-white bg-[#1a152b] px-2 py-0.5 rounded border border-[#2c2345]">
                        {log.event}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-200 font-bold">{log.sourceIp}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{log.location} ({log.asn})</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                        log.riskScore > 75 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                        log.riskScore > 40 ? 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/40' :
                        'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {log.riskScore}/100
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        log.status === 'BLOCKED' ? 'bg-rose-500/20 text-rose-300' :
                        log.status === 'CHALLENGED' ? 'bg-yellow-400/20 text-yellow-300' :
                        'bg-emerald-500/15 text-emerald-300'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#110d1c] border-t border-[#231d38] text-xs text-slate-400">
          <span>Showing 5 latest indexed audit entries</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#221a38] text-white font-bold hover:bg-[#2c2248] transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
