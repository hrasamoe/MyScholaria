import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

const initialClasses = [
  { id: 1, name: "3A", level: "3rd Year", teacher: "Mr. Dupont", students: 32, schedule: "Mon-Fri 08:00-12:00" },
  { id: 2, name: "4B", level: "4th Year", teacher: "Mrs. Bernard", students: 28, schedule: "Mon-Fri 08:00-12:00" },
  { id: 3, name: "5C", level: "5th Year", teacher: "Ms. Martin", students: 30, schedule: "Mon-Fri 13:00-17:00" },
  { id: 4, name: "6A", level: "6th Year", teacher: "Mr. Leclerc", students: 25, schedule: "Mon-Fri 08:00-12:00" },
];

const Classes = () => {
  const [classes, setClasses] = useState(initialClasses);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.name || !form.level) { enqueueSnackbar("Please fill required fields", { variant: "error" }); return; }
    setClasses([...classes, { id: classes.length + 1, name: form.name, level: form.level, teacher: form.teacher || "", students: 0, schedule: form.schedule || "" }]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Class added successfully", { variant: "success" });
  };

  const columns = [
    { key: "name", label: "Class" },
    { key: "level", label: "Level" },
    { key: "teacher", label: "Main Teacher" },
    { key: "students", label: "Students" },
    { key: "schedule", label: "Schedule", hideOnMobile: true },
  ];

  return (
    <AppLayout>
      <PageHeader title="Classes" subtitle={`${classes.length} classes`} action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Class</Button>
      } />
      <DataTable columns={columns} data={classes} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Class</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Class Name *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Level *" value={form.level || ""} onChange={(e) => setForm({ ...form, level: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Main Teacher" value={form.teacher || ""} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Schedule" value={form.schedule || ""} onChange={(e) => setForm({ ...form, schedule: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Save Class</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default Classes;
