"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type MlActivityTrendChartProps = {
  data: Array<{
    date: string;
    totalDurationSeconds: number;
  }>;
  canGoBack: boolean;
  canGoForward: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

function formatSeconds(value: number) {
  if (value >= 60) {
    return `${(value / 60).toFixed(1)} min`;
  }

  return `${value.toFixed(1)} sec`;
}

function formatShortDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function MlActivityTrendChart({
  data,
  canGoBack,
  canGoForward,
  onPrevious,
  onNext,
}: MlActivityTrendChartProps) {
  const formattedData = useMemo(
    () =>
      data.map((item) => ({
        ...item,
        label: formatShortDate(item.date),
      })),
    [data],
  );

  return (
    <div className="km-panel flex min-w-0 flex-col rounded-[2rem] p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-[var(--on-surface)]">
            5-Day Activity Trend
          </h2>
          <p className="mt-1 max-w-xl text-sm text-[var(--on-surface-variant)]">
            Total detected activity per day from this student&apos;s ML reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="border-none bg-[var(--surface-container)] px-3 py-1 text-[var(--tertiary-container)] shadow-none">
            TREND
          </Badge>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            disabled={!canGoBack}
            onClick={onPrevious}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="secondary"
            disabled={!canGoForward}
            onClick={onNext}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="h-[320px] min-w-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={formattedData}
            margin={{ top: 10, right: 24, left: 0, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--outline)" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--outline)" }}
              tickFormatter={(value: number) => `${Math.round(value)}s`}
            />
            <Tooltip
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
            <Line
              type="monotone"
              dataKey="totalDurationSeconds"
              stroke="var(--primary)"
              strokeWidth={3}
              dot={{ r: 4, fill: "var(--primary)" }}
              activeDot={{ r: 6, fill: "var(--primary)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
