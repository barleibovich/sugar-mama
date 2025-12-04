import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { measurementCategories } from "../constants";
import { defaultRanges, getStatus } from "../ranges";
import { supabase, supabaseAvailable } from "../supabaseClient";
import { GlucoseMeasurement, MeasurementCategory, MeasurementStatus, RangeConfiguration } from "../types";
import { useAuth } from "./AuthProvider";

interface MeasurementContextValue {
  measurements: GlucoseMeasurement[];
  rangeConfig: RangeConfiguration;
  categories: MeasurementCategory[];
  addMeasurement: (value: number, category: MeasurementCategory, timestamp: string) => Promise<void>;
  updateMeasurement: (
    id: string,
    payload: Partial<Pick<GlucoseMeasurement, "value" | "timestamp" | "category">>
  ) => Promise<void>;
  deleteMeasurement: (id: string) => Promise<void>;
  setRangeConfig: (config: RangeConfiguration) => void;
  loading: boolean;
}

type MeasurementRow = {
  id: string;
  user_id: string;
  date: string;
  type: MeasurementCategory;
  value: number;
  status: MeasurementStatus;
  created_at?: string;
};

const MeasurementContext = createContext<MeasurementContextValue | null>(null);

export const MeasurementProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user } = useAuth();
  const [rangeConfig, setRangeConfig] = useState<RangeConfiguration>(defaultRanges);
  const [measurements, setMeasurements] = useState<GlucoseMeasurement[]>([]);
  const [loading, setLoading] = useState(false);

  const categories: MeasurementCategory[] = useMemo(() => measurementCategories, []);

  useEffect(() => {
    if (!user || !supabaseAvailable || !supabase) {
      setMeasurements([]);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("measurements")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        console.error("Failed to load measurements:", error.message);
      } else if (isMounted) {
        const mapped = (data ?? []).map(mapRowToMeasurement);
        setMeasurements(mapped);
      }
      if (isMounted) setLoading(false);
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const addMeasurement = async (value: number, category: MeasurementCategory, timestamp: string) => {
    if (!user) throw new Error("Not authenticated");
    if (!supabaseAvailable || !supabase) throw new Error("Supabase is not configured.");
    const status = getStatus(value, category, rangeConfig);
    const { data, error } = await supabase
      .from("measurements")
      .insert({
        user_id: user.id,
        date: timestamp,
        type: category,
        value,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to add measurement:", error.message);
      throw error;
    }

    const mapped = mapRowToMeasurement(data as MeasurementRow);
    setMeasurements((prev) => [mapped, ...prev].sort(sortByTimestampDesc));
  };

  const updateMeasurement = async (
    id: string,
    payload: Partial<Pick<GlucoseMeasurement, "value" | "timestamp" | "category">>
  ) => {
    if (!user) throw new Error("Not authenticated");
    if (!supabaseAvailable || !supabase) throw new Error("Supabase is not configured.");
    const current = measurements.find((m) => m.id === id);
    if (!current) return;

    const nextCategory = payload.category ?? current.category;
    const nextTimestamp = payload.timestamp ?? current.timestamp;
    const nextValue = payload.value ?? current.value;
    const status = getStatus(nextValue, nextCategory, rangeConfig);

    const { data, error } = await supabase
      .from("measurements")
      .update({
        value: nextValue,
        date: nextTimestamp,
        type: nextCategory,
        status,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update measurement:", error.message);
      throw error;
    }

    const mapped = mapRowToMeasurement(data as MeasurementRow);
    setMeasurements((prev) => prev.map((m) => (m.id === id ? mapped : m)).sort(sortByTimestampDesc));
  };

  const deleteMeasurement = async (id: string) => {
    if (!user) throw new Error("Not authenticated");
    if (!supabaseAvailable || !supabase) throw new Error("Supabase is not configured.");
    const { error } = await supabase.from("measurements").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      console.error("Failed to delete measurement:", error.message);
      throw error;
    }
    setMeasurements((prev) => prev.filter((m) => m.id !== id));
  };

  const value: MeasurementContextValue = {
    measurements,
    rangeConfig,
    categories,
    addMeasurement,
    updateMeasurement,
    deleteMeasurement,
    setRangeConfig,
    loading,
  };

  return <MeasurementContext.Provider value={value}>{children}</MeasurementContext.Provider>;
};

export function useMeasurements() {
  const ctx = useContext(MeasurementContext);
  if (!ctx) throw new Error("useMeasurements must be used within MeasurementProvider");
  return ctx;
}

function mapRowToMeasurement(row: MeasurementRow): GlucoseMeasurement {
  return {
    id: row.id,
    value: row.value,
    unit: "mg/dL",
    timestamp: row.date,
    category: row.type,
    status: row.status,
  };
}

function sortByTimestampDesc(a: GlucoseMeasurement, b: GlucoseMeasurement) {
  return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
}
