import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, Chip, Avatar, Box, Switch, FormControlLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface User { id: number; name: string; email: string; role: string; status: "Active" | "Inactive"; lastLogin: string; }

const initial: User[] = [
  { id: 1, name: "Admin Principal", email: "admin@scholara.tn", role: "Admin", status: "Active", lastLogin: "2026-04-30 08:12" },
  { id: 2, name: "Mr. Dupont", email: "dupont@scholara.tn", role: "Teacher", status: "Active", lastLogin: "2026-04-29 16:40" },
  { id: 3, name: "Ms. Trabelsi", email: "trabelsi@scholara.tn", role: "Accountant", status: "Active", lastLogin: "2026-04-30 09:00" },
  { id: 4, name: "Mr. Karim", email: "karim@scholara.tn", role: "Supervisor", status: "Inactive", lastLogin: "2026-03-15 10:22" },
];

const roleColor = (r: string): any => ({ Admin: "error", Teacher: "primary", Accountant: "warning", Supervisor: "info", Parent: "default" }[r] || "default");

const Users = () => {
  const [users, setUsers] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<User & { active: boolean }>>({ active: true, role: "Teacher" });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.name || !form.email) { enqueueSnackbar("Name and email required", { variant: "error" }); return; }
    setUsers([...users, {
      id: users.length + 1, name: form.name!, email: form.email!,
      role: form.role || "Teacher", status: form.active ? "Active" : "Inactive",
      lastLogin: "—",
    }]);
    setForm({ active: true, role: "Teacher" }); setOpen(false);
    enqueueSnackbar("User created", { variant: "success" });
  };

  const toggleStatus = (u: User) => {
    setUsers(users.map(x => x.id === u.id ? { ...x, status: x.status === "Active" ? "Inactive" : "Active" } : x));
  };

  const columns = [
    { key: "name", label: "User", render: (r: User) => (
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.8rem" }}>
          {r.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
        </Avatar>
        <Box>
          <Box sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{r.name}</Box>
          <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>{r.email}</Box>
        </Box>
      </Box>
    )},
    { key: "role", label: "Role", render: (r: User) => <Chip size="small" label={r.role} color={roleColor(r.role)} /> },
    { key: "status", label: "Status", render: (r: User) => (
      <Chip size="small" label={r.status} color={r.status === "Active" ? "success" : "default"} variant={r.status === "Active" ? "filled" : "outlined"} />
    )},
    { key: "lastLogin", label: "Last login", hideOnMobile: true },
  ];

  return (
    <>
      <PageHeader title="Users" subtitle="Manage system users and access" action={
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add User</Button>
      } />
      <DataTable columns={columns} data={users} onEdit={toggleStatus} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Full name *" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Email *" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select value={form.role || "Teacher"} label="Role" onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Teacher">Teacher</MenuItem>
                  <MenuItem value="Accountant">Accountant</MenuItem>
                  <MenuItem value="Supervisor">Supervisor</MenuItem>
                  <MenuItem value="Parent">Parent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel control={<Switch checked={!!form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />} label="Active account" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Users;
