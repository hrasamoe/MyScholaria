import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
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
  IconButton,
  MenuItem,
  Radio,
  RadioGroup,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

interface CalEvent {
  id: number;
  title: string;
  event_type:
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
  is_multiple_day: boolean;
  date?: string;
  start_time: string;
  end_time: string;
  start_date?: string;
  end_date?: string;
  description: string;
}

const typeColor: any = {
  Vacation: "warning",
  Holidays: "warning",
  "Training days": "primary",
  "Exams periods": "error",
  "School Trips": "info",
  "Open Days": "info",
  Graduations: "success",
  "Parent Meetings": "primary",
  "Sports Days": "success",
  Conferences: "secondary",
};

const SchoolCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [is_multiple_day, setis_multiple_day] = useState(false);
  const establishmentID = user?.establishment_id;
  const [form, setForm] = useState<Partial<CalEvent>>({
    event_type: "School Trips",
    start_time: "",
    end_time: "",
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const reponse = await apiRequest("/api/calendar/get-list", {
        method: "GET",
        credentials: "include",
      });
      if (reponse.ok) {
        const data = await reponse.json();
        setEvents(Array.isArray(data) ? data : data.events || []);
      }
    } catch (error: any) {
      console.error(error);
      enqueueSnackbar(error.message || "Failed to fetch event list", {
        variant: "error",
      });
    }
  };

  const handleAdd = async () => {
    if (!form.title) {
      enqueueSnackbar("Title required", { variant: "error" });
      return;
    }

    if (is_multiple_day) {
      if (!form.start_date || !form.end_date) {
        enqueueSnackbar("Start and end dates required", { variant: "error" });
        return;
      }
      try {
        setSubmitting(true);
        const reponse = await apiRequest(`/api/calendar/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            type: form.event_type,
            is_multiple_day: true,
            start_date: form.start_date,
            end_date: form.end_date,
            start_time: form.start_time,
            end_time: form.end_time,
          }),
        });
        if (reponse.ok) {
          const createdEvent = await reponse.json();
          setEvents([...events, createdEvent]);
          setForm({ event_type: "Vacation", start_time: "", end_time: "" });
          setOpen(false);
          enqueueSnackbar("Calendar event added", { variant: "success" });
        }
      } catch (error: any) {
        enqueueSnackbar(error.message || "Failed to add event", {
          variant: "error",
        });
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!form.date || !form.start_time || !form.end_time) {
        enqueueSnackbar("Date, start and end time required", {
          variant: "error",
        });
        return;
      }
      try {
        setSubmitting(true);
        const reponse = await apiRequest(`/api/calendar/create`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.title,
            description: form.description,
            type: form.event_type,
            is_multiple_day: false,
            date: form.date,
            start_time: form.start_time,
            end_time: form.end_time,
          }),
        });
        if (reponse.ok) {
          const createdEvent = await reponse.json();
          setEvents([...events, createdEvent]);
          setForm({ event_type: "Vacation", start_time: "", end_time: "" });
          setOpen(false);
          enqueueSnackbar("Calendar event added", { variant: "success" });
        }
      } catch (error: any) {
        enqueueSnackbar(error.message || "Failed to add event", {
          variant: "error",
        });
      } finally {
        setSubmitting(false);
      }
    }
  };

  useEffect(() => {
    if (establishmentID) {
      const loadEvent = async () => {
        setFetching(true);
        await fetchEvents();
        setFetching(false);
      };
      loadEvent();
    }
  }, [establishmentID]);

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
        {fetching ? (
          Array.from(new Array(6)).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Skeleton variant="text" width="60%" height={28} />
                    <Skeleton variant="rounded" width={80} height={24} />
                  </Stack>
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton
                    variant="text"
                    width="30%"
                    height={16}
                    sx={{ mt: 0.5 }}
                  />
                  <Skeleton
                    variant="text"
                    width="90%"
                    height={40}
                    sx={{ mt: 1 }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : Array.isArray(events) && events.length > 0 ? (
          events.map((e) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={e.id}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent
                  sx={{
                    position: "relative",
                  }}
                >
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
                    <Chip
                      size="small"
                      label={e.event_type}
                      color={typeColor[e.event_type] || "info"}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {e.is_multiple_day
                      ? `${e.start_date} → ${e.end_date}`
                      : e.date}
                  </Typography>
                  {e.start_time && e.end_time && (
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
                        {e.start_time} - {e.end_time}{" "}
                        {e.is_multiple_day && "(Every day)"}
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="body2" mt={1}>
                    {e.description}
                  </Typography>
                  <IconButton
                    sx={{
                      position: "absolute",
                      right: "9px",
                      bottom: "20px",
                    }}
                  >
                    <Delete color="error" />
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={12}>
            <Typography
              variant="body1"
              color="text.secondary"
              align="center"
              sx={{ my: 4 }}
            >
              No events found.
            </Typography>
          </Grid>
        )}
      </Grid>

      <Dialog
        open={open}
        onClose={() => !submitting && setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add Calendar Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <RadioGroup
                row
                value={is_multiple_day ? "multiple" : "single"}
                onChange={(e) =>
                  setis_multiple_day(e.target.value === "multiple")
                }
              >
                <FormControlLabel
                  value="single"
                  control={<Radio disabled={submitting} />}
                  label="Single Day"
                />
                <FormControlLabel
                  value="multiple"
                  control={<Radio disabled={submitting} />}
                  label="Multiple Days"
                />
              </RadioGroup>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                disabled={submitting}
                label="Title *"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                disabled={submitting}
                label="Type"
                value={form.event_type || "School Trips"}
                onChange={(e) =>
                  setForm({ ...form, event_type: e.target.value as any })
                }
              >
                {[
                  "Vacation",
                  "Holidays",
                  "Training days",
                  "Exams periods",
                  "School Trips",
                  "Open Days",
                  "Graduations",
                  "Parent Meetings",
                  "Sports Days",
                  "Conferences",
                ].map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            {!is_multiple_day ? (
              <Grid size={12}>
                <TextField
                  fullWidth
                  type="date"
                  disabled={submitting}
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
                    disabled={submitting}
                    label="Start Date *"
                    InputLabelProps={{ shrink: true }}
                    value={form.start_date || ""}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    type="date"
                    disabled={submitting}
                    label="End Date *"
                    InputLabelProps={{ shrink: true }}
                    value={form.end_date || ""}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                  />
                </Grid>
              </>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="time"
                disabled={submitting}
                label="Start Time *"
                InputLabelProps={{ shrink: true }}
                value={form.start_time || ""}
                onChange={(e) =>
                  setForm({ ...form, start_time: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="time"
                disabled={submitting}
                label="End Time *"
                InputLabelProps={{ shrink: true }}
                value={form.end_time || ""}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                disabled={submitting}
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
          <Button onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            disabled={submitting}
            startIcon={
              submitting && <CircularProgress size={20} color="inherit" />
            }
          >
            {submitting ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SchoolCalendar;
