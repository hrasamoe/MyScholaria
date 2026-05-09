import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Subject { id: number; code: string; name: string; level: string; coefficient: number; hours: number; }

const initial: Subject[] = [
  { id: 1, code: "MATH-3", name: "Mathematics", level: "3rd Year", coefficient: 4, hours: 5 },
  { id: 2, code: "FR-3", name: "French", level: "3rd Year", coefficient: 3, hours: 4 },
  { id: 3, code: "PHY-4", name: "Physics", level: "4th Year", coefficient: 3, hours: 3 },
  { id: 4, code: "HIST-5", name: "History", level: "5th Year", coefficient: 2, hours: 2 },
];

const Subjects = () => {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Subject>>({});
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.code || !form.name) { enqueueSnackbar("Code and name required", { variant: "error" }); return; }
    setItems([...items, { id: items.length + 1, code: form.code!, name: form.name!, level: form.level || "", coefficient: Number(form.coefficient) || 1, hours: Number(form.hours) || 1 }]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Subject added", { variant: "success" });
  };

  const columns = [
    { key: "code", label: "Code", render: (r: Subject) => <Chip size="small" label={r.code} /> },
    { key: "name", label: "Subject" },
    { key: "level", label: "Level", hideOnMobile: true },
    { key: "coefficient", label: "Coef." },
    { key: "hours", label: "Hours/wk" },
  ];

  return (
    <AppLayout>
      <PageHeader title="Subjects & Syllabus" subtitle={`${items.length} subjects defined`} action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Subject</Button>
      } />
      <DataTable columns={columns} data={items} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Subject</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Code *" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Name *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Level" value={form.level || ""} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><TextField fullWidth type="number" label="Coefficient" value={form.coefficient || ""} onChange={(e) => setForm({ ...form, coefficient: Number(e.target.value) })} /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><TextField fullWidth type="number" label="Hours/week" value={form.hours || ""} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} /></Grid>
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

export default Subjects;
