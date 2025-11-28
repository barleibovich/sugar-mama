export type MeasurementCategory =
  | "צום"
  | "אחרי ארוחת בוקר"
  | "אחרי ארוחת צהריים"
  | "אחרי ארוחת ערב";

export type MeasurementStatus = "inRange" | "aboveRange" | "belowRange";

export interface GlucoseRange {
  lower: number;
  upper: number;
}

export interface RangeConfiguration {
  [category: string]: GlucoseRange;
}

export interface GlucoseMeasurement {
  id: string;
  value: number;
  unit: "mg/dL";
  timestamp: string;
  category: MeasurementCategory;
  status: MeasurementStatus;
}
