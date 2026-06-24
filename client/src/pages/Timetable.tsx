import PageHeader from "@/components/PageHeader";
import {
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Paper,
  Typography,
  IconButton,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useState, useMemo } from "react";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

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

interface Course {
  subject: string;
  teacher: string;
  room: string;
  day: string;
  startTime: string;
  endTime: string;
}

const sampleData: Record<string, Course[]> = {
  "Class 6A": [
    {
      subject: "Math",
      teacher: "Mr. Dupont",
      room: "A101",
      day: "Monday",
      startTime: "07:30",
      endTime: "09:30",
    },
    {
      subject: "French",
      teacher: "Ms. Martin",
      room: "A102",
      day: "Monday",
      startTime: "10:00",
      endTime: "11:30",
    },
    {
      subject: "Physics",
      teacher: "Mrs. Bernard",
      room: "B203",
      day: "Monday",
      startTime: "13:30",
      endTime: "14:00",
    },
    {
      subject: "English",
      teacher: "Ms. Martin",
      room: "A105",
      day: "Tuesday",
      startTime: "06:30",
      endTime: "08:30",
    },
    {
      subject: "Biology",
      teacher: "Mrs. Moreau",
      room: "B102",
      day: "Tuesday",
      startTime: "09:00",
      endTime: "12:00",
    },
    {
      subject: "History",
      teacher: "Mr. Leclerc",
      room: "C301",
      day: "Tuesday",
      startTime: "14:00",
      endTime: "15:30",
    },
    {
      subject: "Sport",
      teacher: "Mr. Said",
      room: "Gym",
      day: "Wednesday",
      startTime: "08:00",
      endTime: "09:14",
    },
    {
      subject: "Art",
      teacher: "Mrs. Karim",
      room: "D101",
      day: "Wednesday",
      startTime: "09:25",
      endTime: "12:00",
    },
    {
      subject: "Music",
      teacher: "Mr. Ali",
      room: "D202",
      day: "Thursday",
      startTime: "10:30",
      endTime: "12:00",
    },
    {
      subject: "Math",
      teacher: "Mr. Dupont",
      room: "A101",
      day: "Thursday",
      startTime: "13:00",
      endTime: "14:30",
    },
    {
      subject: "French",
      teacher: "Ms. Martin",
      room: "A102",
      day: "Friday",
      startTime: "08:30",
      endTime: "10:00",
    },
    {
      subject: "Physics",
      teacher: "Mrs. Bernard",
      room: "B203",
      day: "Friday",
      startTime: "14:30",
      endTime: "17:30",
    },
    {
      subject: "History",
      teacher: "Mr. Leclerc",
      room: "C301",
      day: "Saturday",
      startTime: "07:30",
      endTime: "09:30",
    },
    {
      subject: "English",
      teacher: "Ms. Martin",
      room: "A105",
      day: "Saturday",
      startTime: "10:00",
      endTime: "12:00",
    },
  ],
  "Class 7B": [
    {
      subject: "French",
      teacher: "Ms. Martin",
      room: "A102",
      day: "Monday",
      startTime: "08:00",
      endTime: "10:00",
    },
    {
      subject: "Math",
      teacher: "Mr. Dupont",
      room: "A101",
      day: "Monday",
      startTime: "11:00",
      endTime: "12:30",
    },
    {
      subject: "Physics",
      teacher: "Mrs. Bernard",
      room: "B203",
      day: "Tuesday",
      startTime: "07:00",
      endTime: "09:00",
    },
    {
      subject: "History",
      teacher: "Mr. Leclerc",
      room: "C301",
      day: "Wednesday",
      startTime: "09:30",
      endTime: "11:00",
    },
    {
      subject: "SES",
      teacher: "Ms. Martin",
      room: "A102",
      day: "Wednesday",
      startTime: "11:20",
      endTime: "16:00",
    },
    {
      subject: "Sport",
      teacher: "Mr. Said",
      room: "Gym",
      day: "Thursday",
      startTime: "14:00",
      endTime: "16:00",
    },
    {
      subject: "Biology",
      teacher: "Mrs. Moreau",
      room: "B102",
      day: "Friday",
      startTime: "10:00",
      endTime: "13:00",
    },
    {
      subject: "English",
      teacher: "Ms. Martin",
      room: "A105",
      day: "Saturday",
      startTime: "08:30",
      endTime: "10:30",
    },
  ],
};

const SUBJECT_STYLES: Record<string, { bg: string; text: string }> = {
  Math: { bg: "#1565c0", text: "#ffffff" },
  French: { bg: "#c2185b", text: "#ffffff" },
  Physics: { bg: "#00838f", text: "#ffffff" },
  English: { bg: "#ef6c00", text: "#ffffff" },
  Biology: { bg: "#2e7d32", text: "#ffffff" },
  History: { bg: "#c62828", text: "#ffffff" },
  Sport: { bg: "#6a1b9a", text: "#ffffff" },
  Art: { bg: "#4e342e", text: "#ffffff" },
  Music: { bg: "#558b2f", text: "#ffffff" },
  SES: { bg: "#f57f17", text: "#ffffff" },
};

const timeToMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

