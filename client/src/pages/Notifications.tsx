import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import AddIcon from "@mui/icons-material/Add";
import CampaignIcon from "@mui/icons-material/Campaign";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventIcon from "@mui/icons-material/Event";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

interface Notif {
  id: string;
  title: string;
  message: string;
  audience: string;
  target_user_ids?: (string | number)[];
  type: "info" | "success" | "warning" | "announcement";
  created_at: string;
  expires_at?: string | null;
  is_read: boolean;
}

interface TargetUser {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

const typeMeta: Record<Notif["type"], { color: any; icon: JSX.Element }> = {
  info: { color: "info.main", icon: <InfoIcon /> },
  success: { color: "success.main", icon: <CheckCircleIcon /> },
  warning: { color: "warning.main", icon: <WarningIcon /> },
  announcement: { color: "primary.main", icon: <CampaignIcon /> },
};

const Notifications = () => {
  const { user } = useAuth();
  const establishment_id = user?.establishment_id;
  const userID = user.id;
  const [items, setItems] = useState<Notif[]>([]);
  const [usersList, setUsersList] = useState<TargetUser[]>([]);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<string | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);
  const [form, setForm] = useState<
    Partial<Omit<Notif, "target_user_ids">> & {
      target_user_ids: (string | number)[];
    }
  >({
    type: "info",
    audience: "all",
    target_user_ids: [],
    expires_at: "",
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchNotifications = async () => {
    try {
      const response = await apiRequest(
        `/api/notification/get-list/${establishment_id}/${userID}`,
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
      enqueueSnackbar("Failed to fetch notifications", { variant: "error" });
    }
  };

  const fetchUsers = async () => {
    if (!establishment_id) return;
    try {
      const response = await apiRequest(
        `/api/establishment/${establishment_id}/all-users`,
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
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchNotifications(), fetchUsers()]);
      setLoading(false);
    };
    loadData();
  }, [establishment_id]);

  const filteredUsers = usersList.filter((u) => {
    if (form.audience === "all") return true;
    return (
      u.role?.toLowerCase() === form.audience?.toLowerCase().replace(/s$/, "")
    );
  });

  const filtered =
    tab === 0
      ? items
      : tab === 1
        ? items.filter((i) => !i.is_read)
        : items.filter((i) => i.is_read);
  const unread = items.filter((i) => !i.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      const response = await apiRequest(
        `/api/notification/mark-all-read/${userID}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      if (response.ok) {
        setItems(items.map((i) => ({ ...i, is_read: true })));
        enqueueSnackbar("All notifications marked as read", {
          variant: "success",
        });
      }
    } catch (error) {
      enqueueSnackbar("Failed to update notifications", { variant: "error" });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await apiRequest(
        `/api/notification/mark-read/${id}/${userID}`,
        {
          method: "PUT",
          credentials: "include",
        },
      );
      if (response.ok) {
        setItems(items.map((x) => (x.id === id ? { ...x, is_read: true } : x)));
      }
    } catch (error) {
      enqueueSnackbar("Failed to update notification", { variant: "error" });
    }
  };

  const openDeleteConfirmation = (id: string) => {
    setIsBulkDelete(false);
    setSelectedDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const openBulkDeleteConfirmation = () => {
    setIsBulkDelete(true);
    setDeleteDialogOpen(true);
  };

  const closeDeleteConfirmation = () => {
    setSelectedDeleteId(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (isBulkDelete) {
      try {
        const response = await apiRequest(
          `/api/notification/delete-all/${userID}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        if (response.ok) {
          setItems([]);
          enqueueSnackbar("All notifications deleted", { variant: "success" });
        }
      } catch (error) {
        enqueueSnackbar("Failed to delete notifications", { variant: "error" });
      } finally {
        closeDeleteConfirmation();
      }
      return;
    }

    if (!selectedDeleteId) return;
    try {
      const response = await apiRequest(
        `/api/notification/delete/${selectedDeleteId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (response.ok) {
        setItems(items.filter((x) => x.id !== selectedDeleteId));
        enqueueSnackbar("Notification deleted", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete notification", { variant: "error" });
    } finally {
      closeDeleteConfirmation();
    }
  };

  const send = async () => {
    if (!form.title || !form.message) {
      enqueueSnackbar("Title and message required", { variant: "error" });
      return;
    }
    if (form.audience !== "all" && form.target_user_ids.length === 0) {
      enqueueSnackbar("Please select at least one target user", {
        variant: "error",
      });
      return;
    }
    try {
      const response = await apiRequest(`/api/notification/create/${userID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          audience: form.audience,
          target_user_ids:
            form.audience !== "all" ? form.target_user_ids : null,
          type: form.type,
          expires_at: form.expires_at
            ? new Date(form.expires_at).toISOString()
            : null,
        }),
      });
      if (response.ok) {
        const newNotif = await response.json();
        setItems([newNotif, ...items]);
        setForm({
          type: "info",
          audience: "all",
          target_user_ids: [],
          expires_at: "",
        });
        setOpen(false);
        enqueueSnackbar("Notification sent", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar(error || "Failed to send notification", {
        variant: "error",
      });
    }
  };

