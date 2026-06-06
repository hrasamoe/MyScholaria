import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import AddIcon from "@mui/icons-material/Add";
import CampaignIcon from "@mui/icons-material/Campaign";
import DeleteIcon from "@mui/icons-material/Delete";
import EventIcon from "@mui/icons-material/Event";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

interface Ann {
  id: string;
  title: string;
  message: string;
  audience: string;
  target_user_ids?: (string | number)[];
  created_at: string;
  expires_at?: string | null;
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
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<
    Partial<Omit<Ann, "target_user_ids">> & {
      target_user_ids: (string | number)[];
    }
  >({
    audience: "all",
    target_user_ids: [],
    expires_at: "",
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announcement/get-list/${establishment_id}`,
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
    } finally {
      setLoading(false);
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
    if (form.audience === "all") return true;
    return (
      u.role?.toLowerCase() === form.audience?.toLowerCase().replace(/s$/, "")
    );
  });

  const handleAdd = async () => {
    const userID = user.id;
    if (!form.title || !form.message) {
      enqueueSnackbar("Title and body required", { variant: "error" });
      return;
    }
    if (form.audience !== "all" && form.target_user_ids.length === 0) {
      enqueueSnackbar("Please select at least one target user", {
        variant: "error",
      });
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announcement/create/${userID}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: form.title,
            content: form.message,
            audience: form.audience?.toLowerCase(),
            target_user_ids:
              form.audience !== "all" ? form.target_user_ids : [],
            expires_at: form.expires_at
              ? new Date(form.expires_at).toISOString()
              : null,
          }),
        },
      );
      if (response.ok) {
        const newAnnouncement = await response.json();
        setItems([newAnnouncement, ...items]);
        setForm({ audience: "all", target_user_ids: [], expires_at: "" });
        setOpen(false);
        enqueueSnackbar("Announcement published", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to publish announcement", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmation = (id: string) => {
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSelectedDeleteId(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/announcement/delete/${selectedDeleteId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (response.ok) {
        setItems(items.filter((item) => item.id !== selectedDeleteId));
        enqueueSnackbar("Announcement deleted successfully", {
          variant: "success",
        });
      } else {
        enqueueSnackbar("Failed to delete announcement", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete announcement", { variant: "error" });
    } finally {
      setLoading(false);
      closeDeleteConfirmation();
    }
  };

  const selectedUsers = filteredUsers.filter((u) =>
    form.target_user_ids.includes(u.id),
  );

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
        {loading ? (
          Array.from(new Array(4)).map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Card variant="outlined">
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={2}
                  >
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Stack>
                  <Skeleton variant="text" width="90%" height={16} />
                  <Skeleton variant="text" width="80%" height={16} />
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : items.length === 0 ? (
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
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {a.pinned && (
                        <Chip size="small" color="warning" label="Pinned" />
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => openDeleteConfirmation(a.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    {a.message}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    gap={1}
                  >
                    <Chip
                      size="small"
                      label={
                        a.audience.toUpperCase().charAt(0) + a.audience.slice(1)
                      }
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={new Date(a.created_at).toLocaleDateString()}
                    />
                    {a.expires_at && (
                      <Chip
                        icon={<EventIcon fontSize="small" />}
                        size="small"
                        color="error"
                        variant="outlined"
                        label={`Expires: ${new Date(a.expires_at).toLocaleDateString()}`}
                      />
                    )}
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
                value={form.message || ""}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </Grid>
            <Grid size={12}>
              <FormControl fullWidth>
                <InputLabel>Audience</InputLabel>
                <Select
                  value={form.audience || "all"}
                  label="Audience"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      audience: e.target.value,
                      target_user_ids: [],
                    })
                  }
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="student">Students</MenuItem>
                  <MenuItem value="teacher">Teachers</MenuItem>
                  <MenuItem value="parent">Parents</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {form.audience !== "all" && (
              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={filteredUsers}
                  value={selectedUsers}
                  getOptionLabel={(option) =>
                    `${option.name} (${option.email})`
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
                  onChange={(_, newValue) => {
                    setForm({
                      ...form,
                      target_user_ids: newValue.map((u) => u.id),
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Target Users *"
                      placeholder="Search users..."
                    />
                  )}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, index) => (
                      <Chip
                        label={option.name}
                        {...getTagProps({ index })}
                        color="success"
                        size="small"
                      />
                    ))
                  }
                />
              </Grid>
            )}
            <Grid size={12}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Expiration Date"
                value={form.expires_at || ""}
                onChange={(e) =>
                  setForm({ ...form, expires_at: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button disabled={loading} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={loading} variant="contained" onClick={handleAdd}>
            Publish
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteConfirmation}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this announcement? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button disabled={loading} onClick={closeDeleteConfirmation}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            variant="contained"
            color="error"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Announcements;
