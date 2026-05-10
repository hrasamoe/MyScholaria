import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Program { id: number; code: string; name: string; cycle: "Licence" | "Master" | "Doctorat"; duration: string; ects: number; head: string; }

const initial: Program[] = [
  { id: 1, code: "L-INFO", name: "Computer Science", cycle: "Licence", duration: "3 years", ects: 180, head: "Pr. Hammami" },
  { id: 2, code: "M-DATA", name: "Data Engineering", cycle: "Master", duration: "2 years", ects: 120, head: "Pr. Kallel" },
  { id: 3, code: "D-AI", name: "Artificial Intelligence", cycle: "Doctorat", duration: "3 years", ects: 0, head: "Pr. Bouaziz" },
];

const cycleColor: any = { Licence: "primary", Master: "info", Doctorat: "secondary" };

const Programs = () => {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Program>>({ cycle: "Licence" });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.code || !form.name) { enqueueSnackbar("Code and name required", { variant: "error" }); return; }
    setItems([...items, { id: items.length + 1, code: form.code!, name: form.name!, cycle: (form.cycle as any) || "Licence", duration: form.duration || "", ects: Number(form.ects) || 0, head: form.head || "" }]);
    setForm({ cycle: "Licence" }); setOpen(false);
    enqueueSnackbar("Program added", { variant: "success" });
  };

  const columns = [
    { key: "code", label: "Code", render: (r: Program) => <Chip size="small" label={r.code} /> },
    { key: "name", label: "Program" },
    { key: "cycle", label: "Cycle", render: (r: Program) => <Chip size="small" color={cycleColor[r.cycle]} label={r.cycle} /> },
    { key: "duration", label: "Duration", hideOnMobile: true },
    { key: "ects", label: "ECTS", hideOnMobile: true },
    { key: "head", label: "Head", hideOnMobile: true },
  ];

  return (
    <>
      <PageHeader title="Programs (LMD)" subtitle="University programs and tracks" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Program</Button>
      } />
      <DataTable columns={columns} data={items} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Program</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Code *" value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Name *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Cycle" value={form.cycle || "Licence"} onChange={(e) => setForm({ ...form, cycle: e.target.value as any })}>
                {["Licence", "Master", "Doctorat"].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Duration" value={form.duration || ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="number" label="ECTS" value={form.ects || ""} onChange={(e) => setForm({ ...form, ects: Number(e.target.value) })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth label="Head" value={form.head || ""} onChange={(e) => setForm({ ...form, head: e.target.value })} /></Grid>
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

export default Programs;