  const selectedUsers = filteredUsers.filter((u) =>
    form.target_user_ids.includes(u.id),
  );

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={loading ? <Skeleton width={60} /> : `${unread} unread`}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
              disabled={loading || items.length === 0}
            >
              Mark all read
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={openBulkDeleteConfirmation}
              disabled={loading || items.length === 0}
            >
              Delete all
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
              disabled={loading}
            >
              Send
            </Button>
          </Stack>
        }
      />

      <Card>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab
            label={loading ? <Skeleton width={80} /> : `All (${items.length})`}
          />
          <Tab
            label={loading ? <Skeleton width={80} /> : `Unread (${unread})`}
          />
          <Tab label="Read" />
        </Tabs>
        <List disablePadding>
          {loading ? (
            Array.from(new Array(3)).map((_, index) => (
              <Box key={index}>
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Skeleton variant="text" width="30%" height={20} />
                        <Skeleton
                          variant="rectangular"
                          width={50}
                          height={20}
                        />
                      </Stack>
                    }
                    secondary={
                      <>
                        <Skeleton variant="text" width="70%" />
                        <Skeleton variant="text" width="20%" />
                      </>
                    }
                  />
                </ListItem>
                {index < 2 && <Divider />}
              </Box>
            ))
          ) : filtered.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Nothing here
              </Typography>
            </Box>
          ) : (
            filtered.map((n, i) => (
              <Box key={n.id}>
                <ListItem
                  sx={{
                    alignItems: "flex-start",
                    bgcolor: n.is_read ? "transparent" : "action.hover",
                    py: 1.5,
                    "& .MuiListItemSecondaryAction-root": {
                      top: "16px",
                      transform: "none",
                    },
                  }}
                  secondaryAction={
                    <Stack direction="row" spacing={0.5}>
                      {!n.is_read && (
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(n.id)}
                        >
                          <DoneAllIcon fontSize="small" />
                        </IconButton>
                      )}
                      <IconButton
                        size="small"
                        onClick={() => openDeleteConfirmation(n.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  }
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{ bgcolor: typeMeta[n.type]?.color || "info.main" }}
                    >
                      {typeMeta[n.type]?.icon || <InfoIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                          pr: 8,
                        }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={n.is_read ? 400 : 700}
                        >
                          {n.title}
                        </Typography>
                        <Chip
                          label={
                            n.audience.toUpperCase().charAt(0) +
                            n.audience.slice(1)
                          }
                          size="small"
                          variant="outlined"
                        />
                        {n.expires_at && (
                          <Chip
                            icon={<EventIcon fontSize="small" />}
                            label={`Expires: ${new Date(n.expires_at).toLocaleDateString()}`}
                            size="small"
                            color="error"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {n.message}
                        </Typography>
                        <Typography
                          component="span"
                          variant="caption"
                          display="block"
                          color="text.disabled"
                        >
                          {new Date(n.created_at).toLocaleString()}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                {i < filtered.length - 1 && <Divider />}
              </Box>
            ))
          )}
        </List>
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Send Notification</DialogTitle>
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
                label="Message *"
                value={form.message || ""}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={form.type || "info"}
                  label="Type"
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value as any })
                  }
                >
                  <MenuItem value="info">Info</MenuItem>
                  <MenuItem value="success">Success</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="announcement">Announcement</MenuItem>
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
                        color="primary"
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={send}>
            Send
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteConfirmation}>
        <DialogTitle>
          {isBulkDelete ? "Confirm Delete All" : "Confirm Delete"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isBulkDelete
              ? "Are you sure you want to delete all notifications? This action cannot be undone."
              : "Are you sure you want to delete this notification? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeDeleteConfirmation}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Notifications;
