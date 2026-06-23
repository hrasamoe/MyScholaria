import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import BookIcon from "@mui/icons-material/Book";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import StarBorderIcon from "@mui/icons-material/StarBorder";
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
  IconButton,
  InputAdornment,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useRef, useState } from "react";

interface Subject {
  id: string;
  code: string;
  name: string;
  level: string;
  coefficient: number;
  hours: number;
}

interface ClassOption {
  id: string;
  name: string;
  level: string | null;
}

const Subjects = () => {
  const [items, setItems] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [form, setForm] = useState<Partial<Subject>>({});
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const establishmentID = user.establishment_id;
  const timeoutRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>(
    {},
  );

  const getSubjectList = async () => {
    try {
      const response = await apiRequest("/api/subject/list", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        const errorMessage = await response.json().catch(() => ({}));
        throw new Error(
          errorMessage.message || "Failed to fetch the subject list",
        );
      } else {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Error fetching subject list";
      enqueueSnackbar(msg, { variant: "error" });
    }
  };

  const handleOpenCreate = () => {
    setSelectedSubject(null);
    setForm({});
    setOpen(true);
  };

  const handleOpenEdit = (subject: Subject) => {
    setSelectedSubject(subject);
    setForm(subject);
    setOpen(true);
  };

  const handleDelete = (subjectToDelete: Subject) => {
    const previousSubject = [...items];
    setItems((prev) => prev.filter((item) => item.id !== subjectToDelete.id));
    const executeDelete = async () => {
      try {
        const response = await apiRequest(
          `/api/subject/delete/${subjectToDelete.id}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );
        if (!response.ok) {
          const errorMessage = await response.json().catch(() => ({}));
          throw new Error(
            errorMessage.message || "Failed to delete the subject",
          );
        }
        delete timeoutRef.current[subjectToDelete.id];
      } catch (error: any) {
        setItems(previousSubject);
        enqueueSnackbar(error.message || "Error deleting  subject", {
          variant: "error",
        });
      }
    };
    const timeoutID = setTimeout(executeDelete, 5000);
    timeoutRef.current[subjectToDelete.id] = timeoutID;
    enqueueSnackbar(`Deleting subject: ${subjectToDelete.name} `, {
      autoHideDuration: 5000,
      variant: "warning",
      action: (key) => (
        <Button
          color="inherit"
          onClick={() => {
            clearTimeout(timeoutRef.current[subjectToDelete.id]);
            delete timeoutRef.current[subjectToDelete.id];
            setItems(previousSubject);
            enqueueSnackbar(`Deletion of ${subjectToDelete.name} canceled`, {
              variant: "success",
            });
          }}
        >
          Cancel
        </Button>
      ),
    });
  };

  const handleSave = async () => {
    if (!form.code || !form.name) {
      enqueueSnackbar("Code and name required", { variant: "error" });
      return;
    }
    if (form.code.length < 3) {
      enqueueSnackbar("Subject code must be at least 3 characters", {
        variant: "warning",
      });
      return;
    }
    if (form.name.length < 3) {
      enqueueSnackbar("Subject name must be at least 3 characters", {
        variant: "warning",
      });
      return;
    }
    if (!form.level) {
      enqueueSnackbar("We must provide the class for new subject", {
        variant: "warning",
      });
      return;
    }

    if (selectedSubject) {
      setItems(
        items.map((item) =>
          item.id === selectedSubject.id ? (form as Subject) : item,
        ),
      );
      enqueueSnackbar("Subject updated", { variant: "success" });
      setOpen(false);
    } else {
      try {
        const response = await apiRequest("/api/subject/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
          credentials: "include",
        });

        if (!response.ok) {
          const errorMessage = await response.json().catch(() => ({}));
          throw new Error(
            errorMessage.message || "Failed to create the subject",
          );
        } else {
          const createdSubject = await response.json();
          setItems([...items, createdSubject]);
          enqueueSnackbar("Subject added", { variant: "success" });
        }
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "Error creating subject";
        enqueueSnackbar(msg, { variant: "error" });
      } finally {
        setOpen(false);
        setForm({});
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await apiRequest(`/api/establishment/classes-list`, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setClasses(data);
        }
      } catch (error) {
        enqueueSnackbar("Error loading classes from API", { variant: "error" });
      }
      await getSubjectList();
      setLoading(false);
    };
    fetchData();
  }, [establishmentID]);

  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <>
      <PageHeader
        title="Subjects and Syllabus"
        subtitle={
          loading ? "Loading subjects..." : `${items.length} subjects defined`
        }
        action={
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={loading}
          >
            Add Subject
          </Button>
        }
      />

      <Box sx={{ mt: 3, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search subjects by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: { xs: "100%" },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      </Box>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {loading
          ? Array.from(new Array(6)).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Card
                  variant="outlined"
                  sx={{ borderRadius: 2, border: "1px solid #2a2f3d" }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Skeleton variant="rounded" width={50} height={50} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="60%" height={24} />
                        <Skeleton variant="text" width="40%" height={20} />
                      </Box>
                      <Skeleton variant="rounded" width={60} height={24} />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Skeleton variant="text" width="50%" />
                      <Skeleton variant="text" width="40%" />
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      <Skeleton variant="circular" width={28} height={28} />
                      <Skeleton variant="circular" width={28} height={28} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          : filteredItems.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    border: "1px solid #2a2f3d",
                    position: "relative",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1,
                          bgcolor: "primary.shades",
                          color: "primary.main",
                          display: "flex",
                        }}
                      >
                        <BookIcon sx={{ height: "34px", width: "34px" }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="600" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Class:{" "}
                          {classes.find((cls) => cls.id === item.level)?.name ||
                            "N/A"}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={item.code}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "text.secondary",
                        }}
                      >
                        <StarBorderIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Coefficient: <strong>{item.coefficient}</strong>
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          color: "text.secondary",
                        }}
                      >
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Hours / week: <strong>{item.hours}h</strong>
                        </Typography>
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        mt: 2,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEdit(item)}
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item)}
                      >
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedSubject ? "Edit Subject" : "Add Subject"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Code *"
                value={form.code || ""}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Name *"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Class / Level"
                value={form.level || ""}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                <MenuItem value="" disabled>
                  <em>Select a class</em>
                </MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>
                    {cls.name} {cls.level ? `(${cls.level})` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Coefficient"
                value={form.coefficient || ""}
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: 10,
                    step: 1,
                  },
                }}
                onChange={(e) => {
                  const val = Math.min(
                    10,
                    Math.max(1, parseInt(e.target.value) || 1),
                  );
                  setForm({ ...form, coefficient: val });
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Hours/week"
                value={form.hours || ""}
                slotProps={{
                  htmlInput: {
                    min: 1,
                    max: 40,
                    step: 1,
                  },
                }}
                onChange={(e) => {
                  const val = Math.min(
                    40,
                    Math.max(1, parseInt(e.target.value) || 1),
                  );
                  setForm({ ...form, hours: val });
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Subjects;
