import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface StaffMember { id: number; name: string; role: string; department: string; contract: string; phone: string; status: "Active" | "Leave"; }

const initial: StaffMember[] = [
  { id: 1, name: "Mme. Lila Karoui", role: "Administrative Director", department: "Administration", contract: "CDI", phone: "22 111 000", status: "Active" },
  { id: 2, name: "Mr. Sami Frikha", role: "Accountant", department: "Finance", contract: "CDI", phone: "22 222 111", status: "Active" },
  { id: 3, name: "Mme. Hela Zayani", role: "School Nurse", department: "Health", contract: "CDD", phone: "22 333 222", status: "Leave" },
  { id: 4, name: "Mr. Anis Ben Salah", role: "IT Officer", department: "IT", contract: "CDI", phone: "22 444 333", status: "Active" },
];

const Staff = () => {
  const [staff, setStaff] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<StaffMember>>({ contract: "CDI", status: "Active" });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.name || !form.role) { enqueueSnackbar("Name and role required", { variant: "error" }); return; }
    setStaff([...staff, { id: staff.length + 1, name: form.name!, role: form.role!, department: form.department || "", contract: form.contract || "CDI", phone: form.phone || "", status: (form.status as any) || "Active" }]);
    setForm({ contract: "CDI", status: "Active" }); setOpen(false);
    enqueueSnackbar("Staff added", { variant: "success" });
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "department", label: "Department", hideOnMobile: true },
    { key: "contract", label: "Contract", render: (r: StaffMember) => <Chip size="small" label={r.contract} /> },
    { key: "phone", label: "Phone", hideOnMobile: true },
    { key: "status", label: "Status", render: (r: StaffMember) => <Chip size="small" label={r.status} color={r.status === "Active" ? "success" : "warning"} /> },
  ];

  return (
    <AppLayout>
      <PageHeader title="Staff" subtitle="Administrative & support staff" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Staff</Button>
      } />
      <DataTable columns={columns} data={staff} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Staff Member</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Full name *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Role *" value={form.role || ""} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Department" value={form.department || ""} onChange={(e) => setForm({ ...form, department: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Contract" value={form.contract || "CDI"} onChange={(e) => setForm({ ...form, contract: e.target.value })}>
                {["CDI", "CDD", "Intern", "Consultant"].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
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

export default Staff;
