import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Button, Card, CardContent, Typography, Box, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import EventIcon from "@mui/icons-material/Event";
import { useSnackbar } from "notistack";

interface CalEvent { id: number; title: string; type: "Holiday" | "Exam" | "Term" | "Event"; start: string; end: string; description: string; }

const seed: CalEvent[] = [
  { id: 1, title: "Back to school", type: "Term", start: "2026-09-01", end: "2026-09-01", description: "Start of academic year" },
  { id: 2, title: "Autumn break", type: "Holiday", start: "2026-10-26", end: "2026-11-01", description: "One week vacation" },
  { id: 3, title: "Mid-term exams", type: "Exam", start: "2026-12-08", end: "2026-12-15", description: "All levels" },
  { id: 4, title: "Winter break", type: "Holiday", start: "2026-12-22", end: "2027-01-04", description: "Christmas / New Year" },
  { id: 5, title: "Open day", type: "Event", start: "2027-03-15", end: "2027-03-15", description: "Welcome families" },
];

const typeColor: any = { Holiday: "warning", Exam: "error", Term: "primary", Event: "info" };

const SchoolCalendar = () => {
  const [events, setEvents] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<CalEvent>>({ type: "Event" });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.title || !form.start) { enqueueSnackbar("Title and start date required", { variant: "error" }); return; }
    setEvents([...events, { id: events.length + 1, title: form.title!, type: (form.type as any) || "Event", start: form.start!, end: form.end || form.start!, description: form.description || "" }]);
    setForm({ type: "Event" }); setOpen(false);
    enqueueSnackbar("Calendar event added", { variant: "success" });
  };

  return (
    <AppLayout>
      <PageHeader title="School Calendar" subtitle="Terms, holidays, exams and events" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Event</Button>
      } />

      <Grid container spacing={2}>
        {events.map(e => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={e.id}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventIcon color="action" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={600}>{e.title}</Typography>
                  </Box>
                  <Chip size="small" label={e.type} color={typeColor[e.type]} />
                </Stack>
                <Typography variant="body2" color="text.secondary">{e.start}{e.end !== e.start ? ` → ${e.end}` : ""}</Typography>
                <Typography variant="body2" mt={1}>{e.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Calendar Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField fullWidth label="Title *" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Type" value={form.type || "Event"} onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                {["Holiday", "Exam", "Term", "Event"].map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} />
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="date" label="Start *" InputLabelProps={{ shrink: true }} value={form.start || ""} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="date" label="End" InputLabelProps={{ shrink: true }} value={form.end || ""} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Grid>
            <Grid size={12}><TextField fullWidth multiline rows={2} label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Save</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default SchoolCalendar;
