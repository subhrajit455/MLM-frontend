import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  MarkerType,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import {
  GitBranch,
  Users,
  ChevronRight,
  CornerLeftUp,
  UserPlus,
  Wallet,
  ShoppingBag,
  Search,
  X,
  ArrowUpRight,
  Building2,
  SlidersHorizontal
} from 'lucide-react';
import { api } from '../api';
import { formatINR, formatBV, getInitials, RANK_META } from '../utils/format';

/**
 * Bespoke Distributor Node Card for React Flow
 */
function DistributorNode({ data }) {
  const {
    nodeData,
    isRoot,
    onDrillDown,
    onInspectNode,
    onSelectWallet,
    onSimulateOrder
  } = data;

  const m = nodeData.metrics || {};
  const leftTotal = parseFloat(m.total_left || m.gv_left || '0');
  const rightTotal = parseFloat(m.total_right || m.gv_right || '0');
  const combinedGv = leftTotal + rightTotal;
  const leftPct = combinedGv > 0 ? Math.round((leftTotal / combinedGv) * 100) : 50;
  const rightPct = 100 - leftPct;

  const rankMeta = RANK_META[nodeData.rank_id] || RANK_META.SILVER;

  return (
    <div
      onClick={() => onInspectNode && onInspectNode(nodeData)}
      className={`w-[276px] rounded-xl bg-white dark:bg-[#111827] border transition-all cursor-pointer select-none ${
        isRoot
          ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-600/15 shadow-md'
          : nodeData.is_active
          ? 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm hover:shadow'
          : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-400 dark:!bg-slate-600 !border-0"
      />

      {/* Top Status & Position Strip */}
      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${rankMeta.badgeLight} ${rankMeta.badgeDark}`}
          >
            {rankMeta.label}
          </span>
          {nodeData.position && nodeData.position !== 'ROOT' && (
            <span className="px-1.5 py-0.5 text-[10px] font-mono font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {nodeData.position === 'LEFT' ? 'Left Leg' : 'Right Leg'}
            </span>
          )}
          {isRoot && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              Root
            </span>
          )}
        </div>

        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
            nodeData.is_active
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              nodeData.is_active ? 'bg-emerald-500' : 'bg-rose-500'
            }`}
          />
          {nodeData.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Distributor Identity */}
      <div className="p-3.5">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              nodeData.is_active
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                : 'bg-rose-100/70 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
            }`}
          >
            {getInitials(nodeData.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-[13px] text-slate-900 dark:text-slate-100 truncate leading-tight">
              {nodeData.full_name}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
              @{nodeData.username}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Personal PV
            </div>
            <div className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatBV(m.pv)}
            </div>
          </div>
        </div>

        {/* Binary Leg Volume Split */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] mb-1.5 tabular-nums">
            <div>
              <span className="text-slate-400 dark:text-slate-500 mr-1">L:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                {formatBV(m.total_left || m.gv_left)} BV
              </span>
            </div>
            <div>
              <span className="text-slate-400 dark:text-slate-500 mr-1">R:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                {formatBV(m.total_right || m.gv_right)} BV
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex gap-0.5">
            <div
              className="h-full bg-blue-600 dark:bg-blue-500 rounded-l-full transition-all duration-300"
              style={{ width: `${leftPct}%` }}
            />
            <div
              className="h-full bg-indigo-400 dark:bg-indigo-400 rounded-r-full transition-all duration-300"
              style={{ width: `${rightPct}%` }}
            />
          </div>

          {(parseFloat(m.carry_left || '0') > 0 || parseFloat(m.carry_right || '0') > 0) && (
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-amber-700 dark:text-amber-400 tabular-nums">
              <span>Carry L: {formatBV(m.carry_left)}</span>
              <span>Carry R: {formatBV(m.carry_right)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Action Footer */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="px-3 py-2 bg-slate-50/70 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800/80 rounded-b-xl flex items-center justify-between gap-1.5"
      >
        <button
          onClick={() => onDrillDown(nodeData._id)}
          className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
        >
          Focus Subtree
        </button>

        <button
          onClick={() => onSimulateOrder(nodeData._id)}
          className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition inline-flex items-center gap-1"
          title="Place Order for this Distributor"
        >
          <ShoppingBag className="w-3 h-3" />
          Order
        </button>

        <button
          onClick={() => onSelectWallet(nodeData._id)}
          className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition inline-flex items-center gap-1"
          title="Open Distributor Passbook"
        >
          <Wallet className="w-3 h-3" />
          Passbook
        </button>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-slate-400 dark:!bg-slate-600 !border-0"
      />
    </div>
  );
}

/**
 * Clean Architectural Vacant Binary Slot Node
 */
function EmptySlotNode({ data }) {
  const { nodeData, onOpenVacantSlotModal } = data;
  const isLeft = nodeData.position === 'LEFT';

  return (
    <div className="w-[216px]">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-slate-300 dark:!bg-slate-700 !border-0"
      />
      <button
        onClick={() => onOpenVacantSlotModal(nodeData)}
        className="w-full group rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white/60 dark:bg-slate-900/40 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 p-3 text-left transition-all"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400">
            {isLeft ? 'Left Binary Slot' : 'Right Binary Slot'}
          </span>
          <span className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-600 group-hover:text-white text-slate-500 flex items-center justify-center transition">
            <UserPlus className="w-3 h-3" />
          </span>
        </div>
        <div className="mt-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          + Assign Distributor
        </div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
          Under @{nodeData.parent_username}
        </div>
      </button>
    </div>
  );
}

const nodeTypes = {
  distributorNode: DistributorNode,
  emptySlotNode: EmptySlotNode
};

/**
 * Automatic Dagre Hierarchical Layout (Top-to-Bottom 'TB')
 */
function buildDagreLayout(rawNodes, rawEdges, callbacks, currentRootId) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({
    rankdir: 'TB',
    nodesep: 48,
    ranksep: 96,
    marginx: 24,
    marginy: 24
  });

  const rfNodes = rawNodes.map((n) => {
    const isEmpty = n.node_type === 'EMPTY_SLOT';
    const width = isEmpty ? 216 : 276;
    const height = isEmpty ? 88 : 204;

    g.setNode(n._id, { width, height });

    return {
      id: n._id,
      type: isEmpty ? 'emptySlotNode' : 'distributorNode',
      position: { x: 0, y: 0 },
      data: {
        nodeData: n,
        isRoot: n._id === currentRootId,
        ...callbacks
      }
    };
  });

  const rfEdges = rawEdges.map((e) => {
    g.setEdge(e.source, e.target);
    const isEmptyEdge = e.edge_type === 'EMPTY_SLOT';
    const isLeft = e.leg === 'LEFT';

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      label:
        e.edge_type === 'UNILEVEL'
          ? e.label
          : e.leg
          ? e.leg === 'LEFT'
            ? 'L'
            : 'R'
          : undefined,
      labelStyle: {
        fill: '#64748b',
        fontWeight: 600,
        fontSize: 10,
        fontFamily: 'JetBrains Mono'
      },
      labelBgStyle: {
        fill: 'transparent'
      },
      style: {
        stroke: isEmptyEdge
          ? '#cbd5e1'
          : e.edge_type === 'UNILEVEL'
          ? '#2563eb'
          : isLeft
          ? '#2563eb'
          : '#6366f1',
        strokeWidth: isEmptyEdge ? 1.25 : 1.75,
        strokeDasharray: isEmptyEdge ? '4 4' : undefined
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: isEmptyEdge
          ? '#cbd5e1'
          : e.edge_type === 'UNILEVEL'
          ? '#2563eb'
          : isLeft
          ? '#2563eb'
          : '#6366f1'
      }
    };
  });

  dagre.layout(g);

  const layoutedNodes = rfNodes.map((node) => {
    const pos = g.node(node.id);
    const isEmpty = node.type === 'emptySlotNode';
    const width = isEmpty ? 216 : 276;
    const height = isEmpty ? 88 : 204;

    return {
      ...node,
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2
      }
    };
  });

  return { nodes: layoutedNodes, edges: rfEdges };
}

