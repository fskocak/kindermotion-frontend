"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import type { TeacherStudentReportMetric } from "@/types/teacher";

type MlDailyActivityChartProps = {
  metric: TeacherStudentReportMetric | null;
};

function formatSeconds(value: number) {
  if (value >= 60) {
    return `${(value / 60).toFixed(1)} min`;
  }

  return `${value.toFixed(1)} sec`;
}

export function MlDailyActivityChart({ metric }: MlDailyActivityChartProps) {
  const data = useMemo(() => {
    if (!metric) {
      return [];
    }

    return [
      { label: "Sitting", seconds: metric.sittingSeconds, fill: "#4cc9f0" },
      { label: "Standing", seconds: metric.standingSeconds, fill: "#22c55e" },
      { label: "Walking", seconds: metric.walkingSeconds, fill: "#f59e0b" },
      {
        label: "Hand Raised",
        seconds: metric.handRaisedSeconds,
        fill: "#a78bfa",
      },
      { label: "Clapping", seconds: metric.clappingSeconds, fill: "#fb7185" },
      {
        label: "Hand/Arm",
        seconds: metric.handArmMovementSeconds,
        fill: "#f97316",
      },
    ];
  }, [metric]);

  return (
    <div className="km-panel flex min-w-0 flex-col rounded-[2rem] p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[var(--on-surface)]">
            Daily ML Activity
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--on-surface-variant)]">
            Selected report date summary from the generated ML report.
          </p>
        </div>
        <Badge className="border-none bg-[var(--surface-container)] px-3 py-1 text-[var(--tertiary-container)] shadow-none">
          BEHAVIOR
        </Badge>
      </div>

      {metric ? (
        <>
          <div className="mb-4 text-sm text-[var(--on-surface-variant)]">
            Total detected activity:{" "}
            <span className="font-semibold text-[var(--on-surface)]">
              {formatSeconds(metric.totalDurationSeconds)}
            </span>
          </div>
          <div className="h-[340px] min-w-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={data}
                margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
              >
                <CartesianGrid
                  horizontal={false}
                  stroke="rgba(255,255,255,0.08)"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--outline)" }}
                  tickFormatter={(value: number) => `${Math.round(value)}s`}
                />
                <YAxis
                  type="category"
                  dataKey="label"
                  width={104}
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: "var(--outline)",
                    fontWeight: 600,
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) {
                      return null;
                    }

                    const item = payload[0];
                    return (
                      <div className="km-tooltip rounded-xl p-3">
                        <p className="text-sm font-semibold text-[var(--on-surface)]">
                          {item.payload.label}
                        </p>
                        <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
                          {formatSeconds(Number(item.value ?? 0))}
                        </p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="seconds" barSize={24} radius={[0, 10, 10, 0]}>
                  {data.map((entry) => (
                    <Cell key={entry.label} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="rounded-[1.5rem] bg-[var(--surface-container-lowest)] p-4 text-sm text-[var(--on-surface-variant)]">
          Select a report date to see that day&apos;s ML activity breakdown.
        </div>
      )}
    </div>
  );
}
