import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Sparkles, Plus, Play, Info } from 'lucide-react';
import { ExerciseProgressMetric } from '../../../utils/analyticsCalc';

interface StrengthTelemetryChartProps {
  metrics: ExerciseProgressMetric[];
  selectedExerciseId: string;
  onSelectExercise: (id: string) => void;
}

export const StrengthTelemetryChart: React.FC<StrengthTelemetryChartProps> = ({
  metrics,
  selectedExerciseId,
  onSelectExercise,
}) => {
  const navigate = useNavigate();
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Default fallback exercises if metrics list is sparse
  const allExercises = useMemo(() => {
    const defaultList = [
      { id: 'bench-press', name: 'Bench Press' },
      { id: 'barbell-squat', name: 'Barbell Squat' },
      { id: 'deadlift', name: 'Deadlift' },
      { id: 'incline-dumbbell-press', name: 'Incline DB Press' },
      { id: 'barbell-row', name: 'Barbell Row' },
    ];

    const merged = [...metrics.map((m) => ({ id: m.exerciseId, name: m.exerciseName }))];
    defaultList.forEach((def) => {
      if (!merged.some((m) => m.id === def.id)) {
        merged.push(def);
      }
    });

    return merged;
  }, [metrics]);

  const activeMetric = metrics.find((m) => m.exerciseId === selectedExerciseId);
  const activeExerciseName =
    activeMetric?.exerciseName ||
    allExercises.find((e) => e.id === selectedExerciseId)?.name ||
    'Bench Press';

  const historyPoints = activeMetric?.historyPoints || [];
  const hasMultiplePoints = historyPoints.length >= 2;

  // Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 220;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 35;

  const chartData = useMemo(() => {
    if (hasMultiplePoints) {
      const weights = historyPoints.map((p) => p.estimated1RM || p.weightKg);
      const minVal = Math.floor(Math.min(...weights) * 0.9);
      const maxVal = Math.ceil(Math.max(...weights) * 1.1);
      const range = maxVal - minVal || 1;

      const coords = historyPoints.map((p, idx) => {
        const x = padLeft + (idx / (historyPoints.length - 1)) * (svgWidth - padLeft - padRight);
        const val = p.estimated1RM || p.weightKg;
        const y = svgHeight - padBottom - ((val - minVal) / range) * (svgHeight - padTop - padBottom);
        return {
          ...p,
          val,
          x,
          y,
          index: idx,
        };
      });

      const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
      const areaPoints = `${coords[0].x},${svgHeight - padBottom} ${polylinePoints} ${coords[coords.length - 1].x},${svgHeight - padBottom}`;

      // Max value index for highlighting
      const maxPoint = coords.reduce((max, c) => (c.val > max.val ? c : max), coords[0]);

      return {
        hasData: true,
        coords,
        polylinePoints,
        areaPoints,
        minVal,
        maxVal,
        maxPoint,
        ghostPoints: [],
        ghostPolyline: '',
        ghostArea: '',
        baselineWeight: 0,
      };
    }

    // Ghost Projection Line for sparse / single point data
    const baselineWeight = historyPoints[0]?.weightKg || 80;
    const ghostPoints = [
      { x: padLeft, y: svgHeight - padBottom - 40, weightKg: baselineWeight, reps: 8, label: 'Session 1' },
      { x: padLeft + (svgWidth - padLeft - padRight) * 0.45, y: svgHeight - padBottom - 75, weightKg: baselineWeight + 2.5, reps: 8, label: 'Next' },
      { x: svgWidth - padRight, y: svgHeight - padBottom - 120, weightKg: baselineWeight + 5, reps: 8, label: 'Target' },
    ];

    const ghostPolyline = ghostPoints.map((g) => `${g.x},${g.y}`).join(' ');
    const ghostArea = `${ghostPoints[0].x},${svgHeight - padBottom} ${ghostPolyline} ${ghostPoints[ghostPoints.length - 1].x},${svgHeight - padBottom}`;

    return {
      hasData: false,
      coords: [],
      polylinePoints: '',
      areaPoints: '',
      minVal: 0,
      maxVal: 100,
      maxPoint: undefined,
      ghostPoints,
      ghostPolyline,
      ghostArea,
      baselineWeight,
    };
  }, [hasMultiplePoints, historyPoints]);

  const activeHoverData =
    hoveredPointIndex !== null && chartData.hasData && chartData.coords[hoveredPointIndex]
      ? chartData.coords[hoveredPointIndex]
      : null;

  return (
    <div
      className="relative rounded-2xl p-5 bg-white/85 border border-[#CBD5E1]/70 shadow-sm backdrop-blur-md space-y-4 select-none"
      style={{
        boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.04), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95)',
      }}
    >
      {/* 1. Header & Dynamic Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#475569]">
              STRENGTH PROGRESSION & TELEMETRY
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#008B8E] bg-[#008B8E]/10 px-2 py-0.5 rounded-full border border-[#008B8E]/25">
              <Sparkles size={11} />
              1RM Overload Curve
            </span>
          </div>
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight mt-0.5">
            {activeExerciseName}
          </h3>
        </div>

        {activeMetric && (
          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-xs text-[#64748B] block font-medium">Est. 1RM</span>
              <span className="text-base font-mono-metric font-bold text-[#008B8E]">
                {activeMetric.estimated1RMKg} kg
              </span>
            </div>
            <div className="h-7 w-[1px] bg-[#CBD5E1]" />
            <div className="text-right">
              <span className="text-xs text-[#64748B] block font-medium">Top Set</span>
              <span className="text-base font-mono-metric font-bold text-[#0F172A]">
                {activeMetric.heaviestWeightKg} kg
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Horizontally Scrollable Exercise Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
        {allExercises.map((ex) => {
          const isSelected = selectedExerciseId === ex.id;
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onSelectExercise(ex.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                isSelected
                  ? 'bg-[#008B8E] text-white border-[#008B8E] shadow-sm shadow-[#008B8E]/30'
                  : 'bg-white/80 text-[#475569] border-[#CBD5E1] hover:bg-white hover:text-[#0F172A]'
              }`}
            >
              {ex.name}
            </button>
          );
        })}
      </div>

      {/* 3. Interactive SVG Chart Canvas */}
      <div className="relative bg-[#F8FAFC]/90 rounded-2xl p-3 border border-[#CBD5E1]/60 overflow-hidden">
        {/* Dynamic Tooltip Float */}
        {activeHoverData && (
          <div
            className="absolute z-30 pointer-events-none p-2.5 rounded-xl bg-[#0F172A] text-white shadow-xl border border-white/15 text-xs transition-transform duration-75 animate-fade-in"
            style={{
              left: `${(activeHoverData.x / svgWidth) * 100}%`,
              top: '15px',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-[10px] text-[#B4FF39] font-bold uppercase tracking-wider">
              {new Date(activeHoverData.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
            <div className="font-bold text-white mt-0.5">
              {activeHoverData.weightKg} kg × {activeHoverData.reps} reps
            </div>
            <div className="text-[10px] text-[#94A3B8] mt-0.5">
              Est. 1RM:{' '}
              <span className="font-mono-metric font-bold text-[#B4FF39]">
                {activeHoverData.val} kg
              </span>
            </div>
          </div>
        )}

        <div className="w-full">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-44 sm:h-52 overflow-visible"
          >
            <defs>
              {/* Telemetry area fill gradient: teal fading to transparent */}
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#008B8E" stopOpacity="0.28" />
                <stop offset="85%" stopColor="#008B8E" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#008B8E" stopOpacity="0.0" />
              </linearGradient>

              {/* Ghost projection gradient */}
              <linearGradient id="ghostGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.0" />
              </linearGradient>

              {/* Neon point glow filter */}
              <filter id="glowPoint" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Horizontal Guide Grid Lines & Y-Axis Labels */}
            {[0.2, 0.5, 0.8].map((ratio, i) => {
              const yPos = padTop + ratio * (svgHeight - padTop - padBottom);
              return (
                <g key={i}>
                  <line
                    x1={padLeft}
                    y1={yPos}
                    x2={svgWidth - padRight}
                    y2={yPos}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  {chartData.hasData && (
                    <text
                      x={padLeft - 8}
                      y={yPos + 3}
                      textAnchor="end"
                      className="text-[9px] fill-[#64748B] font-mono-metric font-semibold"
                    >
                      {Math.round(chartData.maxVal - ratio * (chartData.maxVal - chartData.minVal))} kg
                    </text>
                  )}
                </g>
              );
            })}

            {/* REAL DATA PRESENT */}
            {chartData.hasData && (
              <>
                {/* Area Gradient */}
                <polygon points={chartData.areaPoints} fill="url(#areaGradient)" />

                {/* Primary Telemetry Line */}
                <polyline
                  points={chartData.polylinePoints}
                  fill="none"
                  stroke="#008B8E"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {chartData.coords.map((pt, idx) => {
                  const isHovered = hoveredPointIndex === idx;
                  const isPeak = chartData.maxPoint?.index === idx;

                  return (
                    <g
                      key={idx}
                      className="cursor-pointer transition-transform"
                      onMouseEnter={() => setHoveredPointIndex(idx)}
                      onMouseLeave={() => setHoveredPointIndex(null)}
                    >
                      {/* Interactive Touch/Hover hit circle */}
                      <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                      {/* Electric Volt Peak Indicator Ring */}
                      {isPeak && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="9"
                          fill="transparent"
                          stroke="#B4FF39"
                          strokeWidth="2.5"
                          className="animate-pulse"
                        />
                      )}

                      {/* Data Point Dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : isPeak ? 5 : 4}
                        fill={isPeak ? '#B4FF39' : '#008B8E'}
                        stroke="#FFFFFF"
                        strokeWidth={isHovered ? 3 : 2}
                        filter={isPeak ? 'url(#glowPoint)' : undefined}
                      />

                      {/* X-Axis Date Labels */}
                      <text
                        x={pt.x}
                        y={svgHeight - 12}
                        textAnchor="middle"
                        className="text-[9px] fill-[#64748B] font-semibold"
                      >
                        {new Date(pt.date).toLocaleDateString('en-US', {
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </text>
                    </g>
                  );
                })}
              </>
            )}

            {/* EMPTY / SPARSE STATE (<2 sessions): GHOST PROJECTION LINE */}
            {!chartData.hasData && (
              <>
                {/* Ghost Area */}
                <polygon points={chartData.ghostArea} fill="url(#ghostGradient)" />

                {/* Dashed Ghost Trajectory Curve */}
                <polyline
                  points={chartData.ghostPolyline}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />

                {/* Projected Nodes */}
                {chartData.ghostPoints.map((g, i) => (
                  <g key={i}>
                    <circle
                      cx={g.x}
                      cy={g.y}
                      r="4.5"
                      fill={i === 0 ? '#008B8E' : '#94A3B8'}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />
                    <text
                      x={g.x}
                      y={g.y - 10}
                      textAnchor="middle"
                      className="text-[10px] fill-[#64748B] font-mono-metric font-bold"
                    >
                      {g.weightKg} kg
                    </text>
                    <text
                      x={g.x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className="text-[9px] fill-[#94A3B8] font-semibold"
                    >
                      {g.label}
                    </text>
                  </g>
                ))}
              </>
            )}
          </svg>
        </div>

        {/* Empty State Callout Overlay */}
        {!chartData.hasData && (
          <div className="mt-2 p-3 rounded-xl bg-white/90 border border-[#CBD5E1] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <div className="w-8 h-8 rounded-full bg-[#008B8E]/10 text-[#008B8E] flex items-center justify-center shrink-0">
                <Info size={16} />
              </div>
              <p className="text-xs text-[#475569]">
                Log <span className="font-bold text-[#0F172A]">1 more session</span> of{' '}
                <span className="font-bold text-[#008B8E]">{activeExerciseName}</span> to unlock
                live 1RM velocity curves and overload forecasting.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/workouts')}
              className="px-3.5 py-2 rounded-xl bg-[#008B8E] hover:bg-[#00A3A6] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer uppercase tracking-wider"
            >
              <Play size={12} fill="currentColor" />
              <span>Train Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
