import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch,
  ShoppingBag,
  Scale,
  Wallet,
  RefreshCw,
  Sun,
  Moon,
  IndianRupee,
  Users,
  CheckCircle2
} from 'lucide-react';
import { api } from './api';
import { formatINR, formatBV } from './utils/format';
import GenealogyTree from './components/GenealogyTree';
import OrderSimulator from './components/OrderSimulator';
import SettlementConsole from './components/SettlementConsole';
import WalletLedger from './components/WalletLedger';

const NAV_ITEMS = [
  {
    id: 'tree',
    label: 'Network Genealogy',
    subtitle: 'Binary & Unilevel Topology',
    icon: GitBranch
  },
  {
    id: 'simulator',
    label: 'Order & Payout Desk',
    subtitle: 'BV Roll-Up & Compression',
    icon: ShoppingBag
  },
  {
    id: 'settlement',
    label: 'Binary Cycle Clearing',
    subtitle: 'Weak-Leg Matching Engine',
    icon: Scale
  },
  {
    id: 'wallet',
    label: 'Distributor Passbook',
    subtitle: 'Double-Entry INR Ledger',
    icon: Wallet
  }
];

export default function App() {
  // Default to crisp Enterprise Light mode; toggleable to Slate Dark mode
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('tree');
  const [users, setUsers] = useState([]);
  const [selectedWalletUserId, setSelectedWalletUserId] = useState('');
  const [simulatorBuyerId, setSimulatorBuyerId] = useState('');
  const [sampleTrace, setSampleTrace] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await api.getUsers();
      const list = res.users || [];
      setUsers(list);
      if (list.length > 0 && !selectedWalletUserId) {
        setSelectedWalletUserId(list[0]._id);
      }
    } catch (_) {
      // ignore
    }
  }, [selectedWalletUserId]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, refreshTrigger]);

  const triggerGlobalRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSeedDemo = async () => {
    setSeeding(true);
    try {
      const res = await api.seedDemoNetwork();
      if (res.sampleCompressionTrace) {
        setSampleTrace(res.sampleCompressionTrace);
      }
      if (res.rootUserId) {
        setSelectedWalletUserId(res.rootUserId);
      }
      if (res.featuredLeafUserId) {
        setSimulatorBuyerId(res.featuredLeafUserId);
      }
      triggerGlobalRefresh();
    } catch (_) {
      // ignore
    } finally {
      setSeeding(false);
    }
  };

  const handleSelectWalletUser = (userId) => {
    setSelectedWalletUserId(userId);
    setActiveTab('wallet');
  };

  const handleJumpToSimulatorUser = (userId) => {
    setSimulatorBuyerId(userId);
    setActiveTab('simulator');
  };

  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = users.length - activeCount;
  const rootUser = users[0];
  const rootMetrics = rootUser?.metrics || {};
  const currentNav = NAV_ITEMS.find((n) => n.id === activeTab) || NAV_ITEMS[0];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100">
      {/* Left Enterprise Sidebar Navigation */}
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#111827] flex flex-col justify-between">
        <div>
          {/* Brand Header */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <IndianRupee className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
                MLM Treasury
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Dual-Tree Network ERP
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-3 space-y-1">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Operations & Clearing
            </div>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition ${isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 dark:text-slate-500'
                      }`}
                  />
                  <div className="min-w-0">
                    <div className="text-xs leading-tight truncate">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Network Health & Controls */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {/* Network Snapshot Box */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Active Period</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                Oct 2026 (202610)
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Distributors</span>
              <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  {activeCount} Active
                </span>{' '}
                / {inactiveCount} Inactive
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span>Root Leg L / R</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                {formatBV(rootMetrics.total_left)} / {formatBV(rootMetrics.total_right)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition disabled:opacity-50"
              title="Reset and re-seed 15-distributor Indian network"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-blue-600' : 'text-slate-400'
                  }`}
              />
              {seeding ? 'Resetting...' : 'Reset Demo Data'}
            </button>

            <button
              onClick={() => setDarkMode((d) => !d)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              title="Switch Light / Dark Appearance"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Contextual Header */}
        <header className="h-14 px-6 border-b border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#111827] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="font-display font-bold text-base text-slate-900 dark:text-white">
              {currentNav.label}
            </h1>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
              {currentNav.subtitle}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {rootUser && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">Root Node:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {rootUser.full_name}
                </span>
                <span className="font-mono text-slate-400">(@{rootUser.username})</span>
              </div>
            )}

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-medium text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              INR (₹) • Decimal128 Precision
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-1 p-5 overflow-y-auto">
          <div className="max-w-[1520px] mx-auto">
            {activeTab === 'tree' && (
              <GenealogyTree
                users={users}
                refreshTrigger={refreshTrigger}
                onNetworkMutated={triggerGlobalRefresh}
                onSelectWalletUser={handleSelectWalletUser}
                onJumpToSimulatorUser={handleJumpToSimulatorUser}
              />
            )}

            {activeTab === 'simulator' && (
              <OrderSimulator
                users={users}
                preselectedBuyerId={simulatorBuyerId}
                initialTrace={sampleTrace}
                onOrderProcessed={triggerGlobalRefresh}
              />
            )}

            {activeTab === 'settlement' && (
              <SettlementConsole
                users={users}
                onSettlementCompleted={triggerGlobalRefresh}
                onSelectWalletUser={handleSelectWalletUser}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletLedger
                users={users}
                selectedUserId={selectedWalletUserId}
                onChangeSelectedUser={setSelectedWalletUserId}
                refreshTrigger={refreshTrigger}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
