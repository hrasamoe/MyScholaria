import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Entry { id: number; date: string; class: string; subject: string; teacher: string; content: string; homework: string; }

const initial: Entry[] = [
  { id: 1, date: "2026-05-04", class: "3A", subject: "Mathematics", teacher: "Mr. Dupont", content: "Pythagoras theorem", homework: "Exercises p. 45 #1-6" },
  { id: 2, date: "2026-05-04", class: "4B", subject: "French", teacher: "Mrs. Bernard", content: "Reading: Le Petit Prince ch. 4", homework: "Summary 200 words" },
  { id: 3, date: "2026-05-03", class: "5C", subject: "Physics", teacher: "Ms. Martin", content: "Newton laws intro", homework: "Read pp. 30-35" },
];

const Coursebook = () => {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Entry>>({});
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.date || !form.subject) { enqueueSnackbar("Date and subject required", { variant: "error" }); return; }
    setItems([{ id: items.length + 1, date: form.date!, class: form.class || "", subject: form.subject!, teacher: form.teacher || "", content: form.content || "", homework: form.homework || "" }, ...items]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Entry added", { variant: "success" });
  };

  const columns = [
    { key: "date", label: "Date" },
    { key: "class", label: "Class", render: (r: Entry) => <Chip size="small" label={r.class} /> },
    { key: "subject", label: "Subject" },
    { key: "teacher", label: "Teacher", hideOnMobile: true },
    { key: "content", label: "Content covered", hideOnMobile: true },
    { key: "homework", label: "Homework" },
  ];

  return (
    <AppLayout>
      <PageHeader title="Digital Coursebook" subtitle="Daily lesson content & homework" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Entry</Button>
      } />
      <DataTable columns={columns} data={items} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Coursebook Entry</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="date" label="Date *" InputLabelProps={{ shrink: true }} value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Class" value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Subject *" value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Teacher" value={form.teacher || ""} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></Grid>
            <Grid size={12}><TextField fullWidth multiline rows={2} label="Content" value={form.content || ""} onChange={(e) => setForm({ ...form, content: e.target.value })} /></Grid>
            <Grid size={12}><TextField fullWidth multiline rows={2} label="Homework" value={form.homework || ""} onChange={(e) => setForm({ ...form, homework: e.target.value })} /></Grid>
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

export default Coursebook;
