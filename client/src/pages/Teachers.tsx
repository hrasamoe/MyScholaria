import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Teacher {
  id: number; firstName: string; lastName: string; email: string; phone: string; subject: string; qualification: string;
}

const initialTeachers: Teacher[] = [
  { id: 1, firstName: "Mohamed", lastName: "Dupont", email: "dupont@school.com", phone: "22 100 200", subject: "Mathematics", qualification: "PhD" },
  { id: 2, firstName: "Amina", lastName: "Bernard", email: "bernard@school.com", phone: "22 300 400", subject: "Physics", qualification: "Master's" },
  { id: 3, firstName: "Pierre", lastName: "Martin", email: "martin@school.com", phone: "22 500 600", subject: "English", qualification: "Bachelor's" },
];

const Teachers = () => {
  const [teachers, setTeachers] = useState(initialTeachers);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<Teacher>>({});
  const { enqueueSnackbar } = useSnackbar();

  const filtered = teachers.filter((t) =>
    t.firstName.toLowerCase().includes(search.toLowerCase()) ||
    t.lastName.toLowerCase().includes(search.toLowerCase()) ||
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.firstName || !form.lastName || !form.subject) {
      enqueueSnackbar("Please fill required fields", { variant: "error" }); return;
    }
    setTeachers([...teachers, { id: teachers.length + 1, firstName: form.firstName!, lastName: form.lastName!, email: form.email || "", phone: form.phone || "", subject: form.subject!, qualification: form.qualification || "" }]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Teacher added successfully", { variant: "success" });
  };

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "subject", label: "Subject" },
    { key: "email", label: "Email", hideOnMobile: true },
    { key: "phone", label: "Phone", hideOnMobile: true },
    { key: "qualification", label: "Qualification", hideOnMobile: true },
  ];

  return (
    <>
      <PageHeader title="Teachers" subtitle={`${teachers.length} teachers registered`} action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Teacher</Button>
      } />
      <TextField placeholder="Search teachers..." size="small" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2, maxWidth: 360, width: "100%" }} />
      <DataTable columns={columns} data={filtered} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Teacher</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="First Name *" value={form.firstName || ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Last Name *" value={form.lastName || ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Subject *" value={form.subject || ""} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Qualification" value={form.qualification || ""} onChange={(e) => setForm({ ...form, qualification: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Save Teacher</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Teachers;
