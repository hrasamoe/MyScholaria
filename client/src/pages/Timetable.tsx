import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/services/api.service";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  Button,
  Card,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  useTheme,
  Skeleton,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useMemo, useState, useEffect, useCallback } from "react";

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
const HALF_STEP = 30;
const HOUR_STEP = 60;

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

const DayColumn = ({
  slots,
  onSlotClick,
}: {
  slots: LayoutSlot[];
  onSlotClick: (slot: LayoutSlot) => void;
}) => {
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        flex: 1,
        position: "relative",
        height: TOTAL_HEIGHT,
        borderLeft: "0.5px solid",
        borderColor: "divider",
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
        const st = getDynamicSubjectStyle(slot.subject || "", isDarkMode);
        const top = (slot.startMin - DAY_START_MIN) * PX_PER_MIN;
        const height = Math.max((slot.endMin - slot.startMin) * PX_PER_MIN, 20);
        const wPct = 100 / slot.totalCols;
        const lPct = slot.col * wPct;

        return (
          <Box
            key={slot.id}
            onClick={() => onSlotClick(slot)}
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
              boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
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

const DesktopView = ({
  byDay,
  onSlotClick,
}: {
  byDay: Record<Day, LayoutSlot[]>;
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
        <DayColumn key={day} slots={byDay[day]} onSlotClick={onSlotClick} />
      ))}
    </Box>
  </Paper>
);

const MobileView = ({
  byDay,
  onSlotClick,
}: {
  byDay: Record<Day, LayoutSlot[]>;
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
          slots={byDay[currentDay]}
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
              top: 40,
              left: 4,
              right: 4,
              height: 80,
              borderRadius: "5px",
            }}
          />
          <Skeleton
            variant="rounded"
            sx={{
              position: "absolute",
              top: 160,
              left: 4,
              right: 4,
              height: 120,
              borderRadius: "5px",
            }}
          />
          <Skeleton
            variant="rounded"
            sx={{
              position: "absolute",
              top: 320,
              left: 4,
              right: 4,
              height: 60,
              borderRadius: "5px",
            }}
          />
        </Box>
      ))}
    </Box>
  </Paper>
);

const Timetable = () => {
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [groupedSubjects, setGroupedSubjects] = useState<GroupedSubject[]>([]);
  const [classID, setClassID] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<LayoutSlot | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const navigate = useNavigate();
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
        }
        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setTeachers(
            data.map((t: any) => ({
              id: t.id,
              label: `${t.first_name} ${t.last_name}`,
            })),
          );
        }
        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          setGroupedSubjects(data as GroupedSubject[]);
        }
      } catch {
        enqueueSnackbar("Error loading initial data", { variant: "error" });
      } finally {
        setLoadingInitial(false);
      }
    })();
  }, [enqueueSnackbar]);

  const loadSchedule = useCallback(
    async (id: string) => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await apiRequest(`/api/timetable/class/${id}`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setSlots(data as Slot[]);
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

  const usedSubjects = useMemo(() => {
    const uniqueIds = [...new Set(slots.map((s) => s.subject_id))];
    return uniqueIds
      .map((id) => groupedSubjects.find((gs) => gs.id === id)?.name)
      .filter((name): name is string => !!name)
      .sort();
  }, [slots, groupedSubjects]);

  const handleOpenInfo = (slot: LayoutSlot) => {
    setSelectedSlot(slot);
    setInfoOpen(true);
  };

  const handleCloseInfo = () => {
    setInfoOpen(false);
    setSelectedSlot(null);
  };

  return (
    <>
      <PageHeader title="Timetable" subtitle="Weekly schedule per class" />

      <Card
        sx={{
          p: 2,
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <FormControl size="small" sx={{ minWidth: 200 }}>
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
          onClick={() => {
            navigate("/timetable/create");
          }}
          color="success"
          startIcon={<AddIcon />}
        >
          Create schedule
        </Button>
      </Card>

      {loadingInitial || loading ? (
        <TimetableSkeleton />
      ) : (
        classID && (
          <>
            <Box sx={{ display: { xs: "none", md: "block" } }}>
              <DesktopView byDay={byDay} onSlotClick={handleOpenInfo} />
            </Box>

            <Box sx={{ display: { xs: "block", md: "none" } }}>
              <MobileView byDay={byDay} onSlotClick={handleOpenInfo} />
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

      <Dialog open={infoOpen} onClose={handleCloseInfo} fullWidth maxWidth="xs">
        <DialogTitle>Course Details</DialogTitle>
        <DialogContent dividers>
          {selectedSlot && (
            <Stack spacing={2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Subject
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedSlot.subject}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Teacher
                </Typography>
                <Typography variant="body1">{selectedSlot.teacher}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Classroom / Room
                </Typography>
                <Typography variant="body1">
                  {selectedSlot.room || "No room assigned"}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Schedule
                </Typography>
                <Typography variant="body1">
                  {selectedSlot.day}, {selectedSlot.start_time} -{" "}
                  {selectedSlot.end_time}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseInfo} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Timetable;
