import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Exam { id: number; title: string; subject: string; date: string; time: string; room: string; supervisor: string; classes: string; }

const initial: Exam[] = [
  { id: 1, title: "Mid-term Math", subject: "Mathematics", date: "2026-05-20", time: "08:30", room: "A101", supervisor: "Mr. Dupont", classes: "3A, 3B" },
  { id: 2, title: "Mid-term French", subject: "French", date: "2026-05-22", time: "10:00", room: "B203", supervisor: "Mrs. Bernard", classes: "4B" },
  { id: 3, title: "Physics quiz", subject: "Physics", date: "2026-05-25", time: "14:00", room: "C301", supervisor: "Ms. Martin", classes: "5C" },
];

const Exams = () => {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Exam>>({});
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.title || !form.date) { enqueueSnackbar("Title and date required", { variant: "error" }); return; }
    setItems([...items, { id: items.length + 1, title: form.title!, subject: form.subject || "", date: form.date!, time: form.time || "", room: form.room || "", supervisor: form.supervisor || "", classes: form.classes || "" }]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Exam scheduled", { variant: "success" });
  };

  const columns = [
    { key: "title", label: "Exam" },
    { key: "subject", label: "Subject", hideOnMobile: true },
    { key: "date", label: "Date" },
    { key: "time", label: "Time" },
    { key: "room", label: "Room", render: (r: Exam) => <Chip size="small" label={r.room} /> },
    { key: "supervisor", label: "Supervisor", hideOnMobile: true },
    { key: "classes", label: "Classes", hideOnMobile: true },
  ];

  return (
    <AppLayout>
      <PageHeader title="Exams" subtitle="Scheduling and supervision" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Schedule Exam</Button>
      } />
      <DataTable columns={columns} data={items} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule Exam</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField fullWidth label="Title *" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Subject" value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Classes" value={form.classes || ""} onChange={(e) => setForm({ ...form, classes: e.target.value })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="date" label="Date *" InputLabelProps={{ shrink: true }} value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="time" label="Time" InputLabelProps={{ shrink: true }} value={form.time || ""} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Room" value={form.room || ""} onChange={(e) => setForm({ ...form, room: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Supervisor" value={form.supervisor || ""} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} /></Grid>
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

export default Exams;
