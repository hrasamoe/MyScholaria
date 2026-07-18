import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import { Box, Card, Typography, Chip, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import GroupsIcon from "@mui/icons-material/Groups";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import EventIcon from "@mui/icons-material/Event";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface StudentListItem {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  class_name: string | null;
  gender: "male" | "female";
}

interface CalendarEvent {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  start_date?: string;
  date?: string;
}

const formatFirstName = (firstName: string) => {
  if (!firstName) return "";
  const parts = firstName.trim().split(/\s+/);
  if (parts.length <= 1) return parts[0];
  const initiales = parts
    .slice(1)
    .map((p) => `${p[0].toUpperCase()}.`)
    .join(" ");
  return `${parts[0]} ${initiales}`;
};

const formatEventDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const establishmentID = user?.establishment_id;

  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [classCount, setClassCount] = useState<number | null>(null);
  const [parentCount, setParentCount] = useState<number | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (!establishmentID) return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Promise.allSettled instead of Promise.all: one failing widget
        // (e.g. calendar down) must not block the whole dashboard from
        // rendering the data that did load successfully.
        const [studentsRes, teachersRes, classesRes, parentsRes, eventsRes] =
          await Promise.allSettled([
            apiRequest(`/api/students/list`, { credentials: "include" }),
            apiRequest(`/api/teachers/get-list`, { credentials: "include" }),
            // Singular "establishment", confirmed against Timetable.tsx and Classes.tsx.
            apiRequest(`/api/establishment/classes-list`, {
              credentials: "include",
            }),
            apiRequest(`/api/utils/get-parent-list`, {
              credentials: "include",
            }),
            apiRequest(`/api/calendar/get-list`, { credentials: "include" }),
          ]);

        if (studentsRes.status === "fulfilled" && studentsRes.value.ok) {
          const data = await studentsRes.value.json();
          setStudents(Array.isArray(data) ? data : []);
        }

        if (teachersRes.status === "fulfilled" && teachersRes.value.ok) {
          const data = await teachersRes.value.json();
          setTeacherCount(Array.isArray(data) ? data.length : 0);
        }

        if (classesRes.status === "fulfilled" && classesRes.value.ok) {
          const data = await classesRes.value.json();
          setClassCount(Array.isArray(data) ? data.length : 0);
        }

        if (parentsRes.status === "fulfilled" && parentsRes.value.ok) {
          const data = await parentsRes.value.json();
          setParentCount(Array.isArray(data) ? data.length : 0);
        }

        if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
          const data = await eventsRes.value.json();
          setEvents(Array.isArray(data) ? data.slice(0, 5) : []);
        }
      } catch (error: any) {
        console.error("Error loading dashboard:", error);
        enqueueSnackbar(error.message || "Failed to load dashboard data", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [establishmentID]);

  // Best-effort "recently added" list: takes the last 5 entries returned
  // by the list endpoint. This assumes the backend returns students in
  // insertion order; if it does not, ask for a dedicated /recent
  // endpoint or a created_at field to sort on.
  const recentStudents = [...students].slice(-5).reverse();

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Welcome back! Here's an overview of your school."
      />

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Total Students"
            value={loading ? "—" : students.length}
            icon={<SchoolIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Total Teachers"
            value={loading || teacherCount === null ? "—" : teacherCount}
            icon={<PeopleIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Total Classes"
            value={loading || classCount === null ? "—" : classCount}
            icon={<MeetingRoomIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, xl: 3 }}>
          <StatCard
            title="Total Parents"
            value={loading || parentCount === null ? "—" : parentCount}
            icon={<GroupsIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <EventIcon fontSize="small" color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                Upcoming Events
              </Typography>
            </Box>

            {loading ? (
              Array.from(new Array(4)).map((_, i) => (
                <Box key={i} sx={{ px: 2.5, py: 1.5 }}>
                  <Skeleton variant="text" width="70%" height={22} />
                  <Skeleton variant="text" width="40%" height={18} />
                </Box>
              ))
            ) : events.length === 0 ? (
              <Box sx={{ px: 2.5, py: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.disabled">
                  No upcoming events scheduled.
                </Typography>
              </Box>
            ) : (
              events.map((event, i) => (
                <Box
                  key={event.id}
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderBottom: i < events.length - 1 ? 1 : 0,
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {event.title || event.name || "Untitled event"}
                    </Typography>
                    {event.description && (
                      <Typography variant="caption" color="text.secondary">
                        {event.description}
                      </Typography>
                    )}
                  </Box>
                  <Chip
                    label={formatEventDate(event.start_date || event.date)}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              ))
            )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Card>
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: 1,
                borderColor: "divider",
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PersonAddIcon fontSize="small" color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                Recently Added Students
              </Typography>
            </Box>

            {loading ? (
              Array.from(new Array(4)).map((_, i) => (
                <Box key={i} sx={{ px: 2.5, py: 1.5 }}>
                  <Skeleton variant="text" width="70%" height={22} />
                  <Skeleton variant="text" width="40%" height={18} />
                </Box>
              ))
            ) : recentStudents.length === 0 ? (
              <Box sx={{ px: 2.5, py: 3, textAlign: "center" }}>
                <Typography variant="body2" color="text.disabled">
                  No students registered yet.
                </Typography>
              </Box>
            ) : (
              recentStudents.map((student, i) => (
                <Box
                  key={student.id}
                  onClick={() => navigate(`/students/details/${student.id}`)}
                  sx={{
                    px: 2.5,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    cursor: "pointer",
                    borderBottom: i < recentStudents.length - 1 ? 1 : 0,
                    borderColor: "divider",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>
                      {formatFirstName(student.first_name)} {student.last_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {student.class_name || "No class assigned"}
                    </Typography>
                  </Box>
                  <Chip
                    label={student.student_number}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                </Box>
              ))
            )}
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
