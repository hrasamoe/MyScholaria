import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Thesis { id: number; student: string; title: string; supervisor: string; program: string; defenseDate: string; status: "Drafting" | "Submitted" | "Defended"; }

const initial: Thesis[] = [
  { id: 1, student: "Mariem Khelifi", title: "Federated learning for medical imaging", supervisor: "Pr. Bouaziz", program: "D-AI", defenseDate: "2026-09-15", status: "Drafting" },
  { id: 2, student: "Karim Saadi", title: "Streaming pipelines on Kubernetes", supervisor: "Pr. Kallel", program: "M-DATA", defenseDate: "2026-06-20", status: "Submitted" },
  { id: 3, student: "Lina Riahi", title: "GraphQL federation patterns", supervisor: "Pr. Hammami", program: "L-INFO", defenseDate: "2025-06-30", status: "Defended" },
];

const statusColor: any = { Drafting: "default", Submitted: "info", Defended: "success" };

const Theses = () => {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Thesis>>({ status: "Drafting" });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.student || !form.title) { enqueueSnackbar("Student and title required", { variant: "error" }); return; }
    setItems([...items, { id: items.length + 1, student: form.student!, title: form.title!, supervisor: form.supervisor || "", program: form.program || "", defenseDate: form.defenseDate || "", status: (form.status as any) || "Drafting" }]);
    setForm({ status: "Drafting" }); setOpen(false);
    enqueueSnackbar("Thesis added", { variant: "success" });
  };

  const columns = [
    { key: "student", label: "Student" },
    { key: "title", label: "Title" },
    { key: "supervisor", label: "Supervisor", hideOnMobile: true },
    { key: "program", label: "Program", render: (r: Thesis) => <Chip size="small" label={r.program} /> },
    { key: "defenseDate", label: "Defense", hideOnMobile: true },
    { key: "status", label: "Status", render: (r: Thesis) => <Chip size="small" label={r.status} color={statusColor[r.status]} /> },
  ];

  return (
    <>
      <PageHeader title="Theses & Dissertations" subtitle="Submission, supervision and defenses" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Thesis</Button>
      } />
      <DataTable columns={columns} data={items} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Thesis</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Student *" value={form.student || ""} onChange={(e) => setForm({ ...form, student: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Supervisor" value={form.supervisor || ""} onChange={(e) => setForm({ ...form, supervisor: e.target.value })} /></Grid>
            <Grid size={12}><TextField fullWidth label="Title *" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Program" value={form.program || ""} onChange={(e) => setForm({ ...form, program: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="date" label="Defense date" InputLabelProps={{ shrink: true }} value={form.defenseDate || ""} onChange={(e) => setForm({ ...form, defenseDate: e.target.value })} /></Grid>
            <Grid size={12}>
              <TextField select fullWidth label="Status" value={form.status || "Drafting"} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                {["Drafting", "Submitted", "Defended"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Theses;
