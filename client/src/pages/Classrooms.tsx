import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

const initialRooms = [
  { id: 1, name: "A101", building: "Building A", capacity: 35, type: "Lecture", equipment: "Projector, Whiteboard" },
  { id: 2, name: "B203", building: "Building B", capacity: 30, type: "Lab", equipment: "Computers, Projector" },
  { id: 3, name: "A105", building: "Building A", capacity: 40, type: "Lecture", equipment: "Whiteboard" },
  { id: 4, name: "C301", building: "Building C", capacity: 25, type: "Seminar", equipment: "Smart Board" },
];

const Classrooms = () => {
  const [rooms, setRooms] = useState(initialRooms);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.name) { enqueueSnackbar("Please fill required fields", { variant: "error" }); return; }
    setRooms([...rooms, { id: rooms.length + 1, name: form.name, building: form.building || "", capacity: parseInt(form.capacity || "0"), type: form.type || "", equipment: form.equipment || "" }]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Classroom added", { variant: "success" });
  };

  const columns = [
    { key: "name", label: "Room" },
    { key: "building", label: "Building" },
    { key: "capacity", label: "Capacity" },
    { key: "type", label: "Type", hideOnMobile: true },
    { key: "equipment", label: "Equipment", hideOnMobile: true },
  ];

  return (
    <AppLayout>
      <PageHeader title="Classrooms" subtitle={`${rooms.length} classrooms`} action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Classroom</Button>
      } />
      <DataTable columns={columns} data={rooms} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Classroom</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Room Name *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Building" value={form.building || ""} onChange={(e) => setForm({ ...form, building: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Capacity" type="number" value={form.capacity || ""} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Type" value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Grid>
            <Grid size={12}><TextField fullWidth label="Equipment" value={form.equipment || ""} onChange={(e) => setForm({ ...form, equipment: e.target.value })} /></Grid>
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

export default Classrooms;
