import { useCallback, useEffect, useState } from "react";
import type { SelectOption } from "@/components/ui/Select";
import { academicYearService } from "../api/academic-year.service";
import type { AcademicYear } from "../api/types";

export interface UseAcademicYearsResult {
  years: AcademicYear[];
  yearOptions: SelectOption<string>[];
  activeYearId: number | null;
  isLoading: boolean;
  hasError: boolean;
  reload: () => void;
}

function resolveActiveYearId(years: AcademicYear[]): number | null {
  let min: number | null = null;
  for (const y of years) {
    if (y.is_active === true && (min === null || y.id < min)) {
      min = y.id;
    }
  }
  return min;
}

export function useAcademicYears(): UseAcademicYearsResult {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    academicYearService
      .list({ per_page: 100 })
      .then((res) => {
        if (active) {
          setYears(res.data);
          setHasError(false);
        }
      })
      .catch(() => {
        if (active) setHasError(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    setIsLoading(true);
    setHasError(false);
    setReloadKey((k) => k + 1);
  }, []);

  const activeYearId = resolveActiveYearId(years);
  const yearOptions = years.map((y) => ({ value: String(y.id), label: y.name }));

  return { years, yearOptions, activeYearId, isLoading, hasError, reload };
}