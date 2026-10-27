import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet,
  ArrowUpRight,
  Search
} from 'lucide-react';
import { api } from '../api';
import { formatINR, formatBV, getInitials, RANK_META } from '../utils/format';

const TX_TYPE_LABELS = {
  DIRECT_BONUS: {
    label: 'Direct Referral',
    style:
      'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60'
  },
  UNILEVEL_BONUS: {
    label: 'Unilevel Level',
    style:
      'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
  },
  BINARY_MATCH: {
    label: 'Binary Match',
    style:
      'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60'
  },
  CLAWBACK: {
    label: 'Clawback Debit',
    style:
      'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60'
  },
  WITHDRAWAL: {
    label: 'Payout Settlement',
    style:
      'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60'
  }
};

export default function WalletLedger({
  users,
  selectedUserId,
  onChangeSelectedUser,
  refreshTrigger
}) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const activeUserId = selectedUserId || users[0]?._id || 'root';

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getUserDashboard(activeUserId);
      setDashboard(data);
    } catch (_) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, refreshTrigger]);

  const user = dashboard?.user;
  const wallet = dashboard?.wallet;
  const vol = dashboard?.volume_ledger;
  const transactions = dashboard?.transactions || [];

  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter !== 'ALL' && t.tx_type !== typeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      t.idempotency_key?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.tx_type?.toLowerCase().includes(q)
    );
  });

  const rankMeta = user ? RANK_META[user.rank_id] || RANK_META.SILVER : RANK_META.SILVER;

  return (
    <div className="space-y-6">
      {/* Top Distributor Passbook Header */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          {user ? (
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-700 dark:text-slate-200">
                {getInitials(user.full_name)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {user.full_name}
                  </h2>
                  <span
                    className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${rankMeta.badgeLight} ${rankMeta.badgeDark}`}
                  >
                    {rankMeta.label}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium ${
                      user.is_active
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        user.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                  @{user.username} • Sponsor: @{user.sponsor_info?.username || 'Root'} • Direct Team: {user.direct_recruits_count || 0}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm font-medium text-slate-500">
              Loading Distributor Passbook...
            </div>
          )}

          <div className="flex items-center gap-2.5">
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Account:
            </label>
            <select
              value={activeUserId}
              onChange={(e) => onChangeSelectedUser(e.target.value)}
              className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.full_name} (@{u.username}) — {RANK_META[u.rank_id]?.label || u.rank_id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Financial Summary Cards (All in INR ₹) */}
        {user && (
          <>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Net Cleared Wallet Balance */}
              <div className="p-4 rounded-xl bg-blue-600 text-white shadow-sm">
                <div className="text-xs font-medium text-blue-100">
                  Net Cleared Balance
                </div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums">
                  {formatINR(wallet?.cleared_balance)}
                </div>
                <div className="mt-1 text-[11px] font-mono text-blue-100/90 tabular-nums">
                  Exact: {formatINR(wallet?.cleared_balance, true)}
                </div>
              </div>

              {/* Direct Referral Bonus */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Direct Referral Bonus
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {formatINR(wallet?.breakdown?.DIRECT_BONUS, true)}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  10% on Personal Enrollees
                </div>
              </div>

              {/* Unilevel Earnings */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Unilevel Level Bonus
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {formatINR(wallet?.breakdown?.UNILEVEL_BONUS, true)}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  5 Compressed Generations
                </div>
              </div>

              {/* Binary Match Bonus */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Binary Matching Bonus
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                  {formatINR(wallet?.breakdown?.BINARY_MATCH, true)}
                </div>
                <div className="mt-1 text-[11px] text-slate-400 tabular-nums">
                  Cycle Cap: {formatINR(user.rank_cap)}
                </div>
              </div>

              {/* Clawbacks */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Refund Clawbacks
                </div>
                <div className="mt-1 text-lg font-bold font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                  {formatINR(wallet?.breakdown?.CLAWBACK, true)}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  {wallet?.transaction_count || 0} Total Ledger Entries
                </div>
              </div>
            </div>

            {/* Active Cycle Volume Buckets */}
            <div className="mt-4 p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Personal Volume (PV)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatBV(vol?.pv, true)} BV
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Left Leg GV</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatBV(vol?.gv_left, true)} BV
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Current Right Leg GV</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatBV(vol?.gv_right, true)} BV
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Carry Forward Left</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatBV(vol?.carry_left, true)} BV
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Carry Forward Right</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatBV(vol?.carry_right, true)} BV
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Double-Entry Passbook Statement Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Passbook Statement & Double-Entry Audit Trail
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search by Reference or Description */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference or narration..."
                className="pl-8 pr-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'DIRECT_BONUS', label: 'Direct' },
                { id: 'UNILEVEL_BONUS', label: 'Unilevel' },
                { id: 'BINARY_MATCH', label: 'Binary' },
                { id: 'CLAWBACK', label: 'Clawbacks' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    typeFilter === tab.id
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Reference / Idempotency Key</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Narration & Compression Details</th>
                <th className="py-3 px-4">Clearing Status</th>
                <th className="py-3 px-4 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No ledger transactions match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isNeg = parseFloat(tx.amount) < 0;
                  const typeMeta =
                    TX_TYPE_LABELS[tx.tx_type] || TX_TYPE_LABELS.UNILEVEL_BONUS;
                  const compressedLevels = tx.metadata?.compressed_levels || 0;

                  return (
                    <tr
                      key={tx._id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="font-mono text-[11px] font-medium text-slate-800 dark:text-slate-200">
                          {tx.idempotency_key}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(tx.created_at).toLocaleString('en-IN')}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded border text-[11px] font-medium ${typeMeta.style}`}
                        >
                          {typeMeta.label}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {tx.description}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          {tx.metadata?.buyer_username && (
                            <span className="font-mono">
                              Source: @{tx.metadata.buyer_username} ({formatBV(tx.metadata.order_bv)} BV)
                            </span>
                          )}
                          {compressedLevels > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium">
                              <ArrowUpRight className="w-3 h-3" />
                              Compressed +{compressedLevels} Gen Upward (Gen {tx.metadata.physical_generation} → Paid L{tx.metadata.paid_level})
                            </span>
                          )}
                          {tx.metadata?.matched_volume && (
                            <span className="font-mono">
                              Matched: {formatBV(tx.metadata.matched_volume)} BV • Closing Carry L:{formatBV(tx.metadata.carry_left_after)} / R:{formatBV(tx.metadata.carry_right_after)}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                          {tx.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-sm tabular-nums">
                        <span
                          className={
                            isNeg
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-700 dark:text-emerald-400'
                          }
                        >
                          {isNeg ? '' : '+'}
                          {formatINR(tx.amount, true)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
