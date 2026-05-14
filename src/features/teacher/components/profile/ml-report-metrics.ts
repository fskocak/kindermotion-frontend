import type {
  TeacherStudentReport,
  TeacherStudentReportMetric,
} from "@/types/teacher";

type PredictionCsvRow = {
  trackId: number;
  windowDurationSeconds: number;
  startTimeSeconds: number | null;
  posture: string;
  finalAction: string;
};

type TeacherStudentDailySummary = {
  date: string;
  totalDurationSeconds: number;
};

const EMPTY_METRIC: TeacherStudentReportMetric = {
  date: "",
  totalDurationSeconds: 0,
  sittingSeconds: 0,
  standingSeconds: 0,
  walkingSeconds: 0,
  handRaisedSeconds: 0,
  clappingSeconds: 0,
  handArmMovementSeconds: 0,
};

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      const nextChar = line[index + 1];
      if (inQuotes && nextChar === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}

function parsePredictionCsv(csvText: string) {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const trackIndex = headers.indexOf("track_id");
  const durationIndex = headers.indexOf("window_duration_sec");
  const startTimeIndex = headers.indexOf("start_time_sec");
  const postureIndex = headers.indexOf("posture_pred");
  const actionIndex = headers.indexOf("final_action");

  if (
    trackIndex === -1 ||
    durationIndex === -1 ||
    postureIndex === -1 ||
    actionIndex === -1
  ) {
    return [];
  }

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const durationValue = Number.parseFloat(cells[durationIndex] ?? "0");
    const startTimeValue =
      startTimeIndex === -1
        ? Number.NaN
        : Number.parseFloat(cells[startTimeIndex] ?? "");
    const trackValue = Number.parseInt(cells[trackIndex] ?? "", 10);

    return {
      trackId: Number.isFinite(trackValue) ? trackValue : -1,
      windowDurationSeconds: Number.isFinite(durationValue) ? durationValue : 0,
      startTimeSeconds: Number.isFinite(startTimeValue) ? startTimeValue : null,
      posture: (cells[postureIndex] ?? "").trim().toLowerCase(),
      finalAction: (cells[actionIndex] ?? "").trim().toLowerCase(),
    } satisfies PredictionCsvRow;
  });
}

function getWindowStepSeconds(rows: PredictionCsvRow[]) {
  const starts = rows
    .map((row) => row.startTimeSeconds)
    .filter((value): value is number => value !== null)
    .sort((a, b) => a - b);

  const diffs: number[] = [];

  for (let index = 1; index < starts.length; index += 1) {
    const diff = starts[index] - starts[index - 1];

    if (diff > 0) {
      diffs.push(diff);
    }
  }

  if (diffs.length === 0) {
    return 0.5;
  }

  const sortedDiffs = [...diffs].sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedDiffs.length / 2);

  if (sortedDiffs.length % 2 === 1) {
    return sortedDiffs[middleIndex];
  }

  return (sortedDiffs[middleIndex - 1] + sortedDiffs[middleIndex]) / 2;
}

function toDateKey(value: string) {
  return new Date(value).toISOString().slice(0, 10);
}

function emptyMetricForDate(date: string): TeacherStudentReportMetric {
  return {
    ...EMPTY_METRIC,
    date,
  };
}

export async function buildStudentReportMetrics(
  reports: TeacherStudentReport[],
  getPredictionCsvText: (jobId: string) => Promise<string>,
) {
  const metricsByDate = new Map<string, TeacherStudentReportMetric>();

  const results = await Promise.allSettled(
    reports.map(async (report) => {
      const csvText = await getPredictionCsvText(report.jobId);
      const rows = parsePredictionCsv(csvText).filter(
        (row) => row.trackId === report.trackId,
      );

      if (rows.length === 0) {
        return;
      }

      const dateKey = toDateKey(report.recordingStartedAt);
      const currentMetric =
        metricsByDate.get(dateKey) ?? emptyMetricForDate(dateKey);
      const windowStepSeconds = getWindowStepSeconds(rows);

      for (const row of rows) {
        currentMetric.totalDurationSeconds += windowStepSeconds;

        if (row.posture === "sitting") {
          currentMetric.sittingSeconds += windowStepSeconds;
        } else if (row.posture === "standing") {
          currentMetric.standingSeconds += windowStepSeconds;
        } else if (row.posture === "walking") {
          currentMetric.walkingSeconds += windowStepSeconds;
        }

        if (row.finalAction === "hand_raised") {
          currentMetric.handRaisedSeconds += windowStepSeconds;
        } else if (row.finalAction === "clapping") {
          currentMetric.clappingSeconds += windowStepSeconds;
        } else if (row.finalAction === "hand_arm_movement") {
          currentMetric.handArmMovementSeconds += windowStepSeconds;
        }
      }

      metricsByDate.set(dateKey, currentMetric);
    }),
  );

  const failedCount = results.filter((result) => result.status === "rejected").length;

  return {
    metrics: Array.from(metricsByDate.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
    failedCount,
  };
}

export function getReportDateOptions(metrics: TeacherStudentReportMetric[]) {
  return metrics.map((metric) => metric.date);
}

export function getMetricForDate(
  metrics: TeacherStudentReportMetric[],
  selectedDate: string | null,
) {
  if (!selectedDate) {
    return null;
  }

  return metrics.find((metric) => metric.date === selectedDate) ?? null;
}

export function getFiveDayWindow(
  metrics: TeacherStudentReportMetric[],
  startDate: string,
) {
  const start = new Date(`${startDate}T00:00:00Z`);
  const valuesByDate = new Map(metrics.map((metric) => [metric.date, metric]));
  const window: TeacherStudentDailySummary[] = [];

  for (let offset = 0; offset < 5; offset += 1) {
    const currentDate = new Date(start);
    currentDate.setUTCDate(start.getUTCDate() + offset);
    const dateKey = currentDate.toISOString().slice(0, 10);
    const metric = valuesByDate.get(dateKey);

    window.push({
      date: dateKey,
      totalDurationSeconds: metric?.totalDurationSeconds ?? 0,
    });
  }

  return window;
}
