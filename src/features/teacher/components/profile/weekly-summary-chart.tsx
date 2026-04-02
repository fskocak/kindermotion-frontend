"use client";

import { useMemo } from "react";
import { Area, AreaChart, Tooltip, XAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import type { TeacherStudentActivity } from "@/types/teacher";

type WeeklySummaryChartProps = {
  data: TeacherStudentActivity[];
};

export function WeeklySummaryChart({ data }: WeeklySummaryChartProps) {
  const formattedData = useMemo(() => {
    if (!data || data.length === 0) {
      return [
        { day: "Mon", activity: 0 },
        { day: "Tue", activity: 0 },
        { day: "Wed", activity: 0 },
        { day: "Thu", activity: 0 },
        { day: "Fri", activity: 0 },
        { day: "Sat", activity: 0 },
        { day: "Sun", activity: 0 },
      ];
    }

    return data.map((d) => ({
      day: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
        new Date(d.date),
      ),
      activity: d.score,
    }));
  }, [data]);

  return (
    <div className="km-panel flex h-[360px] min-w-0 flex-col rounded-[2rem] p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-[-0.02em] text-[var(--on-surface)]">
            Weekly Summary
          </h2>
          <p className="mt-1 text-sm text-[var(--on-surface-variant)]">
            Movement activity levels over the last 7 days
          </p>
        </div>
        <Badge className="border-none bg-[var(--surface-container)] px-3 py-1 text-[var(--tertiary-container)] shadow-none">
          <span className="mr-2 h-1.5 w-1.5 rounded-full bg-[var(--primary)]" />
          ACTIVITY
        </Badge>
      </div>

      <div className="h-[200px] min-w-0 w-full">
        <AreaChart
          responsive
          data={formattedData}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
          style={{ width: "100%", height: "100%", minWidth: 0 }}
        >
          <defs>
            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--primary-container)"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="var(--primary-container)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{
              fontSize: 10,
              fill: "var(--outline)",
              fontWeight: 600,
              letterSpacing: "0.1em",
            }}
            dy={10}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="km-tooltip rounded-xl p-3">
                    <p className="text-sm font-bold text-[var(--on-surface)]">
                      {payload[0].value}% active
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="activity"
            stroke="var(--primary)"
            strokeWidth={4}
            fill="url(#colorActivity)"
            activeDot={{
              r: 6,
              fill: "var(--primary)",
              stroke: "var(--surface)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </div>
    </div>
  );
}