export default function GenealogyTree({
  users,
  refreshTrigger,
  onNetworkMutated,
  onSelectWalletUser,
  onJumpToSimulatorUser
}) {
  const [treeType, setTreeType] = useState('binary'); // 'binary' | 'unilevel'
  const [rootId, setRootId] = useState('root');
  const [depth, setDepth] = useState(3);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inspectedNode, setInspectedNode] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Enrollment modal state
  const [enrollModal, setEnrollModal] = useState({
    open: false,
    mode: 'VACANT_SLOT',
    parentId: '',
    parentUsername: '',
    position: 'LEFT',
    sponsorId: '',
    preferredLeg: 'OUTER_LEFT',
    username: '',
    full_name: '',
    email: '',
    rank_id: 'SILVER',
    is_active: true,
    initialBv: '500.0000',
    submitting: false,
    error: ''
  });

  const handleDrillDown = useCallback((targetUserId) => {
    setRootId(targetUserId);
  }, []);

  const handleInspectNode = useCallback((nodeData) => {
    setInspectedNode(nodeData);
  }, []);

  const handleOpenVacantSlotModal = useCallback((slotNode) => {
    setEnrollModal({
      open: true,
      mode: 'VACANT_SLOT',
      parentId: slotNode.parent_id,
      parentUsername: slotNode.parent_username,
      position: slotNode.position,
      sponsorId: slotNode.parent_id,
      preferredLeg: slotNode.position === 'RIGHT' ? 'OUTER_RIGHT' : 'OUTER_LEFT',
      username: '',
      full_name: '',
      email: '',
      rank_id: 'SILVER',
      is_active: true,
      initialBv: '500.0000',
      submitting: false,
      error: ''
    });
  }, []);

  const handleOpenSpilloverModal = () => {
    const defaultSponsor = users[0]?._id || '';
    setEnrollModal({
      open: true,
      mode: 'AUTO_SPILLOVER',
      parentId: '',
      parentUsername: '',
      position: 'LEFT',
      sponsorId: defaultSponsor,
      preferredLeg: 'OUTER_LEFT',
      username: '',
      full_name: '',
      email: '',
      rank_id: 'SILVER',
      is_active: true,
      initialBv: '500.0000',
      submitting: false,
      error: ''
    });
  };

  const callbacks = useMemo(
    () => ({
      onDrillDown: handleDrillDown,
      onInspectNode: handleInspectNode,
      onOpenVacantSlotModal: handleOpenVacantSlotModal,
      onSelectWallet: onSelectWalletUser,
      onSimulateOrder: onJumpToSimulatorUser
    }),
    [
      handleDrillDown,
      handleInspectNode,
      handleOpenVacantSlotModal,
      onSelectWalletUser,
      onJumpToSimulatorUser
    ]
  );

  const fetchTreeData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getTree(rootId, depth, treeType);
      setBreadcrumbs(data.breadcrumbs || []);
      const actualRootId = data.root?._id || rootId;
      const layouted = buildDagreLayout(
        data.nodes || [],
        data.edges || [],
        callbacks,
        actualRootId
      );
      setNodes(layouted.nodes);
      setEdges(layouted.edges);
    } catch (err) {
      setError(err.message || 'Failed to load genealogy tree.');
    } finally {
      setLoading(false);
    }
  }, [rootId, depth, treeType, callbacks, setNodes, setEdges]);

  useEffect(() => {
    fetchTreeData();
  }, [fetchTreeData, refreshTrigger]);

  const handleUpOneLevel = () => {
    if (breadcrumbs.length >= 2) {
      const parentCrumb = breadcrumbs[breadcrumbs.length - 2];
      setRootId(parentCrumb._id);
    }
  };

  const handleEnrollSubmit = async (e) => {
    e.preventDefault();
    setEnrollModal((prev) => ({ ...prev, submitting: true, error: '' }));

    try {
      const cleanHandle = enrollModal.username
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');

      const payload = {
        username: cleanHandle,
        full_name: enrollModal.full_name.trim(),
        email:
          enrollModal.email.trim() || `${cleanHandle}@vantara.in`,
        rank_id: enrollModal.rank_id,
        is_active: enrollModal.is_active,
        sponsorId: enrollModal.sponsorId,
        initialBv: enrollModal.initialBv
      };

      if (enrollModal.mode === 'VACANT_SLOT') {
        payload.placementParentId = enrollModal.parentId;
        payload.position = enrollModal.position;
      } else {
        payload.preferredLeg = enrollModal.preferredLeg;
      }

      await api.registerUser(payload);
      setEnrollModal((prev) => ({ ...prev, open: false, submitting: false }));
      if (onNetworkMutated) onNetworkMutated();
      fetchTreeData();
    } catch (err) {
      setEnrollModal((prev) => ({
        ...prev,
        submitting: false,
        error: err.message
      }));
    }
  };

  return (
    <div className="relative flex flex-col h-[calc(100vh-132px)] min-h-[640px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
      {/* Primary Control Bar */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tree Mode Segmented Toggle */}
          <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <button
              onClick={() => setTreeType('binary')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                treeType === 'binary'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Binary Placement
            </button>
            <button
              onClick={() => setTreeType('unilevel')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
                treeType === 'unilevel'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Sponsor Unilevel
            </button>
          </div>

          {/* Quick Distributor Search / Focus */}
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
            <select
              value={rootId === 'root' && users[0] ? users[0]._id : rootId}
              onChange={(e) => setRootId(e.target.value)}
              className="pl-8 pr-7 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:border-blue-500"
            >
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  Focus: {u.full_name} (@{u.username})
                </option>
              ))}
            </select>
          </div>

          {/* Levels Selector */}
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            <SlidersHorizontal className="w-3 h-3 text-slate-400 mr-1" />
            <span className="text-slate-500 dark:text-slate-400 mr-1">Levels:</span>
            {[2, 3, 4, 5, 6].map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`w-6 h-6 rounded font-mono text-xs font-semibold transition ${
                  depth === d
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRootId('root')}
            disabled={breadcrumbs.length <= 1}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
          >
            Root View
          </button>

          <button
            onClick={handleUpOneLevel}
            disabled={breadcrumbs.length <= 1}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 transition"
          >
            <CornerLeftUp className="w-3.5 h-3.5" />
            Step Up
          </button>

          <button
            onClick={handleOpenSpilloverModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            New Spillover Enrollment
          </button>
        </div>
      </div>

      {/* Lineage Breadcrumb Bar */}
      <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-slate-400 dark:text-slate-500 font-medium mr-1">
            Hierarchy Path:
          </span>
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb._id}>
                <button
                  onClick={() => setRootId(crumb._id)}
                  className={`px-2 py-0.5 rounded font-mono text-[11px] transition ${
                    isLast
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800/60'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  @{crumb.username}
                </button>
                {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Qualified Active
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Inactive (Compressed in Unilevel)
          </span>
          <span className="hidden sm:inline text-slate-400">
            Click any card to inspect details or click a dashed slot to assign a member
          </span>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="relative flex-1 bg-[#F8FAFC] dark:bg-[#0B0F17]">
        {loading && (
          <div className="absolute top-3 right-3 z-20 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            Refreshing network...
          </div>
        )}

        {error && (
          <div className="absolute top-3 left-3 z-20 px-3.5 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/90 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={1.4}
        >
          <Background color="#94a3b8" gap={24} size={1} />
          <Controls position="bottom-right" />
          <MiniMap
            position="bottom-left"
            nodeColor={(n) => {
              if (n.type === 'emptySlotNode') return '#cbd5e1';
              return n.data?.nodeData?.is_active ? '#2563eb' : '#e11d48';
            }}
            maskColor="rgba(15, 23, 42, 0.08)"
            className="!bg-white dark:!bg-slate-900"
          />
        </ReactFlow>

        {/* Slide-Over Distributor Profile Drawer */}
        {inspectedNode && (
          <div className="absolute top-3 right-3 bottom-3 w-80 max-w-[90vw] z-30 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Distributor Profile
                </div>
                <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                  {inspectedNode.full_name}
                </div>
              </div>
              <button
                onClick={() => setInspectedNode(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div>
                  <div className="text-slate-400 text-[11px]">Distributor ID</div>
                  <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                    @{inspectedNode.username}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[11px]">Weekly Binary Cap</div>
                  <div className="font-mono font-semibold text-slate-900 dark:text-white">
                    {formatINR(inspectedNode.rank_cap)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Volume Summary (Active Period)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Personal Volume</div>
                    <div className="font-mono font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                      {formatBV(inspectedNode.metrics?.pv, true)} BV
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Sponsor Handle</div>
                    <div className="font-mono font-semibold text-sm text-blue-600 dark:text-blue-400 mt-0.5 truncate">
                      @{inspectedNode.sponsor_username || 'Root'}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Left Leg Total</div>
                    <div className="font-mono font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                      {formatBV(inspectedNode.metrics?.total_left, true)} BV
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800">
                    <div className="text-[10px] text-slate-400">Right Leg Total</div>
                    <div className="font-mono font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                      {formatBV(inspectedNode.metrics?.total_right, true)} BV
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Materialized Binary Path
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 font-mono text-[10px] text-slate-500 break-all">
                  {inspectedNode.binary_path}
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onJumpToSimulatorUser(inspectedNode._id)}
                  className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs inline-flex items-center justify-center gap-1.5 transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Create Order
                </button>
                <button
                  onClick={() => onSelectWalletUser(inspectedNode._id)}
                  className="py-2 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs inline-flex items-center justify-center gap-1.5 hover:bg-slate-50 transition"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  Passbook
                </button>
              </div>
              <button
                onClick={() => {
                  setRootId(inspectedNode._id);
                  setInspectedNode(null);
                }}
                className="w-full py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
              >
                Focus Genealogy on @{inspectedNode.username}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Clean Distributor Enrollment Modal */}
      {enrollModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {enrollModal.mode === 'VACANT_SLOT'
                    ? `Assign Distributor to ${enrollModal.position === 'LEFT' ? 'Left' : 'Right'} Binary Slot`
                    : 'New Distributor Enrollment (Extreme-Leg Spillover)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {enrollModal.mode === 'VACANT_SLOT'
                    ? `Placement Parent: @${enrollModal.parentUsername} • Position: ${enrollModal.position}`
                    : 'Automatically assigns to the next open outer binary position under sponsor'}
                </p>
              </div>
              <button
                onClick={() => setEnrollModal((p) => ({ ...p, open: false }))}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEnrollSubmit} className="p-5 space-y-4 text-xs">
              {enrollModal.error && (
                <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-medium">
                  {enrollModal.error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollModal.full_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const suggestedHandle = name
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9]+/g, '_')
                        .replace(/^_|_$/g, '');
                      setEnrollModal((p) => ({
                        ...p,
                        full_name: name,
                        username: p.username || suggestedHandle
                      }));
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                    placeholder="e.g.Kiran Deshpande"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Distributor Handle *
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollModal.username}
                    onChange={(e) =>
                      setEnrollModal((p) => ({ ...p, username: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-blue-600"
                    placeholder="kiran_deshpande"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Enrolling Sponsor (Unilevel)
                  </label>
                  <select
                    value={enrollModal.sponsorId}
                    onChange={(e) =>
                      setEnrollModal((p) => ({ ...p, sponsorId: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    {users.map((u) => (
                      <option key={u._id} value={u._id}>
                        {u.full_name} (@{u.username})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Initial Rank Tier
                  </label>
                  <select
                    value={enrollModal.rank_id}
                    onChange={(e) =>
                      setEnrollModal((p) => ({ ...p, rank_id: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  >
                    {Object.entries(RANK_META).map(([key, meta]) => (
                      <option key={key} value={key}>
                        {meta.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {enrollModal.mode === 'AUTO_SPILLOVER' && (
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    Spillover Leg Preference
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'OUTER_LEFT', label: 'Extreme Left Leg' },
                      { id: 'OUTER_RIGHT', label: 'Extreme Right Leg' }
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() =>
                          setEnrollModal((p) => ({ ...p, preferredLeg: opt.id }))
                        }
                        className={`py-2 px-3 rounded-lg font-medium border transition ${
                          enrollModal.preferredLeg === opt.id
                            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-600 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                    First Order Volume (BV)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={enrollModal.initialBv}
                    onChange={(e) =>
                      setEnrollModal((p) => ({ ...p, initialBv: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div className="pt-4">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enrollModal.is_active}
                      onChange={(e) =>
                        setEnrollModal((p) => ({
                          ...p,
                          is_active: e.target.checked
                        }))
                      }
                      className="rounded text-blue-600 focus:ring-blue-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">
                      Active Qualification
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEnrollModal((p) => ({ ...p, open: false }))}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={enrollModal.submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm disabled:opacity-50"
                >
                  {enrollModal.submitting ? 'Enrolling...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
