import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  GitBranch,
  Users,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Receipt,
  Package
} from 'lucide-react';
import { api } from '../api';
import { formatINR, formatBV, RANK_META } from '../utils/format';

const PRODUCT_CATALOG = [
  {
    id: 'starter_250',
    name: 'Personal Care Starter Assortment',
    bv: '250.0000',
    price: '4500.0000',
    tag: '250 BV'
  },
  {
    id: 'retail_500',
    name: 'NutriLife Pro Retail Pack',
    bv: '500.0000',
    price: '9000.0000',
    tag: '500 BV'
  },
  {
    id: 'builder_1000',
    name: 'Wellness Regional Builder Kit',
    bv: '1000.0000',
    price: '18000.0000',
    tag: '1,000 BV'
  },
  {
    id: 'stockist_1500',
    name: 'AyurVeda Crown Stockist Pack',
    bv: '1500.0000',
    price: '27000.0000',
    tag: '1,500 BV'
  }
];

export default function OrderSimulator({
  users,
  preselectedBuyerId,
  initialTrace,
  onOrderProcessed
}) {
  const [buyerId, setBuyerId] = useState('');
  const [bvAmount, setBvAmount] = useState('500.0000');
  const [productName, setProductName] = useState('NutriLife Pro Retail Pack');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [trace, setTrace] = useState(initialTrace || null);
  const [orders, setOrders] = useState([]);
  const [clawbackResult, setClawbackResult] = useState(null);
  const [refundingId, setRefundingId] = useState(null);

  useEffect(() => {
    if (preselectedBuyerId) {
      setBuyerId(preselectedBuyerId);
    } else if (!buyerId && users.length > 0) {
      const deepLeaf =
        users.find((u) => u.username === 'rohan_malhotra') ||
        users.find((u) => u.username === 'liam_leaf') ||
        users[users.length - 1];
      if (deepLeaf) setBuyerId(deepLeaf._id);
    }
  }, [preselectedBuyerId, users, buyerId]);

  useEffect(() => {
    if (initialTrace && !trace) {
      setTrace(initialTrace);
    }
  }, [initialTrace, trace]);

  const loadOrders = async () => {
    try {
      const res = await api.getOrders();
      setOrders(res.orders || []);
    } catch (_) {
      // ignore
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleSelectCatalogItem = (item) => {
    setBvAmount(item.bv);
    setProductName(item.name);
  };

  const handleSimulateOrder = async (e) => {
    e.preventDefault();
    if (!buyerId) return;
    setSubmitting(true);
    setError('');
    setClawbackResult(null);

    try {
      const estimatedPrice = (parseFloat(bvAmount || '0') * 18).toFixed(4);
      const result = await api.createOrder({
        buyerId,
        bv: bvAmount,
        totalPrice: estimatedPrice,
        productName
      });
      setTrace(result);
      await loadOrders();
      if (onOrderProcessed) onOrderProcessed();
    } catch (err) {
      setError(err.message || 'Failed to process order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefundOrder = async (orderId) => {
    setRefundingId(orderId);
    setError('');
    try {
      const res = await api.refundOrder(orderId);
      setClawbackResult(res);
      await loadOrders();
      if (onOrderProcessed) onOrderProcessed();
    } catch (err) {
      setError(err.message || 'Refund reversal failed.');
    } finally {
      setRefundingId(null);
    }
  };

  const selectedBuyer = users.find((u) => u._id === buyerId);
  const bvNum = parseFloat(bvAmount || '0') || 0;
  const retailPriceINR = bvNum * 18;
  const estDirectBonusINR = bvNum * 0.1;
  const estMaxUnilevelPoolINR = bvNum * 0.21;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT PANEL: Order Entry Ticket */}
        <div className="xl:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                New Product Order & Volume Entry
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Credits upline binary legs and disburses Direct & Unilevel payouts in ₹
              </p>
            </div>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>

          <form onSubmit={handleSimulateOrder} className="p-5 space-y-4">
            {/* Distributor Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Purchasing Distributor
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const demoUser =
                      users.find((u) => u.username === 'rohan_malhotra') ||
                      users[users.length - 1];
                    if (demoUser) setBuyerId(demoUser._id);
                  }}
                  className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Select Deep-Chain Compression Case
                </button>
              </div>
              <select
                value={buyerId}
                onChange={(e) => setBuyerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-600"
              >
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.full_name} (@{u.username}) — {RANK_META[u.rank_id]?.label || u.rank_id} • {u.is_active ? 'Active' : 'Inactive'}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Package Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Select Product Package
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRODUCT_CATALOG.map((item) => {
                  const isSelected =
                    parseFloat(bvAmount) === parseFloat(item.bv) &&
                    productName === item.name;
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => handleSelectCatalogItem(item)}
                      className={`p-2.5 rounded-lg border text-left transition ${
                        isSelected
                          ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                          {item.tag}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                          {formatINR(item.price)}
                        </span>
                      </div>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate mt-1">
                        {item.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom BV Input */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Business Volume (BV)
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="1"
                  required
                  value={bvAmount}
                  onChange={(e) => setBvAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-blue-600 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Value (INR)
                </label>
                <div className="w-full px-3 py-2 rounded-lg bg-slate-100/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                  {formatINR(retailPriceINR)}
                </div>
              </div>
            </div>

            {/* Pre-Execution Invoice Summary Box */}
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Buyer Current Personal Volume</span>
                <span className="font-mono font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatBV(selectedBuyer?.metrics?.pv, true)} BV
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Direct Sponsor Bonus (10% of BV)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatINR(estDirectBonusINR, true)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Max 5-Level Unilevel Pool (21% of BV)</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white tabular-nums">
                  {formatINR(estMaxUnilevelPoolINR, true)}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <ShoppingBag className="w-4 h-4" />
              {submitting
                ? 'Posting Order & Disbursing Commissions...'
                : `Post Order (${formatBV(bvAmount)} BV • ${formatINR(retailPriceINR)})`}
            </button>
          </form>
        </div>

        {/* RIGHT PANEL: Commission & Volume Distribution Voucher */}
        <div className="xl:col-span-7 space-y-6">
          {trace ? (
            <>
              {/* 1. Unilevel & Direct Commission Disbursement Card */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Sponsor Commission Disbursement & Dynamic Compression
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Order <span className="font-mono">{trace.order?.order_number}</span> • Buyer: <span className="font-medium text-slate-700 dark:text-slate-200">@{trace.buyer?.username}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-mono text-xs font-semibold tabular-nums">
                    +{formatBV(trace.order?.bv)} BV Posted
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* Direct Sponsor Payout */}
                  {trace.directBonusTrace && (
                    <div className="p-3.5 rounded-lg bg-blue-50/50 dark:bg-blue-950/25 border border-blue-200/80 dark:border-blue-900/60 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-600 text-white">
                            Direct Referral Bonus (10%)
                          </span>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white">
                            {trace.directBonusTrace.full_name} (@{trace.directBonusTrace.username})
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                          Ref: {trace.directBonusTrace.idempotency_key}
                        </div>
                      </div>
                      <div className="text-right font-mono font-bold text-sm text-blue-700 dark:text-blue-300 tabular-nums">
                        +{formatINR(trace.directBonusTrace.amount, true)}
                      </div>
                    </div>
                  )}

                  {/* 5-Level Unilevel Dynamic Compression Table */}
                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          <th className="py-2.5 px-3">Upline Gen</th>
                          <th className="py-2.5 px-3">Sponsor Ancestor</th>
                          <th className="py-2.5 px-3">Qualification & Compression Status</th>
                          <th className="py-2.5 px-3">Paid Level</th>
                          <th className="py-2.5 px-3 text-right">Payout (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                        {trace.unilevelCompressionTrace?.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-slate-400">
                              Root distributor has no upline sponsors.
                            </td>
                          </tr>
                        ) : (
                          trace.unilevelCompressionTrace?.map((step) => {
                            const isSkipped =
                              step.status === 'SKIPPED_INACTIVE_COMPRESSED';
                            const isCompressedGain =
                              step.status === 'PAID_WITH_COMPRESSION';
                            const isPaid = step.paid_level !== null;

                            return (
                              <tr
                                key={`${step.user_id}-${step.physical_generation}`}
                                className={
                                  isSkipped
                                    ? 'bg-rose-50/50 dark:bg-rose-950/20'
                                    : isCompressedGain
                                    ? 'bg-emerald-50/30 dark:bg-emerald-950/15'
                                    : ''
                                }
                              >
                                <td className="py-2.5 px-3 font-mono text-slate-500">
                                  Gen {step.physical_generation}
                                </td>
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-slate-900 dark:text-slate-100">
                                    {step.full_name}
                                  </div>
                                  <div className="text-[11px] font-mono text-slate-400">
                                    @{step.username}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  {isSkipped ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                                      <AlertCircle className="w-3 h-3" />
                                      Inactive — Skipped (Dynamic Compression)
                                    </span>
                                  ) : isCompressedGain ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                                      <ArrowUpRight className="w-3 h-3" />
                                      Compressed +{step.compressed_up_by} Gen Upward
                                    </span>
                                  ) : isPaid ? (
                                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Active Standard Qualification
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">
                                      Beyond 5 Paid Levels
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 font-mono">
                                  {isPaid ? (
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                                      Level {step.paid_level} ({step.rate})
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">—</span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums">
                                  {isPaid ? (
                                    <span className="text-emerald-700 dark:text-emerald-400">
                                      +{formatINR(step.amount, true)}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400">₹0.0000</span>
                                  )}
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

              {/* 2. Binary Placement Leg Volume Roll-Up Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Binary Placement Upline Volume Roll-Up ({trace.binaryRollupTrace?.length || 0} Hops)
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Buyer Personal Volume updated to <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{formatBV(trace.buyer?.new_pv, true)} BV</span>
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <th className="py-2.5 px-4">Hop</th>
                        <th className="py-2.5 px-4">Binary Upline Ancestor</th>
                        <th className="py-2.5 px-4">Credited Leg</th>
                        <th className="py-2.5 px-4 text-right">Volume Added</th>
                        <th className="py-2.5 px-4 text-right">Updated Left GV</th>
                        <th className="py-2.5 px-4 text-right">Updated Right GV</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                      {trace.binaryRollupTrace?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-400">
                            Root distributor purchased — no binary ancestors above root.
                          </td>
                        </tr>
                      ) : (
                        trace.binaryRollupTrace?.map((item) => {
                          const isLeft = item.leg === 'LEFT';
                          return (
                            <tr key={`${item.user_id}-${item.hop}`}>
                              <td className="py-2.5 px-4 font-mono text-slate-400">
                                #{item.hop}
                              </td>
                              <td className="py-2.5 px-4">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">
                                  {item.full_name}
                                </span>{' '}
                                <span className="font-mono text-slate-400 text-[11px]">
                                  @{item.username}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                    isLeft
                                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                                      : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60'
                                  }`}
                                >
                                  {isLeft ? 'Left Leg GV' : 'Right Leg GV'}
                                </span>
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                                +{formatBV(item.bv_added, true)} BV
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                {formatBV(item.new_gv_left, true)}
                              </td>
                              <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                                {formatBV(item.new_gv_right, true)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-12 text-center">
              <Package className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Ready to Process Order
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Select a distributor and product package on the left to inspect the live upline Binary GV roll-up and Unilevel Dynamic Compression statement.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clawback Notification Banner */}
      {clawbackResult && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/70 text-xs space-y-2">
          <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Order {clawbackResult.order_number} Refunded — {formatBV(clawbackResult.refunded_bv, true)} BV Reversed & {clawbackResult.clawbacks_created} Clawback Debit Entries Posted
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {clawbackResult.clawbacks?.map((cb) => (
              <div
                key={cb.idempotency_key}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-800/50 flex items-center justify-between font-mono"
              >
                <span className="text-slate-700 dark:text-slate-300">@{cb.username}</span>
                <span className="text-rose-600 dark:text-rose-400 font-semibold tabular-nums">
                  {formatINR(cb.clawback_amount, true)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Order Register & Clawback Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Order Register & Refund Clawback Desk
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Issuing a refund reverses buyer PV, deducts upline Binary GV, and records offsetting debit entries in ₹
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-2.5 px-4">Order Reference</th>
                <th className="py-2.5 px-4">Distributor</th>
                <th className="py-2.5 px-4">Product Package</th>
                <th className="py-2.5 px-4 text-right">Business Volume</th>
                <th className="py-2.5 px-4 text-right">Invoice Amount (INR)</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Reversal Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {orders.slice(0, 12).map((o) => (
                <tr
                  key={o._id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition"
                >
                  <td className="py-2.5 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                    {o.order_number}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {o.buyer_id?.full_name || 'Distributor'}
                    </span>{' '}
                    <span className="font-mono text-slate-400 text-[11px]">
                      @{o.buyer_id?.username}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400">
                    {o.product_name}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formatBV(o.bv, true)} BV
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatINR(o.total_price)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        o.status === 'PAID'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60'
                      }`}
                    >
                      {o.status === 'PAID' ? 'Paid' : 'Refunded'}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    {o.status === 'PAID' ? (
                      <button
                        onClick={() => handleRefundOrder(o._id)}
                        disabled={refundingId === o._id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-800/70 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-[11px] font-medium transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {refundingId === o._id ? 'Reversing...' : 'Refund & Clawback'}
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Reversed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
