import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/services/api.service";
import {
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Autocomplete,
  Paper,
  useTheme,
  Typography,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Alert,
  Skeleton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";
import { useState, useMemo, useEffect, useCallback } from "react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
type Day = (typeof days)[number];

const DAY_START_MIN = 6 * 60 + 30;
const DAY_END_MIN = 18 * 60 + 30;
const TOTAL_MIN = DAY_END_MIN - DAY_START_MIN;
const PX_PER_MIN = 1.9;
const TOTAL_HEIGHT = TOTAL_MIN * PX_PER_MIN;
const HOUR_STEP = 60;
const HALF_STEP = 30;
const SNAP_MIN = 15;
const DEFAULT_DURATION_MIN = 60;

const generateGridLines = () => {
  const lines: { label: string; top: number; isHalf: boolean }[] = [];
  for (let m = DAY_START_MIN; m <= DAY_END_MIN; m += HALF_STEP) {
    const h = Math.floor(m / 60)
      .toString()
      .padStart(2, "0");
    const mm = (m % 60).toString().padStart(2, "0");
    lines.push({
      label: `${h}:${mm}`,
      top: (m - DAY_START_MIN) * PX_PER_MIN,
      isHalf: m % HOUR_STEP !== 0,
    });
  }
  return lines;
};
const gridLines = generateGridLines();

interface ClassOption {
  id: string;
  name: string;
  room_id: string;
  classroom_name?: string;
}

interface SubjectClassDetails {
  id: string;
  class_id: string;
  class_name: string;
  code: string;
  coefficient: number;
  hours: number;
  teacher_id: string | null;
}

interface GroupedSubject {
  id: string;
  name: string;
  classes: SubjectClassDetails[];
}

interface Slot {
  id: string;
  subject_id: string;
  day: Day;
  start_time: string;
  end_time: string;
  subject?: string;
  teacher?: string;
  room?: string;
}

interface Option {
  id: string;
  label: string;
}

const getDynamicSubjectStyle = (subjectName: string, isDarkMode: boolean) => {
  let hash = 0;
  const saltedName = subjectName + "timetable-salt-xyz-123";
  for (let i = 0; i < saltedName.length; i++) {
    hash = saltedName.charCodeAt(i) + ((hash << 7) - hash);
  }
  const hue = Math.abs(hash * 13) % 360;

  if (isDarkMode) {
    return {
      bg: `hsl(${hue}, 65%, 22%)`,
      text: "#ffffff",
      border: `hsl(${hue}, 70%, 38%)`,
    };
  } else {
    return {
      bg: `hsl(${hue}, 80%, 93%)`,
      text: `hsl(${hue}, 85%, 16%)`,
      border: `hsl(${hue}, 55%, 78%)`,
    };
  }
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
const minutesToTime = (m: number) => {
  const clamped = Math.max(DAY_START_MIN, Math.min(m, DAY_END_MIN - 15));
  const snapped = Math.round(clamped / SNAP_MIN) * SNAP_MIN;
  const h = Math.floor(snapped / 60)
    .toString()
    .padStart(2, "0");
  const mm = (snapped % 60).toString().padStart(2, "0");
  return `${h}:${mm}`;
};

interface LayoutSlot extends Slot {
  startMin: number;
  endMin: number;
  col: number;
  totalCols: number;
}

const layoutDay = (slots: Slot[]): LayoutSlot[] => {
  const items = slots
    .map((s) => ({
      ...s,
      startMin: timeToMinutes(s.start_time),
      endMin: timeToMinutes(s.end_time),
    }))
    .sort((a, b) => a.startMin - b.startMin);

  const clusters: (typeof items)[] = [];
  let current: typeof items = [];
  let currentEnd = -Infinity;
  items.forEach((item) => {
    if (current.length === 0 || item.startMin < currentEnd) {
      current.push(item);
      currentEnd = Math.max(currentEnd, item.endMin);
    } else {
      clusters.push(current);
      current = [item];
      currentEnd = item.endMin;
    }
  });
  if (current.length) clusters.push(current);

  const result: LayoutSlot[] = [];
  clusters.forEach((cluster) => {
    const columnEnds: number[] = [];
    const assigned: { item: (typeof items)[0]; col: number }[] = [];
    cluster.forEach((item) => {
      let colIndex = columnEnds.findIndex((end) => end <= item.startMin);
      if (colIndex === -1) {
        colIndex = columnEnds.length;
        columnEnds.push(item.endMin);
      } else {
        columnEnds[colIndex] = item.endMin;
      }
      assigned.push({ item, col: colIndex });
    });
    const totalCols = columnEnds.length;
    assigned.forEach(({ item, col }) =>
      result.push({ ...item, col, totalCols }),
    );
  });
  return result;
};

interface SlotForm {
  id: string | null;
  subject_id: string;
  day: Day;
  startTime: string;
  endTime: string;
}

const emptyForm = (day: Day, startTime = "08:00"): SlotForm => ({
  id: null,
  subject_id: "",
  day,
  startTime,
  endTime: minutesToTime(timeToMinutes(startTime) + DEFAULT_DURATION_MIN),
});

const DayColumn = ({
  day,
  slots,
  onBackgroundClick,
  onSlotClick,
}: {
  day: Day;
  slots: LayoutSlot[];
  onBackgroundClick: (day: Day, minutes: number) => void;
  onSlotClick: (slot: LayoutSlot) => void;
}) => {
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const minutes = DAY_START_MIN + offsetY / PX_PER_MIN;
    onBackgroundClick(day, minutes);
  };

  return (
    <Box
      onClick={handleBackgroundClick}
      sx={{
        flex: 1,
        position: "relative",
        height: TOTAL_HEIGHT,
        borderLeft: "0.5px solid",
        borderColor: "divider",
        cursor: "copy",
      }}
    >
      {gridLines.map((line) => (
        <Box
          key={line.label}
          sx={{
            position: "absolute",
            top: line.top,
            left: 0,
            right: 0,
            borderTop: "0.5px solid",
            borderColor: line.isHalf ? "rgba(0,0,0,0.06)" : "rgba(0,0,0,0.12)",
            borderStyle: line.isHalf ? "dashed" : "solid",
            pointerEvents: "none",
          }}
        />
      ))}

      {slots.map((slot) => {
        const st = getDynamicSubjectStyle(
          slot.subject || "",
          useTheme().palette.mode === "dark",
        );
        const top = (slot.startMin - DAY_START_MIN) * PX_PER_MIN;
        const height = Math.max((slot.endMin - slot.startMin) * PX_PER_MIN, 20);
        const wPct = 100 / slot.totalCols;
        const lPct = slot.col * wPct;

        return (
          <Box
            key={slot.id}
            onClick={(e) => {
              e.stopPropagation();
              onSlotClick(slot);
            }}
            sx={{
              position: "absolute",
              top,
              height,
              left: `calc(${lPct}% + 2px)`,
              width: `calc(${wPct}% - 4px)`,
              bgcolor: st.bg,
              color: st.text,
              border: `1px solid ${st.border}`,
              borderRadius: "5px",
              px: 0.75,
              py: 0.5,
              overflow: "hidden",
              cursor: "pointer",
              "&:hover": { opacity: 0.88 },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                fontWeight: 600,
                color: st.text,
                lineHeight: 1.3,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {slot.subject}
            </Typography>
            {height > 32 && (
              <Typography
                sx={{
                  fontSize: "0.62rem",
                  color: st.text,
                  opacity: 0.85,
                  lineHeight: 1.3,
                  mt: "2px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {slot.teacher || "Unassigned"}
              </Typography>
            )}
            {height > 54 && slot.room && (
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  mt: "3px",
                  fontSize: "0.58rem",
                  color: st.text,
                  opacity: 0.8,
                  border: `1px solid ${st.text}`,
                  borderRadius: "3px",
                  px: "4px",
                  lineHeight: 1.6,
                }}
              >
                {slot.room}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const TimeGutter = () => (
  <Box
    sx={{
      width: 64,
      flexShrink: 0,
      position: "relative",
      height: TOTAL_HEIGHT,
    }}
  >
    {gridLines
      .filter((l) => !l.isHalf)
      .map((line) => (
        <Typography
          key={line.label}
          variant="caption"
          sx={{
            position: "absolute",
            top: line.top,
            right: 8,
            transform: "translateY(-50%)",
            color: "text.disabled",
            fontFamily: "monospace",
            fontSize: "0.68rem",
            lineHeight: 1,
          }}
        >
          {line.label}
        </Typography>
      ))}
  </Box>
);

const DesktopGrid = ({
  byDay,
  onBackgroundClick,
  onSlotClick,
}: {
  byDay: Record<Day, LayoutSlot[]>;
  onBackgroundClick: (day: Day, minutes: number) => void;
  onSlotClick: (slot: LayoutSlot) => void;
}) => (
  <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
    <Box
      sx={{
        display: "flex",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      <Box sx={{ width: 64, flexShrink: 0 }} />
      {days.map((d) => (
        <Box
          key={d}
          sx={{
            flex: 1,
            textAlign: "center",
            py: 1,
            borderLeft: "0.5px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{ fontSize: "0.75rem" }}
          >
            {d}
          </Typography>
        </Box>
      ))}
    </Box>
    <Box sx={{ display: "flex" }}>
      <TimeGutter />
      {days.map((day) => (
        <DayColumn
          key={day}
          day={day}
          slots={byDay[day]}
          onBackgroundClick={onBackgroundClick}
          onSlotClick={onSlotClick}
        />
      ))}
    </Box>
  </Paper>
);

const MobileGrid = ({
  byDay,
  onBackgroundClick,
  onSlotClick,
}: {
  byDay: Record<Day, LayoutSlot[]>;
  onBackgroundClick: (day: Day, minutes: number) => void;
  onSlotClick: (slot: LayoutSlot) => void;
}) => {
  const [dayIndex, setDayIndex] = useState(0);
  const currentDay = days[dayIndex];

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "action.hover",
          px: 1,
          py: 0.5,
        }}
      >
        <IconButton
          size="small"
          onClick={() => setDayIndex((i) => Math.max(0, i - 1))}
          disabled={dayIndex === 0}
        >
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
        <Typography
          variant="subtitle2"
          fontWeight={600}
          sx={{ fontSize: "0.85rem" }}
        >
          {currentDay}
        </Typography>
        <IconButton
          size="small"
          onClick={() => setDayIndex((i) => Math.min(days.length - 1, i + 1))}
          disabled={dayIndex === days.length - 1}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{ display: "flex", justifyContent: "center", gap: 0.5, py: 0.75 }}
      >
        {days.map((_, i) => (
          <Box
            key={i}
            onClick={() => setDayIndex(i)}
            sx={{
              width: i === dayIndex ? 16 : 6,
              height: 6,
              borderRadius: 3,
              bgcolor: i === dayIndex ? "primary.main" : "action.disabled",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex" }}>
        <TimeGutter />
        <DayColumn
          key={currentDay}
          day={currentDay}
          slots={byDay[currentDay]}
          onBackgroundClick={onBackgroundClick}
          onSlotClick={onSlotClick}
        />
      </Box>
    </Paper>
  );
};

const TimetableSkeleton = () => (
  <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
    <Box
      sx={{
        display: "flex",
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "action.hover",
        py: 1,
      }}
    >
      <Box sx={{ width: 64 }} />
      {days.map((d) => (
        <Box
          key={d}
          sx={{ flex: 1, display: "flex", justifyContent: "center" }}
        >
          <Skeleton width="50%" height={20} />
        </Box>
      ))}
    </Box>
    <Box sx={{ display: "flex", height: TOTAL_HEIGHT, position: "relative" }}>
      <Box
        sx={{
          width: 64,
          p: 1,
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} width="80%" height={15} />
        ))}
      </Box>
      {days.map((d) => (
        <Box
          key={d}
          sx={{
            flex: 1,
            borderLeft: "0.5px solid",
            borderColor: "divider",
            p: 1,
            position: "relative",
          }}
        >
          <Skeleton
            variant="rounded"
            sx={{
              position: "absolute",
              top: 60,
              left: 4,
              right: 4,
              height: 100,
              borderRadius: "5px",
            }}
          />
          <Skeleton
            variant="rounded"
            sx={{
              position: "absolute",
              top: 220,
              left: 4,
              right: 4,
              height: 70,
              borderRadius: "5px",
            }}
          />
        </Box>
      ))}
    </Box>
  </Paper>
);

const CreateTimetable = () => {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [groupedSubjects, setGroupedSubjects] = useState<GroupedSubject[]>([]);
  const [classID, setClassID] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [subjectInputValue, setSubjectInputValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<SlotForm>(emptyForm("Monday"));
  const [saving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  useEffect(() => {
    (async () => {
      try {
        const [classesRes, teachersRes, subjectsRes] = await Promise.all([
          apiRequest("/api/establishment/classes-list", {
            credentials: "include",
          }),
          apiRequest("/api/teachers/get-list", { credentials: "include" }),
          apiRequest("/api/subject/list", {
            method: "GET",
            credentials: "include",
          }),
        ]);

        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(
            data.map((c: any) => ({
              id: c.id,
              name: c.name,
              room_id: c.room_id,
              classroom_name: c.classroom_name,
            })),
          );
          if (data.length > 0) setClassID(data[0].id);
        } else {
          enqueueSnackbar("Failed to load classes", { variant: "error" });
        }

        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setTeachers(
            data.map((t: any) => ({
              id: t.id,
              label: `${t.first_name} ${t.last_name}`,
            })),
          );
        } else {
          enqueueSnackbar("Failed to load teachers", { variant: "error" });
        }

        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          setGroupedSubjects(data as GroupedSubject[]);
        } else {
          enqueueSnackbar("Failed to load subjects list", { variant: "error" });
        }
      } catch {
        enqueueSnackbar("Error loading initial configuration", {
          variant: "error",
        });
      } finally {
        setLoadingInitial(false);
      }
    })();
  }, [enqueueSnackbar]);

  const loadSchedule = useCallback(
    async (id: string) => {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const response = await apiRequest(`/api/timetable/class/${id}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setSlots(data as Slot[]);
        } else {
          enqueueSnackbar("Failed to load the timetable", { variant: "error" });
        }
      } catch {
        enqueueSnackbar("Error loading the timetable", { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar],
  );

  useEffect(() => {
    if (classID) loadSchedule(classID);
  }, [classID, loadSchedule]);

  const selectedClassDetails = useMemo(() => {
    return classes.find((c) => c.id === classID) || null;
  }, [classes, classID]);

  const byDay = useMemo(() => {
    const map = {} as Record<Day, LayoutSlot[]>;

    const enrichedSlots = slots.map((slot) => {
      const foundSubject = groupedSubjects.find(
        (s) => s.id === slot.subject_id,
      );
      const classDetails = foundSubject?.classes.find(
        (cls) => cls.class_id === classID,
      );
      const foundTeacher = teachers.find(
        (t) => t.id === classDetails?.teacher_id,
      );

      return {
        ...slot,
        subject: foundSubject ? foundSubject.name : "Unknown",
        teacher: foundTeacher ? foundTeacher.label : "Unassigned",
        room: selectedClassDetails?.classroom_name,
      };
    });

    days.forEach((d) => {
      map[d] = layoutDay(enrichedSlots.filter((s) => s.day === d));
    });
    return map;
  }, [slots, groupedSubjects, classID, teachers, selectedClassDetails]);

  const availableSubjects = useMemo(() => {
    if (!classID) return [];
    return groupedSubjects.filter((subject) =>
      subject.classes.some((cls) => cls.class_id === classID),
    );
  }, [groupedSubjects, classID]);

  const selectedSubjectDetails = useMemo(() => {
    if (!form.subject_id || !classID) return null;
    const foundGroup = groupedSubjects.find((s) => s.id === form.subject_id);
    return foundGroup?.classes.find((cls) => cls.class_id === classID) || null;
  }, [form.subject_id, groupedSubjects, classID]);

  const currentTeacherName = useMemo(() => {
    if (!selectedSubjectDetails?.teacher_id) return "Unassigned";
    const foundTeacher = teachers.find(
      (t) => t.id === selectedSubjectDetails.teacher_id,
    );
    return foundTeacher ? foundTeacher.label : "Unknown Teacher";
  }, [selectedSubjectDetails, teachers]);

  const openCreateDialog = (day: Day, minutes?: number) => {
    setFormError("");
    setForm(
      emptyForm(day, minutes !== undefined ? minutesToTime(minutes) : "08:00"),
    );
    setDialogOpen(true);
  };

  const openEditDialog = (slot: Slot) => {
    setFormError("");
    setForm({
      id: slot.id,
      subject_id: slot.subject_id,
      day: slot.day,
      startTime: slot.start_time,
      endTime: slot.end_time,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => setDialogOpen(false);

  const handleSave = async () => {
    setFormError("");
    if (!form.subject_id) return setFormError("Subject is required");
    if (!selectedClassDetails?.room_id)
      return setFormError("This class has no assigned classroom");
    if (form.startTime >= form.endTime)
      return setFormError("End time must be after start time");

    const matchedSubject = availableSubjects.find(
      (sub) => sub.id === form.subject_id,
    );
    if (
      subjectInputValue &&
      (!matchedSubject || subjectInputValue !== matchedSubject.name)
    ) {
      enqueueSnackbar("Please select a valid subject from the list", {
        variant: "error",
      });
      return;
    }

    const newStart = timeToMinutes(form.startTime);
    const newEnd = timeToMinutes(form.endTime);

    const hasOverlap = slots.some((slot) => {
      if (form.id && slot.id === form.id) return false;
      if (slot.day !== form.day) return false;

      const existingStart = timeToMinutes(slot.start_time);
      const existingEnd = timeToMinutes(slot.end_time);

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (hasOverlap) {
      return setFormError(
        "This timeslot overlaps with an existing course on this day.",
      );
    }

    setSaving(true);
    const payload = {
      classID,
      subjectID: form.subject_id,
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
    };

    try {
      const url = form.id
        ? `/api/timetable/update/${form.id}`
        : "/api/timetable/create";
      const method = form.id ? "PUT" : "POST";

      const response = await apiRequest(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to save course");
      }

      setDialogOpen(false);
      await loadSchedule(classID);
      enqueueSnackbar("Course saved successfully", { variant: "success" });
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!form.id) return;
    setSaving(true);
    try {
      const response = await apiRequest(`/api/timetable/delete/${form.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete course");
      }

      setDialogOpen(false);
      await loadSchedule(classID);
      enqueueSnackbar("Course deleted successfully", { variant: "success" });
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const usedSubjects = useMemo(() => {
    const uniqueIds = [...new Set(slots.map((s) => s.subject_id))];
    return uniqueIds
      .map((id) => groupedSubjects.find((gs) => gs.id === id)?.name)
      .filter((name): name is string => !!name)
      .sort();
  }, [slots, groupedSubjects]);

  return (
    <>
      <PageHeader
        title="Build Timetable"
        subtitle="Pick a class, then click anywhere on its grid to add a course"
      />

      <Card sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Class</InputLabel>
            {loadingInitial ? (
              <Skeleton variant="rounded" height={40} />
            ) : (
              <Select
                value={classID}
                label="Class"
                onChange={(e) => setClassID(e.target.value)}
              >
                {classes.map((c) => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name} {c.classroom_name ? `(${c.classroom_name})` : ""}
                  </MenuItem>
                ))}
              </Select>
            )}
          </FormControl>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            disabled={!classID || loadingInitial}
            onClick={() => openCreateDialog("Monday")}
          >
            Add course
          </Button>
        </Stack>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loadingInitial || loading ? (
        <TimetableSkeleton />
      ) : (
        classID && (
          <>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <DesktopGrid
                byDay={byDay}
                onBackgroundClick={openCreateDialog}
                onSlotClick={openEditDialog}
              />
            </Box>
            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <MobileGrid
                byDay={byDay}
                onBackgroundClick={openCreateDialog}
                onSlotClick={openEditDialog}
              />
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
              {usedSubjects.map((s) => {
                const st = getDynamicSubjectStyle(s, isDarkMode);
                return (
                  <Box
                    key={s}
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "3px",
                        bgcolor: st.bg,
                        border: `1px solid ${st.border}`,
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontSize: "0.72rem" }}
                    >
                      {s}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </>
        )
      )}

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="xs">
        <DialogTitle>{form.id ? "Edit course" : "Add course"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}

            {selectedClassDetails?.classroom_name && (
              <Alert severity="info" icon={false}>
                Located on room:{" "}
                <strong>{selectedClassDetails.classroom_name}</strong>
              </Alert>
            )}

            <FormControl size="small" fullWidth>
              <Autocomplete
                freeSolo
                options={availableSubjects}
                value={
                  availableSubjects.find((sub) => sub.id === form.subject_id) ||
                  null
                }
                inputValue={subjectInputValue}
                onInputChange={(_, newInputValue) => {
                  setSubjectInputValue(newInputValue);
                  const matched = availableSubjects.find(
                    (sub) => sub.name === newInputValue,
                  );
                  if (!matched) {
                    setForm((prev) => ({ ...prev, subject_id: "" }));
                  }
                }}
                getOptionLabel={(option) =>
                  typeof option === "string" ? option : option.name
                }
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={loading}
                onChange={(_, newValue) => {
                  if (typeof newValue === "string" || !newValue) {
                    setForm((prev) => ({ ...prev, subject_id: "" }));
                  } else {
                    setForm((prev) => ({ ...prev, subject_id: newValue.id }));
                  }
                }}
                noOptionsText="No subjects available"
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <Box component="li" key={option.id} {...optionProps}>
                      <Typography variant="body2">{option.name}</Typography>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Subject"
                    placeholder={
                      availableSubjects.length === 0
                        ? "No subjects available for this class"
                        : "Select subject..."
                    }
                    fullWidth
                  />
                )}
              />
            </FormControl>

            {form.subject_id && (
              <Alert severity="info" icon={false}>
                Taught by: <strong>{currentTeacherName}</strong>
              </Alert>
            )}

            <FormControl size="small">
              <InputLabel>Day</InputLabel>
              <Select
                value={form.day}
                label="Day"
                onChange={(e) =>
                  setForm({ ...form, day: e.target.value as Day })
                }
              >
                {days.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={2}>
              <TextField
                label="Start"
                type="time"
                value={form.startTime}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="End"
                type="time"
                value={form.endTime}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                fullWidth
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", px: 3, pb: 2 }}>
          {form.id ? (
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              disabled={saving}
            >
              Delete
            </Button>
          ) : (
            <span />
          )}
          <Stack direction="row" spacing={1}>
            <Button onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              Save
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateTimetable;
