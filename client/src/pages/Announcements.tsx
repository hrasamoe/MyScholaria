import PageHeader from "@/components/PageHeader";
import AddIcon from "@mui/icons-material/Add";
import CampaignIcon from "@mui/icons-material/Campaign";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  OutlinedInput,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/Authcontext";

interface Ann {
  id: string;
  title: string;
  content: string;
  audience: string;
  target_user_ids?: (string | number)[];
  created_at: string;
  pinned?: boolean;
}

interface TargetUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

const Announcements = () => {
  const { user } = useAuth();
  const establishment_id = user?.establishment_id;

  const [items, setItems] = useState<Ann[]>([]);
  const [usersList, setUsersList] = useState<TargetUser[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<
    Partial<Omit<Ann, "target_user_ids">> & {
      target_user_ids: (string | number)[];
    }
  >({
    audience: "All",
    target_user_ids: [],
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announcements`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        setItems(data || []);
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch announcements", { variant: "error" });
    }
  };

  const fetchUsers = async () => {
    if (!establishment_id) return;
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/establishment/${establishment_id}/all-users`,
        {
          method: "GET",
          credentials: "include",
        },
      );
      if (response.ok) {
        const data = await response.json();
        const mapped = (data as any[]).map((m) => ({
          id: m.user_id,
          name: m.name,
          email: m.email,
          role: m.role,
        }));
        setUsersList(mapped);
      }
    } catch (error) {
      enqueueSnackbar("Failed to fetch user list", { variant: "error" });
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchUsers();
  }, [establishment_id]);

  const filteredUsers = usersList.filter((u) => {
    if (form.audience === "All") return true;
    return (
      u.role?.toLowerCase() === form.audience?.toLowerCase().replace(/s$/, "")
    );
  });

  const handleUserChange = (event: any) => {
    const {
      target: { value },
    } = event;
    setForm({
      ...form,
      target_user_ids: typeof value === "string" ? value.split(",") : value,
    });
  };

  const handleRemoveUser = (idToRemove: string | number) => {
    setForm({
      ...form,
      target_user_ids: form.target_user_ids.filter((id) => id !== idToRemove),
    });
  };

  const handleAdd = async () => {
    if (!form.title || !form.content) {
      enqueueSnackbar("Title and body required", { variant: "error" });
      return;
    }
    if (form.audience !== "All" && form.target_user_ids.length === 0) {
      enqueueSnackbar("Please select at least one target user", {
        variant: "error",
      });
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announcements`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: form.title,
            content: form.content,
            audience: form.audience,
            target_user_ids:
              form.audience !== "All" ? form.target_user_ids : null,
          }),
        },
      );
      if (response.ok) {
        const newAnnouncement = await response.json();
        setItems([newAnnouncement, ...items]);
        setForm({ audience: "All", target_user_ids: [] });
        setOpen(false);
        enqueueSnackbar("Announcement published", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to publish announcement", { variant: "error" });
    }
  };

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="School-wide bulletin board"
        action={
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
          >
            New Announcement
          </Button>
        }
      />

      <Grid container spacing={2}>
        {items.length === 0 ? (
          <Grid size={12}>
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                No announcements available
              </Typography>
            </Box>
          </Grid>
        ) : (
          items.map((a) => (
            <Grid size={{ xs: 12, md: 6 }} key={a.id}>
              <Card variant="outlined">
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={1}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CampaignIcon color="primary" fontSize="small" />
                      <Typography variant="subtitle1" fontWeight={700}>
                        {a.title}
                      </Typography>
                    </Stack>
                    {a.pinned && (
                      <Chip size="small" color="warning" label="Pinned" />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    {a.content}
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label={a.audience} />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={new Date(a.created_at).toLocaleDateString()}
                    />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Announcement</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                label="Title *"
                value={form.title || ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Body *"
                value={form.content || ""}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Audience</InputLabel>
                <Select
                  value={form.audience || "All"}
                  label="Audience"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      audience: e.target.value,
                      target_user_ids: [],
                    })
                  }
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Students">Students</MenuItem>
                  <MenuItem value="Teachers">Teachers</MenuItem>
                  <MenuItem value="Parents">Parents</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
                  <MenuItem value="Admins">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {form.audience !== "All" && (
              <Grid size={12}>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}
                >
                  {form.target_user_ids.map((id) => {
                    const u = usersList.find((user) => user.id === id);
                    return (
                      <Chip
                        key={id}
                        label={u ? u.name : id}
                        onDelete={() => handleRemoveUser(id)}
                        color="success"
                        size="small"
                      />
                    );
                  })}
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Target Users *</InputLabel>
                  <Select
                    multiple
                    value={form.target_user_ids}
                    onChange={handleUserChange}
                    input={<OutlinedInput label="Target Users *" />}
                    renderValue={() => null}
                  >
                    {filteredUsers.map((u) => (
                      <MenuItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>
            Publish
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Announcements;
