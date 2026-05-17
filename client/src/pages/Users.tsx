import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Box,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";
import { useAuth } from "@/hooks/Authcontext";

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

const roleColor = (r: string): any =>
  ({
    Admin: "error",
    Teacher: "primary",
    Accountant: "warning",
    Supervisor: "info",
    Parent: "default",
  })[r] || "default";

const Users = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const establishment_id = user?.establishment_id;
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [form, setForm] = useState<Partial<User & { active: boolean }>>({
    active: true,
    role: "Teacher",
  });
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!establishment_id) return;
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/establishment/${establishment_id}/pending-members`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        if (!response.ok)
          throw new Error("Error when fetch the pending user list");
        const data = await response.json();
        const mapped: User[] = (data as any[]).map((m: any) => ({
          id: m.user_id,
          name: m.name,
          email: m.email,
          role: m.role,
          status: (m.is_active ? "Active" : "Inactive") as User["status"],
          lastLogin: m.joined_at
            ? new Date(m.joined_at).toLocaleDateString()
            : "—",
        }));
        setUsers(mapped);
      } catch (error) {
        enqueueSnackbar("Can't fetch user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [establishment_id, enqueueSnackbar]);

  const handleAdd = () => {
    if (!form.name || !form.email) {
      enqueueSnackbar("Name and email required", { variant: "error" });
      return;
    }
    setUsers([
      ...users,
      {
        id: Date.now(),
        name: form.name!,
        email: form.email!,
        role: form.role || "Teacher",
        status: form.active ? "Active" : "Inactive",
        lastLogin: "—",
      },
    ]);
    setForm({ active: true, role: "Teacher" });
    setOpen(false);
    enqueueSnackbar("User created", { variant: "success" });
  };

  const handleOpenEdit = (u: User) => {
    setSelectedUser(u);
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!selectedUser) return;
    setUsers(
      users.map((x) => (x.id === selectedUser.id ? { ...selectedUser } : x)),
    );
    setEditOpen(false);
    setSelectedUser(null);
    enqueueSnackbar("User updated successfully", { variant: "success" });
  };

  const columns = [
    {
      key: "name",
      label: "User",
      render: (r: User) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: "primary.main",
              fontSize: "0.8rem",
            }}
          >
            {r.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </Avatar>
          <Box>
            <Box sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{r.name}</Box>
            <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              {r.email}
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (r: User) => (
        <Chip
          size="small"
          label={r.role.toLowerCase()}
          color={roleColor(r.role)}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (r: User) => (
        <Chip
          size="small"
          label={r.status}
          color={r.status === "Active" ? "success" : "default"}
          variant={r.status === "Active" ? "filled" : "outlined"}
        />
      ),
    },
    { key: "lastLogin", label: "Last login", hideOnMobile: true },
  ];

  return (
    <>
      <PageHeader
        title="Users"
        subtitle="Manage system users and access"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            Add User
          </Button>
        }
      />

      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 1 }}>
          Pending Member Approbations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Review and manage user registration requests waiting for approval.
        </Typography>

        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        ) : (
          <DataTable columns={columns} data={users} onEdit={handleOpenEdit} />
        )}
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full name *"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email *"
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={form.role || "Teacher"}
                  label="Role"
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Teacher">Teacher</MenuItem>
                  <MenuItem value="Accountant">Accountant</MenuItem>
                  <MenuItem value="Supervisor">Supervisor</MenuItem>
                  <MenuItem value="Parent">Parent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!form.active}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.checked })
                    }
                  />
                }
                label="Active account"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Approve & Edit User</DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Grid container spacing={2} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {selectedUser.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {selectedUser.email}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={selectedUser.role}
                    label="Role"
                    onChange={(e) =>
                      setSelectedUser({ ...selectedUser, role: e.target.value })
                    }
                  >
                    <MenuItem value="Admin">Admin</MenuItem>
                    <MenuItem value="Student">Student</MenuItem>
                    <MenuItem value="Teacher">Teacher</MenuItem>
                    <MenuItem value="Accountant">Accountant</MenuItem>
                    <MenuItem value="Supervisor">Supervisor</MenuItem>
                    <MenuItem value="Parent">Parent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedUser.status === "Active"}
                      onChange={(e) =>
                        setSelectedUser({
                          ...selectedUser,
                          status: e.target.checked ? "Active" : "Inactive",
                        })
                      }
                    />
                  }
                  label="Approved (Active)"
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Users;
