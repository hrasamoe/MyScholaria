import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Card, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip, IconButton,
  Box, Typography, MenuItem, Select, FormControl, InputLabel, Tabs, Tab, Divider, Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useSnackbar } from "notistack";

interface Notif { id: number; title: string; body: string; audience: string; type: "info" | "success" | "warning" | "announcement"; date: string; read: boolean; }

const initial: Notif[] = [
  { id: 1, title: "Term exams schedule published", body: "Exams begin May 20. Check timetable.", audience: "All Students", type: "announcement", date: "2026-04-28 09:30", read: false },
  { id: 2, title: "Payment overdue", body: "Fatma Chaari — Term 2 fees pending.", audience: "Admin", type: "warning", date: "2026-04-27 14:10", read: false },
  { id: 3, title: "Field trip confirmed", body: "Spring trip to Carthage approved.", audience: "Class 6A Parents", type: "success", date: "2026-04-26 11:00", read: true },
  { id: 4, title: "Staff meeting Friday", body: "All teachers — staff room, 16:00.", audience: "Teachers", type: "info", date: "2026-04-25 08:45", read: true },
];

const typeMeta: Record<Notif["type"], { color: any; icon: JSX.Element }> = {
  info: { color: "info.main", icon: <InfoIcon /> },
  success: { color: "success.main", icon: <CheckCircleIcon /> },
  warning: { color: "warning.main", icon: <WarningIcon /> },
  announcement: { color: "primary.main", icon: <CampaignIcon /> },
};

const Notifications = () => {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Notif>>({ type: "info", audience: "All" });
  const { enqueueSnackbar } = useSnackbar();

  const filtered = tab === 0 ? items : tab === 1 ? items.filter(i => !i.read) : items.filter(i => i.read);
  const unread = items.filter(i => !i.read).length;

  const send = () => {
    if (!form.title || !form.body) { enqueueSnackbar("Title and body required", { variant: "error" }); return; }
    setItems([{
      id: items.length + 1, title: form.title!, body: form.body!,
      audience: form.audience || "All", type: (form.type as any) || "info",
      date: new Date().toISOString().slice(0, 16).replace("T", " "), read: false,
    }, ...items]);
    setForm({ type: "info", audience: "All" }); setOpen(false);
    enqueueSnackbar("Notification sent", { variant: "success" });
  };

  return (
    <>
      <PageHeader title="Notifications" subtitle={`${unread} unread`} action={
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DoneAllIcon />} onClick={() => setItems(items.map(i => ({ ...i, read: true })))}>Mark all read</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Send</Button>
        </Stack>
      } />

      <Card>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}>
          <Tab label={`All (${items.length})`} />
          <Tab label={`Unread (${unread})`} />
          <Tab label="Read" />
        </Tabs>
        <List disablePadding>
          {filtered.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}><Typography variant="body2" color="text.secondary">Nothing here</Typography></Box>
          ) : filtered.map((n, i) => (
            <Box key={n.id}>
              <ListItem
                sx={{ bgcolor: n.read ? "transparent" : "action.hover", py: 1.5 }}
                secondaryAction={
                  <Stack direction="row" spacing={0.5}>
                    {!n.read && (
                      <IconButton size="small" onClick={() => setItems(items.map(x => x.id === n.id ? { ...x, read: true } : x))}>
                        <DoneAllIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" onClick={() => setItems(items.filter(x => x.id !== n.id))}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: typeMeta[n.type].color }}>{typeMeta[n.type].icon}</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", pr: 8 }}>
                      <Typography variant="body2" fontWeight={n.read ? 400 : 700}>{n.title}</Typography>
                      <Chip label={n.audience} size="small" variant="outlined" />
                    </Box>
                  }
                  secondary={<><Typography component="span" variant="body2" color="text.secondary">{n.body}</Typography><Typography component="span" variant="caption" display="block" color="text.disabled">{n.date}</Typography></>}
                />
              </ListItem>
              {i < filtered.length - 1 && <Divider />}
            </Box>
          ))}
        </List>
      </Card>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField fullWidth label="Title *" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid size={12}><TextField fullWidth multiline rows={3} label="Message *" value={form.body || ""} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Audience</InputLabel>
                <Select value={form.audience || "All"} label="Audience" onChange={(e) => setForm({ ...form, audience: e.target.value })}>
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="All Students">All Students</MenuItem>
                  <MenuItem value="Teachers">Teachers</MenuItem>
                  <MenuItem value="Parents">Parents</MenuItem>
                  <MenuItem value="Admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={form.type || "info"} label="Type" onChange={(e) => setForm({ ...form, type: e.target.value as any })}>
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={send}>Send</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Notifications;
