import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { measurementCategories } from "../constants";
import { defaultRanges, getStatus } from "../ranges";
import { GlucoseMeasurement, MeasurementCategory, RangeConfiguration } from "../types";

const legacyCategoryMap: Record<string, MeasurementCategory> = {
  Fasting: "צום",
  "After Breakfast": "אחרי ארוחת בוקר",
  "After Lunch": "אחרי ארוחת צהריים",
  "After Dinner": "אחרי ארוחת ערב",
  "Before Sleep": "אחרי ארוחת ערב",
};

interface MeasurementContextValue {
  measurements: GlucoseMeasurement[];
  rangeConfig: RangeConfiguration;
  categories: MeasurementCategory[];
  addMeasurement: (value: number, category: MeasurementCategory, timestamp: string) => void;
  deleteMeasurement: (id: string) => void;
  setRangeConfig: (config: RangeConfiguration) => void;
}

const MeasurementContext = createContext<MeasurementContextValue | null>(null);

const MEASUREMENTS_KEY = "sugermama.measurements.v1";
const RANGES_KEY = "sugermama.ranges.v1";

export const MeasurementProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [rangeConfig, setRangeConfig] = useState<RangeConfiguration>(() => {
    const stored = localStorage.getItem(RANGES_KEY);
    if (!stored) return defaultRanges;
    try {
      const parsed = JSON.parse(stored) as RangeConfiguration;
      const migrated: RangeConfiguration = {};
      Object.entries(parsed).forEach(([key, value]) => {
        const newKey = legacyCategoryMap[key] ?? key;
        migrated[newKey] = value;
      });
      return normalizeRanges({ ...defaultRanges, ...migrated });
    } catch {
      return defaultRanges;
    }
  });

  const [measurements, setMeasurements] = useState<GlucoseMeasurement[]>(() => {
    const stored = localStorage.getItem(MEASUREMENTS_KEY);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored) as GlucoseMeasurement[];
      return parsed
        .map((m) => {
          const category = legacyCategoryMap[m.category] ?? (m.category as MeasurementCategory);
          return {
            ...m,
            category,
            status: getStatus(m.value, category, defaultRanges),
          };
        })
        .filter((m) => measurementCategories.includes(m.category));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(MEASUREMENTS_KEY, JSON.stringify(measurements));
  }, [measurements]);

  useEffect(() => {
    localStorage.setItem(RANGES_KEY, JSON.stringify(rangeConfig));
  }, [rangeConfig]);

  const categories: MeasurementCategory[] = useMemo(() => measurementCategories, []);

  const addMeasurement = (value: number, category: MeasurementCategory, timestamp: string) => {
    const status = getStatus(value, category, rangeConfig);
    const entry: GlucoseMeasurement = {
      id: crypto.randomUUID(),
      value,
      unit: "mg/dL",
      timestamp,
      category,
      status,
    };
    setMeasurements((prev) =>
      [entry, ...prev].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
  };

  const deleteMeasurement = (id: string) => {
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const value: MeasurementContextValue = {
    measurements,
    rangeConfig,
    categories,
    addMeasurement,
    deleteMeasurement,
    setRangeConfig,
  };

  return <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>;
};

export function useMeasurements() {
  const ctx = useContext(MeasurementContext);
  if (!ctx) throw new Error("useMeasurements must be used within MeasurementProvider");
  return ctx;
}

function normalizeRanges(ranges: RangeConfiguration): RangeConfiguration {
  const normalized: RangeConfiguration = {};
  measurementCategories.forEach((cat) => {
    const current = ranges[cat] ?? defaultRanges[cat];
    const def = defaultRanges[cat];
    normalized[cat] = {
      lower: Math.max(current.lower, def.lower),
      upper: Math.min(current.upper, def.upper),
    };
  });
  return normalized;
}
