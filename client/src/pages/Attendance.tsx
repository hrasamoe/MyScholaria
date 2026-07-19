import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/services/api.service";
import {
  Box,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Typography,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SaveIcon from "@mui/icons-material/Save";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

interface ClassSubjectOption {
  id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
}

interface RosterEntry {
  student_id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  status: "present" | "absent" | "late" | "excused" | null;
  comment: string | null;
}

const STATUS_OPTIONS: {
  value: RosterEntry["status"];
  label: string;
  color: "success" | "error" | "warning" | "info";
}[] = [
  { value: "present", label: "Present", color: "success" },
  { value: "late", label: "Late", color: "warning" },
  { value: "excused", label: "Excused", color: "info" },
  { value: "absent", label: "Absent", color: "error" },
];

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

const todayISO = () => new Date().toISOString().split("T")[0];

const Attendance = () => {
  const { enqueueSnackbar } = useSnackbar();

  const [classSubjects, setClassSubjects] = useState<ClassSubjectOption[]>([]);
  const [classSubjectID, setClassSubjectID] = useState("");
  const [date, setDate] = useState(todayISO());

  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [loadingClassSubjects, setLoadingClassSubjects] = useState(true);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load the list of classes/subjects the connected user (teacher or
  // admin/staff) is allowed to mark attendance for.
  useEffect(() => {
    const fetchClassSubjects = async () => {
      try {
        setLoadingClassSubjects(true);
        const res = await apiRequest("/api/attendance/class-subjects", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load classes");
        const data = await res.json();
        setClassSubjects(data);
        if (data.length > 0) setClassSubjectID((prev) => prev || data[0].id);
      } catch (error: any) {
        enqueueSnackbar(error.message || "Error loading classes", {
          variant: "error",
        });
      } finally {
        setLoadingClassSubjects(false);
      }
    };
    fetchClassSubjects();
  }, [enqueueSnackbar]);

  // Load (or reload) the roster whenever the selected class+subject or
  // date changes. Existing attendance entries come back pre-filled.
  useEffect(() => {
    if (!classSubjectID || !date) return;

    const fetchRoster = async () => {
      try {
        setLoadingRoster(true);
        const res = await apiRequest(
          `/api/attendance/roster?classSubjectID=${classSubjectID}&date=${date}`,
          { credentials: "include" },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || "Failed to load roster");
        }
        const data = await res.json();
        setRoster(data);
      } catch (error: any) {
        enqueueSnackbar(error.message || "Error loading roster", {
          variant: "error",
        });
        setRoster([]);
      } finally {
        setLoadingRoster(false);
      }
    };
    fetchRoster();
  }, [classSubjectID, date, enqueueSnackbar]);

  const setStudentStatus = (
    studentID: string,
    status: RosterEntry["status"],
  ) => {
    setRoster((prev) =>
      prev.map((r) => (r.student_id === studentID ? { ...r, status } : r)),
    );
  };

  // Sets every student without an existing status to "present" — a
  // common shortcut so the teacher only has to touch the exceptions.
  const markAllPresent = () => {
    setRoster((prev) =>
      prev.map((r) => (r.status ? r : { ...r, status: "present" })),
    );
  };

  const handleSave = async () => {
    const entries = roster
      .filter((r) => r.status !== null)
      .map((r) => ({
        studentID: r.student_id,
        status: r.status as string,
        comment: r.comment || undefined,
      }));

    if (entries.length === 0) {
      enqueueSnackbar("Mark at least one student before saving", {
        variant: "warning",
      });
      return;
    }

    try {
      setSaving(true);
      const res = await apiRequest("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ classSubjectID, date, entries }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      enqueueSnackbar("Attendance saved", { variant: "success" });
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error saving attendance", {
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const markedCount = roster.filter((r) => r.status !== null).length;

  return (
    <>
      <PageHeader
        title="Attendance"
        subtitle="Mark daily attendance per class and subject"
      />

      <Card sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Class & Subject</InputLabel>
              {loadingClassSubjects ? (
                <Skeleton variant="rounded" height={40} />
              ) : (
                <Select
                  value={classSubjectID}
                  label="Class & Subject"
                  onChange={(e) => setClassSubjectID(e.target.value)}
                >
                  {classSubjects.map((cs) => (
                    <MenuItem key={cs.id} value={cs.id}>
                      {cs.class_name} — {cs.subject_name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Grid>
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{
              display: "flex",
              justifyContent: { xs: "flex-start", md: "flex-end" },
              gap: 1,
            }}
          >
            <Button
              size="small"
              onClick={markAllPresent}
              disabled={loadingRoster || roster.length === 0}
            >
              Mark all present
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving || loadingRoster || roster.length === 0}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {!loadingRoster && roster.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {markedCount} / {roster.length} students marked
        </Typography>
      )}

      {loadingRoster ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {Array.from(new Array(6)).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Box>
      ) : roster.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Typography color="text.disabled">
            No students found for this class.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {roster.map((student) => (
            <Card
              key={student.student_id}
              variant="outlined"
              sx={{
                p: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ minWidth: 180 }}>
                <Typography fontWeight={500}>
                  {formatFirstName(student.first_name)} {student.last_name}
                </Typography>
                <Chip
                  label={student.student_number}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 0.5 }}
                />
              </Box>

              <ToggleButtonGroup
                size="small"
                exclusive
                value={student.status}
                onChange={(_, value) =>
                  setStudentStatus(student.student_id, value)
                }
              >
                {STATUS_OPTIONS.map((opt) => (
                  <ToggleButton
                    key={opt.value}
                    value={opt.value}
                    sx={{
                      "&.Mui-selected": {
                        bgcolor: `${opt.color}.main`,
                        color: "white",
                        "&:hover": { bgcolor: `${opt.color}.dark` },
                      },
                    }}
                  >
                    {opt.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Card>
          ))}
        </Box>
      )}
    </>
  );
};

export default Attendance;