interface LayoutCourse extends Course {
  startMin: number;
  endMin: number;
  col: number;
  totalCols: number;
}

const layoutDay = (courses: Course[]): LayoutCourse[] => {
  const items = courses
    .map((c) => ({
      ...c,
      startMin: timeToMinutes(c.startTime),
      endMin: timeToMinutes(c.endTime),
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

  const result: LayoutCourse[] = [];
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

// ─── Shared: grille d'un jour ────────────────────────────────────────────────

const DayGrid = ({ courses }: { courses: LayoutCourse[] }) => (
  <Box sx={{ display: "flex" }}>
    {/* Time gutter */}
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

    {/* Column */}
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
          }}
        />
      ))}

      {courses.map((course, i) => {
        const st = SUBJECT_STYLES[course.subject] || {
          bg: "#888",
          text: "#fff",
        };
        const top = (course.startMin - DAY_START_MIN) * PX_PER_MIN;
        const height = Math.max(
          (course.endMin - course.startMin) * PX_PER_MIN,
          20,
        );
        const wPct = 100 / course.totalCols;
        const lPct = course.col * wPct;

        return (
          <Box
            key={`${course.subject}-${course.startTime}-${i}`}
            sx={{
              position: "absolute",
              top,
              height,
              left: `calc(${lPct}% + 2px)`,
              width: `calc(${wPct}% - 4px)`,
              bgcolor: st.bg,
              color: st.text,
              borderRadius: "5px",
              px: 0.75,
              py: 0.5,
              overflow: "hidden",
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
              {course.subject}
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
                {course.teacher}
              </Typography>
            )}
            {height > 54 && (
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
                {course.room}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  </Box>
);

// ─── Vue desktop : toutes les colonnes ───────────────────────────────────────

const DesktopView = ({ byDay }: { byDay: Record<string, LayoutCourse[]> }) => (
  <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
    {/* Day headers */}
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

    {/* Body */}
    <Box sx={{ display: "flex" }}>
      {/* Time gutter */}
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

      {days.map((day) => (
        <Box
          key={day}
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
                borderColor: line.isHalf
                  ? "rgba(0,0,0,0.06)"
                  : "rgba(0,0,0,0.12)",
                borderStyle: line.isHalf ? "dashed" : "solid",
              }}
            />
          ))}

          {byDay[day].map((course, i) => {
            const st = SUBJECT_STYLES[course.subject] || {
              bg: "#888",
              text: "#fff",
            };
            const top = (course.startMin - DAY_START_MIN) * PX_PER_MIN;
            const height = Math.max(
              (course.endMin - course.startMin) * PX_PER_MIN,
              20,
            );
            const wPct = 100 / course.totalCols;
            const lPct = course.col * wPct;
            return (
              <Box
                key={`${course.subject}-${course.startTime}-${i}`}
                sx={{
                  position: "absolute",
                  top,
                  height,
                  left: `calc(${lPct}% + 2px)`,
                  width: `calc(${wPct}% - 4px)`,
                  bgcolor: st.bg,
                  color: st.text,
                  borderRadius: "5px",
                  px: 0.75,
                  py: 0.5,
                  overflow: "hidden",
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
                  {course.subject}
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
                    {course.teacher}
                  </Typography>
                )}
                {height > 54 && (
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
                    {course.room}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      ))}
    </Box>
  </Paper>
);

// ─── Vue mobile : 1 jour + nav prev/next ─────────────────────────────────────

const MobileView = ({ byDay }: { byDay: Record<string, LayoutCourse[]> }) => {
  const [dayIndex, setDayIndex] = useState(0);
  const currentDay = days[dayIndex];

  return (
    <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2 }}>
      {/* Nav header */}
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

      {/* Indicateur de jour (points) */}
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

      {/* Grille du jour */}
      <DayGrid courses={byDay[currentDay]} />
    </Paper>
  );
};

// ─── Composant principal ──────────────────────────────────────────────────────

const Timetable = () => {
  const [klass, setKlass] = useState("Class 6A");
  const currentCourses = sampleData[klass] || [];

  const byDay = useMemo(() => {
    const map: Record<string, LayoutCourse[]> = {};
    days.forEach((d) => {
      map[d] = layoutDay(currentCourses.filter((c) => c.day === d));
    });
    return map;
  }, [currentCourses]);

  const usedSubjects = useMemo(
    () => [...new Set(currentCourses.map((c) => c.subject))].sort(),
    [currentCourses],
  );

  return (
    <>
      <PageHeader title="Timetable" subtitle="Weekly schedule per class" />

      <Card sx={{ p: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Class</InputLabel>
          <Select
            value={klass}
            label="Class"
            onChange={(e) => setKlass(e.target.value)}
          >
            {Object.keys(sampleData).map((k) => (
              <MenuItem key={k} value={k}>
                {k}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      {/* Desktop : visible à partir de md */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <DesktopView byDay={byDay} />
      </Box>


      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <MobileView byDay={byDay} />
      </Box>


      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
        {usedSubjects.map((s) => {
          const st = SUBJECT_STYLES[s] || { bg: "#888" };
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
  );
};

export default Timetable;
