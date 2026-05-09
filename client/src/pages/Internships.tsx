import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Internship { id: number; student: string; company: string; tutor: string; start: string; end: string; status: "Pending" | "Ongoing" | "Completed"; }

const initial: Internship[] = [
  { id: 1, student: "Ahmed Ben Ali", company: "Orange Tunisia", tutor: "Mr. Saadi", start: "2026-06-01", end: "2026-08-31", status: "Pending" },
  { id: 2, student: "Sarah Bouazizi", company: "Vermeg", tutor: "Mrs. Kamoun", start: "2026-04-01", end: "2026-06-30", status: "Ongoing" },
  { id: 3, student: "Youssef Trabelsi", company: "Topnet", tutor: "Mr. Riahi", start: "2025-06-01", end: "2025-08-31", status: "Completed" },
];

const statusColor: any = { Pending: "default", Ongoing: "info", Completed: "success" };

const Internships = () => {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Internship>>({ status: "Pending" });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.student || !form.company) { enqueueSnackbar("Student and company required", { variant: "error" }); return; }
    setItems([...items, { id: items.length + 1, student: form.student!, company: form.company!, tutor: form.tutor || "", start: form.start || "", end: form.end || "", status: (form.status as any) || "Pending" }]);
    setForm({ status: "Pending" }); setOpen(false);
    enqueueSnackbar("Internship added", { variant: "success" });
  };

  const columns = [
    { key: "student", label: "Student" },
    { key: "company", label: "Company" },
    { key: "tutor", label: "Tutor", hideOnMobile: true },
    { key: "start", label: "Start", hideOnMobile: true },
    { key: "end", label: "End", hideOnMobile: true },
    { key: "status", label: "Status", render: (r: Internship) => <Chip size="small" label={r.status} color={statusColor[r.status]} /> },
  ];

  return (
    <AppLayout>
      <PageHeader title="Internships" subtitle="Internship & work-study tracking" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Internship</Button>
      } />
      <DataTable columns={columns} data={items} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Internship</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Student *" value={form.student || ""} onChange={(e) => setForm({ ...form, student: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Company *" value={form.company || ""} onChange={(e) => setForm({ ...form, company: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Tutor" value={form.tutor || ""} onChange={(e) => setForm({ ...form, tutor: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Status" value={form.status || "Pending"} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                {["Pending", "Ongoing", "Completed"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="date" label="Start" InputLabelProps={{ shrink: true }} value={form.start || ""} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="date" label="End" InputLabelProps={{ shrink: true }} value={form.end || ""} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Grid>
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

export default Internships;
