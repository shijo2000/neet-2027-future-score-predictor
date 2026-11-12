import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Lead, AggregateStats, ContactStatus, AdmissionPreference } from '../../types';
import { 
  fetchAdminLeads, 
  updateLeadStatus, 
  deleteLead, 
  getAggregateStats, 
  checkAdminSession, 
  adminSignIn, 
  adminSignOut,
  isSupabaseConfigured 
} from '../../lib/supabase';
import { 
  Users, 
  PhoneCall, 
  Calendar, 
  Download, 
  Search, 
  RefreshCw, 
  LogOut, 
  Lock, 
  TrendingUp, 
  Database, 
  CheckCircle, 
  X, 
  Trash2, 
  MessageSquare, 
  Flame,
  Calculator,
  GraduationCap,
  Layers
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  
  // Auth Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Data
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<AggregateStats | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // Table filters & source separation
  const [sourceTab, setSourceTab] = useState<'all' | 'Score Predictor' | 'MBBS Guidance'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [preferenceFilter, setPreferenceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Status updating indicator
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Check existing session
  useEffect(() => {
    checkAdminSession().then((hasSession) => {
      setIsAuthenticated(hasSession);
      setIsCheckingAuth(false);
    });
  }, []);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      const [leadsData, statsData] = await Promise.all([
        fetchAdminLeads(),
        getAggregateStats()
      ]);
      setLeads(leadsData);
      setStats(statsData);
    } catch (err) {
      setDataError(err instanceof Error ? err.message : 'Failed to load admin data');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loadData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await adminSignIn(email, password);
      if (res.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError(res.error || 'Authentication failed. Please verify credentials.');
      }
    } catch {
      setAuthError('An unexpected authentication error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await adminSignOut();
    setIsAuthenticated(false);
  };

  const handleStatusChange = async (leadId: string, newStatus: ContactStatus) => {
    setUpdatingId(leadId);
    try {
      const ok = await updateLeadStatus(leadId, newStatus);
      if (ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, contact_status: newStatus } : l))
        );
        getAggregateStats().then(setStats);
      } else {
        setDataError('Could not update this lead in Supabase.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    try {
      const ok = await deleteLead(leadId);
      if (ok) {
        setLeads((prev) => prev.filter((l) => l.id !== leadId));
        setDeleteConfirmId(null);
        getAggregateStats().then(setStats);
      } else {
        setDataError('Could not delete this lead in Supabase.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (!leads.length) return;

    const headers = [
      'Lead ID',
      'Student Name',
      'Phone Number',
      'Lead Source',
      'State',
      'Estimated Score',
      'Admission Preference',
      'Contact Status',
      'Is Minor',
      'Parent Guardian Name',
      'Consent Timestamp',
      'Submission Date'
    ];

    const rows = leads.map((l) => [
      `"${l.id}"`,
      `"${l.name.replace(/"/g, '""')}"`,
      `"${l.phone}"`,
      `"${l.lead_source || 'Score Predictor'}"`,
      `"${l.state}"`,
      l.estimated_score,
      `"${l.admission_preference}"`,
      `"${l.contact_status}"`,
      l.is_minor ? 'Yes' : 'No',
      `"${(l.parent_guardian_name || '').replace(/"/g, '""')}"`,
      `"${l.consent_timestamp}"`,
      `"${l.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEET_2027_Leads_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const source = l.lead_source || 'Score Predictor';
      const matchesSource = sourceTab === 'all' || source === sourceTab;

      const matchesSearch =
        searchQuery === '' ||
        l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.phone.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || l.contact_status === statusFilter;
      const matchesState = stateFilter === 'all' || l.state === stateFilter;
      const matchesPref = preferenceFilter === 'all' || l.admission_preference === preferenceFilter;

      return matchesSource && matchesSearch && matchesStatus && matchesState && matchesPref;
    });
  }, [leads, searchQuery, statusFilter, stateFilter, preferenceFilter, sourceTab]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage]);

  const uniqueStates = useMemo(() => {
    const states = Array.from(new Set(leads.map((l) => l.state))).filter(Boolean);
    return states.sort();
  }, [leads]);

  const scorePredictorCount = useMemo(() => {
    return leads.filter((l) => (l.lead_source || 'Score Predictor') === 'Score Predictor').length;
  }, [leads]);

  const mbbsGuidanceCount = useMemo(() => {
    return leads.filter((l) => l.lead_source === 'MBBS Guidance').length;
  }, [leads]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium">
          <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
          <span>Verifying administrator privileges...</span>
        </div>
      </div>
    );
  }

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-indigo-100 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-indigo-600/20">
            <Lock className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-heading font-extrabold text-slate-900">
            Admin Portal Login
          </h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Strictly restricted to authorized NEET counsellors & administrators.
          </p>

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-left">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@neet2027.com"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-indigo-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // AUTHENTICATED DASHBOARD
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900">
              NEET 2027 Admissions Desk
            </h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${
              isSupabaseConfigured 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <Database className="w-3 h-3" />
              <span>{isSupabaseConfigured ? 'Supabase PostgreSQL (Live)' : 'Local Storage Mode'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time pipeline of student opt-in counselling leads, score benchmarks, and conversion status.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loadingData}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh database"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleSignOut}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {dataError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {dataError}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        
        {/* Total Predictions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Score Challenges</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 mt-2">
            {stats?.totalPredictions.toLocaleString('en-IN') || '—'}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Aspirants benchmarked</span>
        </div>

        {/* Score Predictor Leads */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-sky-200 shadow-xs bg-gradient-to-b from-sky-50/40 to-white">
          <div className="flex items-center justify-between text-sky-800 text-xs font-semibold">
            <span>Calculator Leads</span>
            <Calculator className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-sky-700 mt-2">
            {scorePredictorCount}
          </div>
          <span className="text-[10px] text-sky-600 mt-1 block font-medium">Direct predictor submissions</span>
        </div>

        {/* MBBS Guidance Leads */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-purple-200 shadow-xs bg-gradient-to-b from-purple-50/40 to-white">
          <div className="flex items-center justify-between text-purple-800 text-xs font-semibold">
            <span>Counselling Leads</span>
            <GraduationCap className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-purple-700 mt-2">
            {mbbsGuidanceCount}
          </div>
          <span className="text-[10px] text-purple-600 mt-1 block font-medium">Detailed guidance requests</span>
        </div>

        {/* Today's Leads */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Today’s Leads</span>
            <Calendar className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-600 mt-2">
            {stats?.todayLeads || 0}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Fresh across sources</span>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Leads / Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-extrabold text-indigo-700 mt-2">
            {stats?.totalConsentedLeads || 0}{' '}
            <span className="text-xs text-slate-500 font-semibold">({stats?.conversionRate || 0}%)</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Total opted-in contacts</span>
        </div>

      </div>

      {/* STATE & ADMISSION BREAKDOWN SUMMARY CARDS */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Status Funnel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Lead Pipeline Status
          </h3>
          <div className="space-y-2 text-xs">
            {(['New', 'Contacted', 'Interested', 'Converted', 'Not Interested'] as ContactStatus[]).map((st) => {
              const count = stats?.leadsByStatus[st] || 0;
              const pct = stats?.totalConsentedLeads ? Math.round((count / stats.totalConsentedLeads) * 100) : 0;
              return (
                <div key={st} className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">{st}:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{count}</span>
                    <span className="text-[10px] text-slate-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Admission Preference */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Admission Preference
          </h3>
          <div className="space-y-2 text-xs">
            {(['India', 'Abroad', 'Both', 'Undecided'] as AdmissionPreference[]).map((pref) => {
              const count = stats?.leadsByPreference[pref] || 0;
              return (
                <div key={pref} className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">
                    {pref === 'India' && 'Govt/Private India'}
                    {pref === 'Abroad' && 'MBBS Abroad'}
                    {pref === 'Both' && 'India & Abroad'}
                    {pref === 'Undecided' && 'Undecided'}
                  </span>
                  <span className="font-bold text-slate-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top States */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
            Top Demand States
          </h3>
          <div className="space-y-1.5 text-xs max-h-36 overflow-y-auto">
            {Object.entries(stats?.leadsByState || {})
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([st, cnt]) => (
                <div key={st} className="flex items-center justify-between">
                  <span className="text-slate-600">{st}</span>
                  <span className="font-bold text-indigo-600">{cnt} leads</span>
                </div>
              ))}
            {(!stats || Object.keys(stats.leadsByState).length === 0) && (
              <span className="text-slate-400 italic">No state data yet</span>
            )}
          </div>
        </div>

      </div>

      {/* SEGMENTED LEAD SOURCE TABS (SEPARATION OF CALCULATOR VS COUNSELLING LEADS) */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200">
          
          <button
            onClick={() => {
              setSourceTab('all');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              sourceTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>All Leads</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-extrabold">
              {leads.length}
            </span>
          </button>

          <button
            onClick={() => {
              setSourceTab('Score Predictor');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              sourceTab === 'Score Predictor'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-sky-700'
            }`}
          >
            <Calculator className={`w-4 h-4 ${sourceTab === 'Score Predictor' ? 'text-white' : 'text-sky-600'}`} />
            <span>Score Predictor Leads</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              sourceTab === 'Score Predictor' ? 'bg-sky-700 text-white' : 'bg-sky-100 text-sky-800'
            }`}>
              {scorePredictorCount}
            </span>
          </button>

          <button
            onClick={() => {
              setSourceTab('MBBS Guidance');
              setCurrentPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              sourceTab === 'MBBS Guidance'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-purple-700'
            }`}
          >
            <GraduationCap className={`w-4 h-4 ${sourceTab === 'MBBS Guidance' ? 'text-white' : 'text-purple-600'}`} />
            <span>MBBS Guidance Leads</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
              sourceTab === 'MBBS Guidance' ? 'bg-purple-700 text-white' : 'bg-purple-100 text-purple-800'
            }`}>
              {mbbsGuidanceCount}
            </span>
          </button>

        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredLeads.length}</strong> {sourceTab === 'all' ? 'total' : sourceTab} records
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="mt-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by student name or phone..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-600 outline-hidden bg-slate-50 focus:bg-white"
          />
        </div>

        {/* Lead Source Filter */}
        <select
          value={sourceTab}
          onChange={(e) => {
            setSourceTab(e.target.value as any);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white cursor-pointer font-medium"
        >
          <option value="all">All Sources</option>
          <option value="Score Predictor">Score Predictor (Calculator)</option>
          <option value="MBBS Guidance">MBBS Guidance (Counselling)</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Interested">Interested</option>
          <option value="Converted">Converted</option>
          <option value="Not Interested">Not Interested</option>
        </select>

        {/* State Filter */}
        <select
          value={stateFilter}
          onChange={(e) => {
            setStateFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-white cursor-pointer"
        >
          <option value="all">All States</option>
          {uniqueStates.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {/* Reset filter */}
        {(searchQuery || statusFilter !== 'all' || stateFilter !== 'all' || preferenceFilter !== 'all' || sourceTab !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setStateFilter('all');
              setPreferenceFilter('all');
              setSourceTab('all');
              setCurrentPage(1);
            }}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            title="Clear filters"
          >
            <X className="w-4 h-4" />
          </button>
        )}

      </div>

      {/* LEADS TABLE */}
      <div className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Phone (WhatsApp)</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">State</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Target Preference</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Contact Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedLeads.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-sm">
                    No leads match your selected filters.
                  </td>
                </tr>
              ) : (
                paginatedLeads.map((lead) => {
                  const isUpdating = updatingId === lead.id;
                  const isConfirmingDelete = deleteConfirmId === lead.id;
                  const leadSource = lead.lead_source || 'Score Predictor';

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Minor badge */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{lead.name}</span>
                          {lead.is_minor && (
                            <span 
                              className="px-1.5 py-0.5 rounded-sm bg-amber-100 text-amber-800 text-[10px] font-bold"
                              title={`Parent: ${lead.parent_guardian_name || 'Authorized'}`}
                            >
                              Minor
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`tel:+91${lead.phone}`}
                            className="text-slate-800 hover:text-indigo-600 font-mono font-medium flex items-center gap-1"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.phone}</span>
                          </a>

                          <a
                            href={`https://wa.me/91${lead.phone}?text=${encodeURIComponent(`Hi ${lead.name}, this is regarding your NEET 2027 Admission Guidance request.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Lead Source Badge */}
                      <td className="py-3.5 px-4">
                        {leadSource === 'MBBS Guidance' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                            <GraduationCap className="w-3.5 h-3.5 text-purple-600" />
                            <span>Guidance</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200 shadow-2xs">
                            <Calculator className="w-3.5 h-3.5 text-sky-600" />
                            <span>Calculator</span>
                          </span>
                        )}
                      </td>

                      {/* State */}
                      <td className="py-3.5 px-4 text-slate-600">{lead.state}</td>

                      {/* Score */}
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md text-xs">
                          {lead.estimated_score} / 720
                        </span>
                      </td>

                      {/* Preference */}
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-800">
                          {lead.admission_preference}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 text-xs">
                        {new Date(lead.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Contact Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          disabled={isUpdating}
                          value={lead.contact_status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as ContactStatus)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1 border cursor-pointer transition-colors ${
                            lead.contact_status === 'New'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : lead.contact_status === 'Contacted'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : lead.contact_status === 'Interested'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : lead.contact_status === 'Converted'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Interested">Interested</option>
                          <option value="Converted">Converted</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {isConfirmingDelete ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleDeleteLead(lead.id)}
                              className="px-2 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="p-1 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(lead.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-md"
                            title="Purge record (User request)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong>{filteredLeads.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong>{Math.min(currentPage * pageSize, filteredLeads.length)}</strong> of{' '}
            <strong>{filteredLeads.length}</strong> leads
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-bold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 font-semibold disabled:opacity-40 hover:bg-slate-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
