import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, CardContent, Typography, Chip, Stack, Box, IconButton, List, ListItem,
  ListItemText, Divider, MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import LocalActivityIcon from "@mui/icons-material/LocalActivity";
import { useSnackbar } from "notistack";

interface Activity { name: string; fee: number }
interface SchoolEvent {
  id: number;
  title: string;
  date: string;
  location: string;
  type: string;
  description: string;
  activities: Activity[];
}

const initial: SchoolEvent[] = [
  { id: 1, title: "Spring Field Trip", date: "2026-05-12", location: "Carthage", type: "Trip", description: "Day trip to historical sites.",
    activities: [{ name: "Bus Transport", fee: 25 }, { name: "Museum Entry", fee: 10 }, { name: "Lunch", fee: 15 }] },
  { id: 2, title: "Annual Science Fair", date: "2026-04-22", location: "Main Hall", type: "Academic", description: "Student projects exhibition.",
    activities: [{ name: "Materials Kit", fee: 20 }] },
  { id: 3, title: "End of Year Gala", date: "2026-06-25", location: "School Theater", type: "Celebration", description: "Performances and awards ceremony.",
    activities: [{ name: "Ticket", fee: 30 }, { name: "Dinner", fee: 40 }] },
];

const typeColor = (t: string): any => ({ Trip: "info", Academic: "primary", Celebration: "secondary", Sport: "success" }[t] || "default");

const Events = () => {
  const [events, setEvents] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<SchoolEvent>>({});
  const [activities, setActivities] = useState<Activity[]>([]);
  const [actName, setActName] = useState("");
  const [actFee, setActFee] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const reset = () => { setForm({}); setActivities([]); setActName(""); setActFee(""); };

  const addActivity = () => {
    if (!actName || !actFee) return;
    setActivities([...activities, { name: actName, fee: Number(actFee) }]);
    setActName(""); setActFee("");
  };

  const handleAdd = () => {
    if (!form.title || !form.date) { enqueueSnackbar("Title and date required", { variant: "error" }); return; }
    setEvents([...events, {
      id: events.length + 1,
      title: form.title!, date: form.date!, location: form.location || "",
      type: form.type || "Academic", description: form.description || "", activities,
    }]);
    reset(); setOpen(false);
    enqueueSnackbar("Event created", { variant: "success" });
  };

  const total = (acts: Activity[]) => acts.reduce((s, a) => s + a.fee, 0);

  return (
    <AppLayout>
      <PageHeader title="Events" subtitle="Plan school events with activities and fees" action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>New Event</Button>
      } />

      <Grid container spacing={2}>
        {events.map((ev) => (
          <Grid key={ev.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EventIcon color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight={700}>{ev.title}</Typography>
                  </Box>
                  <Chip label={ev.type} size="small" color={typeColor(ev.type)} />
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  📅 {ev.date} · 📍 {ev.location}
                </Typography>
                <Typography variant="body2" mb={2}>{ev.description}</Typography>
                <Divider sx={{ mb: 1 }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Activities & Fees
                </Typography>
                <List dense disablePadding>
                  {ev.activities.map((a, i) => (
                    <ListItem key={i} disableGutters sx={{ py: 0.3 }}>
                      <LocalActivityIcon fontSize="small" sx={{ color: "text.secondary", mr: 1 }} />
                      <ListItemText primary={a.name} primaryTypographyProps={{ variant: "body2" }} />
                      <Typography variant="body2" fontWeight={600}>{a.fee} DT</Typography>
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={700}>Total per student</Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">{total(ev.activities)} DT</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => { setOpen(false); reset(); }} maxWidth="md" fullWidth>
        <DialogTitle>Create Event</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField fullWidth label="Title *" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={form.type || "Academic"} label="Type" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <MenuItem value="Academic">Academic</MenuItem>
                  <MenuItem value="Trip">Trip</MenuItem>
                  <MenuItem value="Celebration">Celebration</MenuItem>
                  <MenuItem value="Sport">Sport</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Date *" type="date" InputLabelProps={{ shrink: true }} value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Location" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Grid>
            <Grid size={12}>
              <TextField fullWidth multiline rows={2} label="Description" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>

            <Grid size={12}>
              <Divider sx={{ my: 1 }}><Chip label="Activities & Fees" size="small" /></Divider>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth size="small" label="Activity name" value={actName} onChange={(e) => setActName(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 8, sm: 4 }}>
              <TextField fullWidth size="small" label="Fee (DT)" type="number" value={actFee} onChange={(e) => setActFee(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 4, sm: 2 }}>
              <Button fullWidth variant="outlined" onClick={addActivity}>Add</Button>
            </Grid>
            {activities.length > 0 && (
              <Grid size={12}>
                <List dense>
                  {activities.map((a, i) => (
                    <ListItem key={i} secondaryAction={
                      <IconButton edge="end" onClick={() => setActivities(activities.filter((_, j) => j !== i))}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    }>
                      <ListItemText primary={a.name} secondary={`${a.fee} DT`} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Create</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default Events;
