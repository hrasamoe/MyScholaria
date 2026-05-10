import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

const initialDuties = [
  { id: 1, teacher: "Mr. Dupont", type: "Supervision", date: "2026-03-17", time: "08:00-10:00", location: "Courtyard" },
  { id: 2, teacher: "Mrs. Bernard", type: "Exam Proctor", date: "2026-03-18", time: "09:00-12:00", location: "Room A101" },
  { id: 3, teacher: "Ms. Martin", type: "Supervision", date: "2026-03-17", time: "12:00-13:00", location: "Cafeteria" },
];

const Duty = () => {
  const [duties, setDuties] = useState(initialDuties);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.teacher || !form.type) { enqueueSnackbar("Please fill required fields", { variant: "error" }); return; }
    setDuties([...duties, { id: duties.length + 1, teacher: form.teacher, type: form.type, date: form.date || "", time: form.time || "", location: form.location || "" }]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Duty assigned", { variant: "success" });
  };

  const columns = [
    { key: "teacher", label: "Teacher" },
    { key: "type", label: "Type" },
    { key: "date", label: "Date" },
    { key: "time", label: "Time", hideOnMobile: true },
    { key: "location", label: "Location", hideOnMobile: true },
  ];

  return (
    <>
      <PageHeader title="Duty" subtitle="Manage teacher duties and supervision" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Assign Duty</Button>
      } />
      <DataTable columns={columns} data={duties} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Duty</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Teacher *" value={form.teacher || ""} onChange={(e) => setForm({ ...form, teacher: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type *</InputLabel>
                <Select value={form.type || ""} label="Type *" onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <MenuItem value="Supervision">Supervision</MenuItem>
                  <MenuItem value="Exam Proctor">Exam Proctor</MenuItem>
                  <MenuItem value="Event">Event</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Time" placeholder="e.g. 08:00-10:00" value={form.time || ""} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Grid>
            <Grid size={12}><TextField fullWidth label="Location" value={form.location || ""} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Assign</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Duty;
