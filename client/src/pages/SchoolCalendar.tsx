import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/services/api.service";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useState } from "react";

interface CalEvent {
  id: number;
  title: string;
  type:
    | "Vacation"
    | "Holidays"
    | "Training days"
    | "Exams periods"
    | "School Trips"
    | "Open Days"
    | "Graduations"
    | "Parent Meetings"
    | "Sports Days"
    | "Conferences";
  isMultiDay: boolean;
  date?: string;
  startTime: string;
  endTime: string;
  startDate?: string;
  endDate?: string;
  description: string;
}

const typeColor: any = {
  Holiday: "warning",
  Exam: "error",
  Term: "primary",
  Event: "info",
};

const SchoolCalendar = () => {
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [form, setForm] = useState<Partial<CalEvent>>({
    type: "School Trips",
    startTime: "",
    endTime: "",
  });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = async () => {
    if (!form.title) {
      enqueueSnackbar("Title required", { variant: "error" });
      return;
    }

    if (isMultiDay) {
      if (!form.startDate || !form.endDate) {
        enqueueSnackbar("Start and end dates required", { variant: "error" });
        return;
      }
      try {
        setLoading(true);
        const reponse = await apiRequest(`/api/calendar/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            type: form.type,
            isMultiDay: true,
            startDate: form.startDate,
            endDate: form.endDate,
            startTime: form.startTime,
            endTime: form.endTime,
          }),
        });
        if (reponse.ok) {
          const newEvent: CalEvent = {
            id: events.length + 1,
            title: form.title!,
            type: form.type,
            isMultiDay: true,
            startTime: form.startTime || "",
            endTime: form.endTime || "",
            description: form.description || "",
            startDate: form.startDate,
            endDate: form.endDate,
          };

          setEvents([...events, newEvent]);
          setForm({ type: "Vacation", startTime: "", endTime: "" });
          setOpen(false);
          enqueueSnackbar("Calendar event added", { variant: "success" });
        }
      } catch (error: any) {
        enqueueSnackbar(error.message || "Failed to add event", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    } else {
      if (!form.date || !form.startTime || !form.endTime) {
        enqueueSnackbar("Date, start and end time required", {
          variant: "error",
        });
        return;
      }
      try {
        setLoading(true);
        const reponse = await apiRequest(`/api/calendar/create`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            type: form.type,
            isMultiDay: false,
            date: form.date,
            startTime: form.startTime,
            endTime: form.endTime,
          }),
        });
        if (reponse.ok) {
          const newEvent: CalEvent = {
            id: events.length + 1,
            title: form.title!,
            type: form.type,
            isMultiDay: false,
            startTime: form.startTime || "",
            endTime: form.endTime || "",
            description: form.description || "",
            date: form.date,
          };

          setEvents([...events, newEvent]);
          setForm({ type: "Vacation", startTime: "", endTime: "" });
          setOpen(false);
          enqueueSnackbar("Calendar event added", { variant: "success" });
        }
      } catch (error: any) {
        enqueueSnackbar(error.message || "Failed to add event", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <PageHeader
        title="School Calendar"
        subtitle="Terms, holidays, exams and events"
        action={
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add Event
          </Button>
        }
      />

      <Grid container spacing={2}>
        {events.map((e) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={e.id}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  mb={1}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventIcon color="action" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {e.title}
                    </Typography>
                  </Box>
                  <Chip size="small" label={e.type} color={typeColor[e.type]} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {e.isMultiDay ? `${e.startDate} → ${e.endDate}` : e.date}
                </Typography>
                {e.startTime && e.endTime && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mt: 0.5,
                    }}
                  >
                    <AccessTimeIcon fontSize="inherit" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {e.startTime} - {e.endTime}{" "}
                      {e.isMultiDay && "(Every day)"}
                    </Typography>
                  </Box>
                )}
                <Typography variant="body2" mt={1}>
                  {e.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={open}
        onClose={() => !loading && setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Calendar Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <RadioGroup
                row
                value={isMultiDay ? "multiple" : "single"}
                onChange={(e) => setIsMultiDay(e.target.value === "multiple")}
              >
                <FormControlLabel
                  value="single"
                  control={<Radio disabled={loading} />}
                  label="Single Day"
                />
                <FormControlLabel
                  value="multiple"
                  control={<Radio disabled={loading} />}
                  label="Multiple Days"
                />
              </RadioGroup>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                disabled={loading}
                label="Title *"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                disabled={loading}
                label="Type"
                value={form.type || "Event"}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value as any })
                }
              >
                {[
                  "Vacation",
                  "Holidays",
                  "Training days",
                  "Exams periods",
                  "School Trips",
                ].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {!isMultiDay ? (
              <Grid size={12}>
                <TextField
                  fullWidth
                  type="date"
                  disabled={loading}
                  label="Date *"
                  InputLabelProps={{ shrink: true }}
                  value={form.date || ""}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </Grid>
            ) : (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    disabled={loading}
                    label="Start Date *"
                    InputLabelProps={{ shrink: true }}
                    value={form.startDate || ""}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    disabled={loading}
                    label="End Date *"
                    InputLabelProps={{ shrink: true }}
                    value={form.endDate || ""}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="time"
                disabled={loading}
                label="Start Time *"
                InputLabelProps={{ shrink: true }}
                value={form.startTime || ""}
                onChange={(e) =>
                  setForm({ ...form, startTime: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="time"
                disabled={loading}
                label="End Time *"
                InputLabelProps={{ shrink: true }}
                value={form.endTime || ""}
                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                disabled={loading}
                label="Description"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={loading}
            startIcon={
              loading && <CircularProgress size={20} color="inherit" />
            }
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SchoolCalendar;
