import React, { useState } from 'react';
import {
  Scale,
  Play,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Wallet
} from 'lucide-react';
import { api } from '../api';
import { formatINR, formatBV, RANK_META } from '../utils/format';

export default function SettlementConsole({
  users,
  onSettlementCompleted,
  onSelectWalletUser
}) {
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const [settlementReport, setSettlementReport] = useState(null);
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'MATCHABLE'

  const handleRunSettlement = async () => {
    setRunning(true);
    setError('');
    try {
      const res = await api.runBinarySettlement('202610');
      setSettlementReport(res);
      if (onSettlementCompleted) onSettlementCompleted();
    } catch (err) {
      setError(err.message || 'Binary cycle settlement failed.');
    } finally {
      setRunning(false);
    }
  };

  // Build live pre-settlement preview from current user volume ledgers
  const previewRows = users.map((u) => {
    const m = u.metrics || {};
    const gvL = parseFloat(m.gv_left || '0');
    const gvR = parseFloat(m.gv_right || '0');
    const cL = parseFloat(m.carry_left || '0');
    const cR = parseFloat(m.carry_right || '0');
    const totL = gvL + cL;
    const totR = gvR + cR;
    const matched = Math.min(totL, totR);
    const estPayout = u.is_active
      ? Math.min(matched * 0.1, parseFloat(u.rank_cap || '5000'))
      : 0;
    const newCarryL = totL - matched;
    const newCarryR = totR - matched;

    return {
      user_id: u._id,
      username: u.username,
      full_name: u.full_name,
      rank_id: u.rank_id,
      is_active: u.is_active,
      rank_cap: u.rank_cap,
      total_left: totL.toFixed(4),
      total_right: totR.toFixed(4),
      matched_volume: matched.toFixed(4),
      payout: estPayout.toFixed(4),
      new_carry_left: newCarryL.toFixed(4),
      new_carry_right: newCarryR.toFixed(4),
      status:
        matched > 0
          ? u.is_active
            ? 'READY_TO_SETTLE'
            : 'INACTIVE_HOLD'
          : totL > 0 || totR > 0
          ? 'CARRY_FORWARD'
          : 'NO_VOLUME'
    };
  });

  const baseRows = settlementReport ? settlementReport.rows : previewRows;
  const displayRows =
    filterMode === 'MATCHABLE'
      ? baseRows.filter((r) => parseFloat(r.matched_volume || '0') > 0)
      : baseRows;

  const totalPreviewMatched = previewRows.reduce(
    (acc, r) => acc + (r.is_active ? parseFloat(r.matched_volume) : 0),
    0
  );
  const totalPreviewPayout = previewRows.reduce(
    (acc, r) => acc + parseFloat(r.payout),
    0
  );
  const readyCount = previewRows.filter(
    (r) => r.is_active && parseFloat(r.matched_volume) > 0
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Clearing Control Header */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Binary Cycle Clearing & Weak-Leg Settlement
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Period 202610
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
              Matches weaker binary leg volume across all qualified distributors, credits a 10% Binary Matching Bonus in ₹ (subject to rank cap), and rolls unmatched strong-leg volume into carry-forward buckets.
            </p>
          </div>

          <button
            onClick={handleRunSettlement}
            disabled={running}
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center gap-2 transition disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {running
              ? 'Running Cycle Clearing...'
              : 'Run Weekly Binary Settlement'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Summary KPI Strip */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Cycle Status
            </div>
            <div className="mt-1 text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>{settlementReport ? 'Settled' : 'Open for Clearing'}</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                {settlementReport
                  ? `${settlementReport.summary.distributors_paid} Paid`
                  : `${readyCount} Eligible`}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {settlementReport ? 'Matched Weak-Leg Volume' : 'Matchable Weak-Leg Volume'}
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatBV(
                settlementReport
                  ? settlementReport.summary.total_matched_volume
                  : totalPreviewMatched,
                true
              )}{' '}
              BV
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {settlementReport ? 'Total Binary Payout Disbursed' : 'Estimated 10% Cycle Payout'}
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatINR(
                settlementReport
                  ? settlementReport.summary.total_bonus_paid
                  : totalPreviewPayout,
                true
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Rank Cap Flushed Surplus
            </div>
            <div className="mt-1 text-lg font-bold font-mono text-slate-900 dark:text-white tabular-nums">
              {formatINR(
                settlementReport
                  ? settlementReport.summary.total_capped_flushed
                  : '0.0000',
                true
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Clearing Schedule Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {settlementReport
                ? `Settled Binary Clearing Schedule (${new Date(
                    settlementReport.settled_at
                  ).toLocaleTimeString()})`
                : 'Pre-Settlement Binary Leg Schedule'}
            </h3>
          </div>

          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterMode === 'ALL'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              All Distributors ({baseRows.length})
            </button>
            <button
              onClick={() => setFilterMode('MATCHABLE')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                filterMode === 'MATCHABLE'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500'
              }`}
            >
              With Matched Volume
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Distributor</th>
                <th className="py-3 px-4">Rank & Cycle Cap</th>
                <th className="py-3 px-4 text-right">Opening Left (BV)</th>
                <th className="py-3 px-4 text-right">Opening Right (BV)</th>
                <th className="py-3 px-4 text-right">Matched Weak Leg</th>
                <th className="py-3 px-4 text-right">10% Payout (INR)</th>
                <th className="py-3 px-4">Closing Carry (L → R)</th>
                <th className="py-3 px-4">Clearing Status</th>
                <th className="py-3 px-4 text-right">Passbook</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {displayRows.map((row) => {
                const hasMatch = parseFloat(row.matched_volume || '0') > 0;
                const rankLabel =
                  RANK_META[row.rank_id]?.label || row.rank_id;

                return (
                  <tr
                    key={row.user_id}
                    className={`transition ${
                      hasMatch && row.is_active
                        ? 'bg-emerald-50/20 dark:bg-emerald-950/10 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20'
                        : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {row.full_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        @{row.username}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {rankLabel}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 tabular-nums">
                        Cap: {formatINR(row.rank_cap)}
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      {formatBV(row.total_left, true)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      {formatBV(row.total_right, true)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span
                        className={`px-2 py-0.5 rounded font-semibold ${
                          hasMatch
                            ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                            : 'text-slate-400'
                        }`}
                      >
                        {formatBV(row.matched_volume, true)} BV
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                      {parseFloat(row.payout || '0') > 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400">
                          +{formatINR(row.payout, true)}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0.0000</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] tabular-nums">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <span>L: {formatBV(row.new_carry_left)}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>R: {formatBV(row.new_carry_right)}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                            row.status.includes('PAID') ||
                            row.status === 'READY_TO_SETTLE'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                              : row.status.includes('INACTIVE')
                              ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {row.status.includes('PAID') ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : row.status.includes('INACTIVE') ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : null}
                          {row.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {row.idempotency_key && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[190px]">
                          {row.idempotency_key}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectWalletUser(row.user_id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-medium transition"
                      >
                        <Wallet className="w-3 h-3" />
                        Statement
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
