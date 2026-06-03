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
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

interface Ann {
  id: string;
  title: string;
  content: string;
  audience: string;
  created_at: string;
  pinned?: boolean;
}

const Announcements = () => {
  const [items, setItems] = useState<Ann[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Ann>>({ audience: "All" });
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

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAdd = async () => {
    if (!form.title || !form.content) {
      enqueueSnackbar("Title and body required", { variant: "error" });
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
          }),
        },
      );
      if (response.ok) {
        const newAnnouncement = await response.json();
        setItems([newAnnouncement, ...items]);
        setForm({ audience: "All" });
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
