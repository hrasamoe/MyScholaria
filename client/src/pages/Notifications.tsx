import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import {
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Divider,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CampaignIcon from "@mui/icons-material/Campaign";
import { useSnackbar } from "notistack";

interface Notif {
  id: string;
  title: string;
  message: string;
  audience: string;
  type: "info" | "success" | "warning" | "announcement";
  created_at: string;
  is_read: boolean;
}

const typeMeta: Record<Notif["type"], { color: any; icon: JSX.Element }> = {
  info: { color: "info.main", icon: <InfoIcon /> },
  success: { color: "success.main", icon: <CheckCircleIcon /> },
  warning: { color: "warning.main", icon: <WarningIcon /> },
  announcement: { color: "primary.main", icon: <CampaignIcon /> },
};

const Notifications = () => {
  const [items, setItems] = useState<Notif[]>([]);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Notif>>({
    type: "info",
    audience: "All",
  });
  const { enqueueSnackbar } = useSnackbar();

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
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

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filtered =
    tab === 0
      ? items
      : tab === 1
        ? items.filter((i) => !i.is_read)
        : items.filter((i) => i.is_read);
  const unread = items.filter((i) => !i.is_read).length;

  const handleMarkAllRead = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-all-read`,
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/mark-read/${id}`,
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

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (response.ok) {
        setItems(items.filter((x) => x.id !== id));
        enqueueSnackbar("Notification deleted", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to delete notification", { variant: "error" });
    }
  };

  const send = async () => {
    if (!form.title || !form.message) {
      enqueueSnackbar("Title and message required", { variant: "error" });
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/notifications`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: form.title,
            message: form.message,
            audience: form.audience,
            type: form.type,
          }),
        },
      );
      if (response.ok) {
        const newNotif = await response.json();
        setItems([newNotif, ...items]);
        setForm({ type: "info", audience: "All" });
        setOpen(false);
        enqueueSnackbar("Notification sent", { variant: "success" });
      }
    } catch (error) {
      enqueueSnackbar("Failed to send notification", { variant: "error" });
    }
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle={`${unread} unread`}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<DoneAllIcon />}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpen(true)}
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
          <Tab label={`All (${items.length})`} />
          <Tab label={`Unread (${unread})`} />
          <Tab label="Read" />
        </Tabs>
        <List disablePadding>
          {filtered.length === 0 ? (
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
                    bgcolor: n.is_read ? "transparent" : "action.hover",
                    py: 1.5,
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
                        onClick={() => handleDelete(n.id)}
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
                          label={n.audience}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
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
                  value={form.audience || "All"}
                  label="Audience"
                  onChange={(e) =>
                    setForm({ ...form, audience: e.target.value })
                  }
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Students">Students</MenuItem>
                  <MenuItem value="Teachers">Teachers</MenuItem>
                  <MenuItem value="Parents">Parents</MenuItem>
                  <MenuItem value="Staff">Staff</MenuItem>
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
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={send}>
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Notifications;
