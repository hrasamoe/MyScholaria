import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Grade { id: number; student: string; class: string; subject: string; assessment: string; score: number; max: number; coefficient: number; period: string; }

const initial: Grade[] = [
  { id: 1, student: "Ahmed Ben Ali", class: "3A", subject: "Mathematics", assessment: "Test 1", score: 16, max: 20, coefficient: 4, period: "T2" },
  { id: 2, student: "Sarah Bouazizi", class: "4B", subject: "French", assessment: "Essay", score: 14, max: 20, coefficient: 3, period: "T2" },
  { id: 3, student: "Youssef Trabelsi", class: "3A", subject: "Mathematics", assessment: "Test 1", score: 11, max: 20, coefficient: 4, period: "T2" },
  { id: 4, student: "Fatma Chaari", class: "5C", subject: "Physics", assessment: "Lab", score: 18, max: 20, coefficient: 3, period: "T2" },
];

const Grades = () => {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Grade>>({ max: 20, coefficient: 1, period: "T2" });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.student || !form.subject) { enqueueSnackbar("Student and subject required", { variant: "error" }); return; }
    setItems([...items, { id: items.length + 1, student: form.student!, class: form.class || "", subject: form.subject!, assessment: form.assessment || "", score: Number(form.score) || 0, max: Number(form.max) || 20, coefficient: Number(form.coefficient) || 1, period: form.period || "T2" }]);
    setForm({ max: 20, coefficient: 1, period: "T2" }); setOpen(false);
    enqueueSnackbar("Grade added", { variant: "success" });
  };

  const columns = [
    { key: "student", label: "Student" },
    { key: "class", label: "Class", render: (r: Grade) => <Chip size="small" label={r.class} /> },
    { key: "subject", label: "Subject", hideOnMobile: true },
    { key: "assessment", label: "Assessment", hideOnMobile: true },
    { key: "score", label: "Score", render: (r: Grade) => {
      const pct = (r.score / r.max);
      const color = pct >= 0.75 ? "success" : pct >= 0.5 ? "warning" : "error";
      return <Chip size="small" color={color as any} label={`${r.score}/${r.max}`} />;
    }},
    { key: "coefficient", label: "Coef.", hideOnMobile: true },
    { key: "period", label: "Period" },
  ];

  return (
    <>
      <PageHeader title="Grades & Bulletins" subtitle={`${items.length} grades recorded`} action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Enter Grade</Button>
      } />
      <DataTable columns={columns} data={items} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Enter Grade</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Student *" value={form.student || ""} onChange={(e) => setForm({ ...form, student: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Class" value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Subject *" value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Assessment" value={form.assessment || ""} onChange={(e) => setForm({ ...form, assessment: e.target.value })} /></Grid>
            <Grid size={{ xs: 4 }}><TextField fullWidth type="number" label="Score" value={form.score ?? ""} onChange={(e) => setForm({ ...form, score: Number(e.target.value) })} /></Grid>
            <Grid size={{ xs: 4 }}><TextField fullWidth type="number" label="Max" value={form.max ?? 20} onChange={(e) => setForm({ ...form, max: Number(e.target.value) })} /></Grid>
            <Grid size={{ xs: 4 }}><TextField fullWidth type="number" label="Coef." value={form.coefficient ?? 1} onChange={(e) => setForm({ ...form, coefficient: Number(e.target.value) })} /></Grid>
            <Grid size={12}>
              <TextField select fullWidth label="Period" value={form.period || "T2"} onChange={(e) => setForm({ ...form, period: e.target.value })}>
                {["T1", "T2", "T3", "Final"].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
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

export default Grades;
