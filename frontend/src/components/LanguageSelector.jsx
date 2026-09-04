import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, Search, ChevronDown, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageSelector() {
  const { currentLang, setLanguage, currentLangMeta, t, LANGUAGES } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'indian' | 'international'
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter languages based on search query and category
  const filteredLanguages = LANGUAGES.filter((lang) => {
    const matchesCategory = activeCategory === 'all' || lang.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      lang.name.toLowerCase().includes(query) ||
      lang.nativeName.toLowerCase().includes(query) ||
      lang.code.toLowerCase().includes(query) ||
      lang.region.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleSelectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const indianCount = LANGUAGES.filter(l => l.category === 'indian').length;
  const intlCount = LANGUAGES.filter(l => l.category === 'international').length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button in Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-[#151220] border transition-all duration-200 group ${
          isOpen
            ? 'border-purple-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] text-white'
            : 'border-[#231d38] hover:border-purple-500/40 text-slate-300 hover:text-white'
        }`}
        title="Change Language / भाषा बदलें"
      >
        <div className="flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-purple-400 group-hover:rotate-45 transition-transform duration-300" />
          <span className="text-base leading-none">{currentLangMeta.flag}</span>
        </div>
        
        <div className="hidden md:flex flex-col items-start text-left">
          <span className="text-xs font-bold leading-none text-white tracking-wide">
            {currentLangMeta.nativeName}
          </span>
          <span className="text-[10px] text-slate-400 leading-none mt-0.5 font-medium">
            {currentLangMeta.name}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-purple-300 transition-transform duration-200 ${isOpen ? 'rotate-180 text-purple-400' : ''}`} />
      </button>

      {/* Floating Glassmorphic Language Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#161126]/98 backdrop-blur-2xl border border-purple-500/30 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(139,92,246,0.2)] p-4 z-50 animate-fadeIn flex flex-col max-h-[85vh]">
          
          {/* Header Title */}
          <div className="flex items-center justify-between pb-3 border-b border-[#231d38]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <Globe className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {t('selectLanguage', 'Select Language')} / भाषा चुनें
                </h4>
                <p className="text-[11px] text-slate-400">
                  Choose your native or preferred language
                </p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
              {LANGUAGES.length} Languages
            </span>
          </div>

          {/* Search Box */}
          <div className="relative mt-3 mb-2.5">
            <Search className="w-3.5 h-3.5 text-purple-400/80 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchLanguage', 'Search language or country...')}
              autoFocus
              className="w-full h-9 pl-9 pr-8 bg-[#110d1c] border border-[#231d38] rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#100c1c] rounded-xl border border-[#231d38] mb-3">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                activeCategory === 'all'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              All ({LANGUAGES.length})
            </button>
            <button
              onClick={() => setActiveCategory('indian')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeCategory === 'indian'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>🇮🇳 Indian</span>
              <span className="text-[10px] opacity-80">({indianCount})</span>
            </button>
            <button
              onClick={() => setActiveCategory('international')}
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                activeCategory === 'international'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>🌍 Global</span>
              <span className="text-[10px] opacity-80">({intlCount})</span>
            </button>
          </div>

          {/* Languages List */}
          <div className="overflow-y-auto space-y-1.5 max-h-64 pr-1">
            {filteredLanguages.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-400/40" />
                <span>No languages match "{searchQuery}"</span>
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-left transition-all ${
                      isSelected
                        ? 'bg-purple-600/20 border border-purple-500/60 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                        : 'bg-[#110d1c]/70 hover:bg-[#1b152d] border border-[#231d38]/60 hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl leading-none shrink-0 drop-shadow-sm">
                        {lang.flag}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isSelected ? 'text-purple-300' : 'text-white'}`}>
                            {lang.nativeName}
                          </span>
                          <span className="text-[10px] font-mono uppercase text-slate-400 px-1.5 py-0.2 rounded bg-purple-500/10">
                            {lang.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span>{lang.name}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-500 text-[10px]">{lang.region}</span>
                        </div>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center shadow-md shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                        Switch
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2.5 border-t border-[#231d38] text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-purple-300">
              <Sparkles className="w-3 h-3 text-yellow-400" />
              <span>Instant reactive UI translation</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Active: {currentLangMeta.code.toUpperCase()}
            </span>
          </div>

        </div>
      )}
    </div>
  );
}
