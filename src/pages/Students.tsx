import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Student {
  id: number; firstName: string; lastName: string; email: string; phone: string;
  class: string; gender: string; dateOfBirth: string; address: string;
  parentName: string; parentPhone: string;
}

const initialStudents: Student[] = [
  { id: 1, firstName: "Ahmed", lastName: "Ben Ali", email: "ahmed@mail.com", phone: "22 111 222", class: "3A", gender: "Male", dateOfBirth: "2010-05-12", address: "Tunis", parentName: "Mohamed Ben Ali", parentPhone: "22 333 444" },
  { id: 2, firstName: "Sarah", lastName: "Bouazizi", email: "sarah@mail.com", phone: "22 555 666", class: "4B", gender: "Female", dateOfBirth: "2009-08-22", address: "Sfax", parentName: "Ali Bouazizi", parentPhone: "22 777 888" },
  { id: 3, firstName: "Youssef", lastName: "Trabelsi", email: "youssef@mail.com", phone: "22 999 000", class: "3A", gender: "Male", dateOfBirth: "2010-01-15", address: "Sousse", parentName: "Hedi Trabelsi", parentPhone: "22 111 333" },
  { id: 4, firstName: "Fatma", lastName: "Chaari", email: "fatma@mail.com", phone: "22 444 555", class: "5C", gender: "Female", dateOfBirth: "2008-11-03", address: "Monastir", parentName: "Salah Chaari", parentPhone: "22 666 999" },
];

const Students = () => {
  const [students, setStudents] = useState(initialStudents);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<Student>>({});
  const { enqueueSnackbar } = useSnackbar();

  const filtered = students.filter((s) =>
    s.firstName.toLowerCase().includes(search.toLowerCase()) ||
    s.lastName.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.firstName || !form.lastName || !form.class) {
      enqueueSnackbar("Please fill required fields", { variant: "error" });
      return;
    }
    setStudents([...students, {
      id: students.length + 1, firstName: form.firstName || "", lastName: form.lastName || "",
      email: form.email || "", phone: form.phone || "", class: form.class || "",
      gender: form.gender || "", dateOfBirth: form.dateOfBirth || "", address: form.address || "",
      parentName: form.parentName || "", parentPhone: form.parentPhone || "",
    }]);
    setForm({});
    setOpen(false);
    enqueueSnackbar("Student added successfully", { variant: "success" });
  };

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "class", label: "Class" },
    { key: "gender", label: "Gender", hideOnMobile: true },
    { key: "phone", label: "Phone", hideOnMobile: true },
    { key: "email", label: "Email", hideOnMobile: true },
  ];

  return (
    <AppLayout>
      <PageHeader
        title="Students"
        subtitle={`${students.length} students enrolled`}
        action={
          <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
            Add Student
          </Button>
        }
      />

      <TextField placeholder="Search students..." size="small" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2, maxWidth: 360, width: "100%" }} />
      <DataTable columns={columns} data={filtered} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="First Name *" value={form.firstName || ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Last Name *" value={form.lastName || ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select value={form.gender || ""} label="Gender" onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Class *" value={form.class || ""} onChange={(e) => setForm({ ...form, class: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} value={form.dateOfBirth || ""} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Address" value={form.address || ""} onChange={(e) => setForm({ ...form, address: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Parent Name" value={form.parentName || ""} onChange={(e) => setForm({ ...form, parentName: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Parent Phone" value={form.parentPhone || ""} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Save Student</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default Students;
