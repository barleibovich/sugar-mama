import { GlucoseMeasurement, MeasurementCategory, MeasurementStatus, RangeConfiguration } from "./types";

export const defaultRanges: RangeConfiguration = {
  צום: { lower: 70, upper: 95 },
  "אחרי ארוחת בוקר": { lower: 70, upper: 120 },
  "אחרי ארוחת צהריים": { lower: 70, upper: 120 },
  "אחרי ארוחת ערב": { lower: 70, upper: 120 },
};

export function getStatus(
  value: number,
  category: MeasurementCategory,
  config: RangeConfiguration = defaultRanges
): MeasurementStatus {
  const range = config[category] ?? defaultRanges[category];
  if (value < range.lower) return "belowRange";
  if (value > range.upper) return "aboveRange";
  return "inRange";
}

export function formatMeasurement(measurement: GlucoseMeasurement): string {
  const date = new Date(measurement.timestamp);
  const time = date.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  return `${measurement.value} ${measurement.unit} · ${time}`;
}
