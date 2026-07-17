import { useEffect, useState } from "react";
import { getAcademicYear } from "@/services/establishment.service";
import {
  DEFAULT_ACADEMIC_YEAR_START_MONTH,
  DEFAULT_ACADEMIC_YEAR_END_MONTH,
} from "@/config/Academicyear";

export interface AcademicYearConfig {
  startMonth: number;
  endMonth: number;
  loaded: boolean;
}

/**
 * Fetches the establishment's configured academic year window
 * (set in Settings -> Academic Year Period). Falls back to the
 * default Sept -> June cycle until the request resolves, or if it
 * fails.
 */
export const useAcademicYear = (): AcademicYearConfig => {
  const [startMonth, setStartMonth] = useState(
    DEFAULT_ACADEMIC_YEAR_START_MONTH,
  );
  const [endMonth, setEndMonth] = useState(DEFAULT_ACADEMIC_YEAR_END_MONTH);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAcademicYear()
      .then((data) => {
        if (!mounted) return;
        setStartMonth(data.startMonth);
        setEndMonth(data.endMonth);
      })
      .catch((err) => {
        console.error("FETCH ACADEMIC YEAR ERROR:", err);
      })
      .finally(() => {
        if (mounted) setLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { startMonth, endMonth, loaded };
};
