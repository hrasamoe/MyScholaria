import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Button, Card, CardContent, Typography, Chip, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useSnackbar } from "notistack";

interface Ann { id: number; title: string; body: string; audience: string; date: string; pinned?: boolean; }
const seed: Ann[] = [
  { id: 1, title: "Sports day next Friday", body: "Annual sports day scheduled for Friday May 8. All students must wear sports uniform.", audience: "All", date: "2026-05-01", pinned: true },
  { id: 2, title: "Library closed on Wednesday", body: "The library will be closed for inventory on Wednesday May 6.", audience: "Students", date: "2026-04-30" },
  { id: 3, title: "Parents meeting", body: "Parents-teachers meeting on Saturday May 16, 9am at main hall.", audience: "Parents", date: "2026-04-28" },
];

const Announcements = () => {
  const [items, setItems] = useState(seed);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Ann>>({ audience: "All" });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.title || !form.body) { enqueueSnackbar("Title and body required", { variant: "error" }); return; }
    setItems([{ id: items.length + 1, title: form.title!, body: form.body!, audience: form.audience || "All", date: new Date().toISOString().slice(0,10) }, ...items]);
    setForm({ audience: "All" }); setOpen(false);
    enqueueSnackbar("Announcement published", { variant: "success" });
  };

  return (
    <AppLayout>
      <PageHeader title="Announcements" subtitle="School-wide bulletin board" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>New Announcement</Button>
      } />
      <Grid container spacing={2}>
        {items.map(a => (
          <Grid size={{ xs: 12, md: 6 }} key={a.id}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CampaignIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle1" fontWeight={700}>{a.title}</Typography>
                  </Stack>
                  {a.pinned && <Chip size="small" color="warning" label="Pinned" />}
                </Stack>
                <Typography variant="body2" color="text.secondary" mb={1.5}>{a.body}</Typography>
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={a.audience} />
                  <Chip size="small" variant="outlined" label={a.date} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Announcement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField fullWidth label="Title *" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid size={12}><TextField fullWidth multiline rows={3} label="Body *" value={form.body || ""} onChange={(e) => setForm({ ...form, body: e.target.value })} /></Grid>
            <Grid size={12}><TextField fullWidth label="Audience" value={form.audience || "All"} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Publish</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default Announcements;
