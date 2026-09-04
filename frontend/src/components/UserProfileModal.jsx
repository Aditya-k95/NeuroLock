import React, { useState, useEffect } from 'react';
import { X, User, Shield, Check, Sparkles, Building2 } from 'lucide-react';

export default function UserProfileModal({
  isOpen,
  onClose,
  userName = 'User',
  userRole = 'SecOps Lead',
  onSaveProfile
}) {
  const [name, setName] = useState(userName);
  const [role, setRole] = useState(userRole);
  const [teamName, setTeamName] = useState('WolfPack Squadron');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setName(userName);
    setRole(userRole);
  }, [userName, userRole, isOpen]);

  if (!isOpen) return null;

  const getInitials = (str) => {
    if (!str) return 'U';
    const parts = str.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return str.slice(0, 2).toUpperCase();
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSaveProfile({ name: name.trim(), role: role.trim() });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d0a14]/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#151220] border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#231d38] bg-[#110d1c]">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-purple-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                User Profile & Identity
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Set your active operator username and role on NeuroLock
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

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          
          {/* Avatar Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#0e0a17] border border-[#231d38]">
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px] shadow-md shrink-0">
              <div className="w-full h-full bg-[#151220] rounded-[14px] flex items-center justify-center">
                <span className="text-lg font-extrabold text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-yellow-300">
                  {getInitials(name)}
                </span>
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 ring-2 ring-[#0e0a17]" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{name || 'User'}</div>
              <div className="text-xs text-purple-400 font-medium">{role || 'Operator'}</div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <Building2 className="w-3 h-3" />
                <span>WolfPack Squadron • NexHack 2.0</span>
              </div>
            </div>
          </div>

          {/* Input: Operator Name */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Operator / User Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. User, Sarah, Alex, Commander..."
                required
                className="w-full h-11 pl-10 pr-4 bg-[#0e0a17] border border-[#231d38] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Input: Operator Role */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Security Role / Title
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. SecOps Lead, CISO, Security Analyst..."
                required
                className="w-full h-11 pl-10 pr-4 bg-[#0e0a17] border border-[#231d38] rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>

          {/* Success Notification */}
          {savedSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Operator profile updated successfully!</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#231d38]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-purple-600 to-violet-500 text-white hover:from-purple-500 hover:to-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
