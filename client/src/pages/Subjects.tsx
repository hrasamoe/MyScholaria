import PageHeader from "@/components/PageHeader";
import { TeacherSubject } from "@/data/type";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import BookIcon from "@mui/icons-material/Book";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import StarBorderIcon from "@mui/icons-material/StarBorder";
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
  DialogTitle,
  Divider,
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

const SUBJECT_OPTIONS: TeacherSubject[] = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Malagasy",
  "English",
  "Philosophy",
  "French",
  "History & Geography",
  "Computer Science",
  "Physical Education",
  "Art & Music",
  "Civic Education",
  "Economics & Social Sciences",
  "Arithmetic & Pre-Algebra",
  "Algebra",
  "Geometry & Topology",
  "Trigonometry",
  "Calculus & Mathematical Analysis",
  "Probability & Statistics",
  "Earth & Space Sciences",
  "Environmental Science & Ecology",
  "Modern Foreign Languages",
  "Classical & Ancient Languages",
  "Linguistics & Philology",
  "Creative Writing & Composition",
  "World History",
  "Physical Geography",
  "Human & Economic Geography",
  "Economics",
  "Sociology",
  "Anthropology",
  "Political Science",
  "Psychology",
  "Information & Communication Technology",
  "Robotics & Automation",
  "Engineering & Technology",
  "Web Design & Digital Media",
  "Visual Arts",
  "Performing Arts",
  "Design & Technology",
  "Media Studies & Journalism",
  "Accounting & Financial Management",
  "Business Studies & Entrepreneurship",
  "Marketing & Commerce",
  "Legal Studies",
  "Home Economics & Culinary Arts",
  "Vocational Technical Trades",
  "Health & Nutrition Education",
  "First Aid & Safety Education",
];

interface SubjectClassDetails {
  class_id: string;
  class_name: string;
  code: string;
  coefficient: number;
  hours: number;
}

interface GroupedSubject {
  id: string;
  name: string;
  classes: SubjectClassDetails[];
}

interface ClassOption {
  id: string;
  name: string;
  level: string | null;
}

const Subjects = () => {
  const [items, setItems] = useState<GroupedSubject[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{
    name?: string;
    level?: string;
    code?: string;
    coefficient?: number;
    hours?: number;
  }>({});
  const { enqueueSnackbar } = useSnackbar();
  const { user } = useAuth();
  const establishmentID = user.establishment_id;
  const timeoutsRef = useRef<{ [key: string]: ReturnType<typeof setTimeout> }>(
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
    setForm({
      coefficient: 1,
      hours: 1,
    });
    setOpen(true);
  };

const handleDeleteClassRelation = async (
  classId: string,
  className: string,
  subjectName: string,
  subjectID: string,
) => {
  const previousState = [...items];

  setItems((prev) =>
    prev
      .map((subject) => subject.id === subjectID ? {
        ...subject,
        classes: subject.classes.filter((cls) => cls.class_id !== classId),
      } : subject)
      .filter((subject) => subject.classes.length > 0),
  );

  const executeDelete = async () => {
    try {
      const response = await apiRequest(
        `/api/subject/delete/${classId}/${subjectID}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (!response.ok) {
        const errorMessage = await response.json().catch(() => ({}));
        throw new Error(errorMessage.message || "Failed to delete row");
      }
      delete timeoutsRef.current[classId];
    } catch (error: any) {
      setItems(previousState);
    
      enqueueSnackbar(
        error.message || "Error deleting subject-class relation",
        { variant: "error" },
      );
    }
  };

  const timeoutID = setTimeout(executeDelete, 5000);
  timeoutsRef.current[classId] = timeoutID;

  enqueueSnackbar(`Removing ${subjectName} from ${className}`, {
    autoHideDuration: 5000,
    variant: "warning",
    action: () => (
      <Button
        color="inherit"
        onClick={() => {
          clearTimeout(timeoutsRef.current[classId]);
          delete timeoutsRef.current[classId];
          setItems(previousState);
          enqueueSnackbar("Deletion canceled", { variant: "success" });
        }}
      >
        Cancel
      </Button>
    ),
  });
};

  const handleSave = async () => {
    if (!form.code || !form.name || !form.level) {
      enqueueSnackbar("Code, name and class required", { variant: "error" });
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
        throw new Error(errorMessage.message || "Failed to create the subject");
      } else {
        enqueueSnackbar("Subject assignment added", { variant: "success" });
        await getSubjectList();
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Error creating subject";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setOpen(false);
      setForm({});
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
      item.classes.some(
        (c) =>
          c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.class_name.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
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
          placeholder="Search subjects by name, code or class..."
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
                      </Box>
                    </Box>
                    <Skeleton variant="text" width="80%" height={20} />
                    <Skeleton variant="text" width="50%" height={20} />
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
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      flexGrow: 1,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyValue: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          minWidth: 0,
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
                        <Typography variant="h6" fontWeight="600" noWrap>
                          {item.name}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={`${item.classes.length} classes`}
                        color="primary"
                        sx={{ ml: "auto", fontWeight: "600" }}
                      />
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: "#2a2f3d" }} />

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.5,
                        maxHeight: "220px",
                        overflowY: "auto",
                        pr: 0.5,
                        "::-webkit-scrollbar": { width: "7px" },
                        "::-webkit-scrollbar-thumb": {
                          bgcolor: "rgba(255,255,255,0.1)",
                          borderRadius: "4px",
                        },
                      }}
                    >
                      {item.classes.map((cls) => (
                        <Box
                          key={cls.class_id}
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: "background.neutral",
                            border: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight="600"
                              color="primary.main"
                            >
                              {cls.class_name}
                            </Typography>
                            <Chip
                              size="small"
                              label={cls.code}
                              variant="outlined"
                              color="secondary"
                            />
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                              color: "text.secondary",
                              alignItems: "center",
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <StarBorderIcon fontSize="inherit" />
                              <Typography variant="caption">
                                Coef: <strong>{cls.coefficient}</strong>
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <AccessTimeIcon fontSize="inherit" />
                              <Typography variant="caption">
                                Hours: <strong>{cls.hours}h</strong>
                              </Typography>
                            </Box>
                            <Box sx={{ ml: "auto" }}>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteClassRelation(
                                    cls.class_id,
                                    cls.class_name,
                                    item.name,
                                    item.id
                                  )
                                }
                              >
                                <DeleteIcon fontSize="inherit" color="error" />
                              </IconButton>
                            </Box>
                          </Box>
                        </Box>
                      ))}
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
        <DialogTitle>Add Subject</DialogTitle>
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
              <Autocomplete
                freeSolo
                options={SUBJECT_OPTIONS}
                value={form.name || ""}
                onChange={(_, newValue) =>
                  setForm({ ...form, name: newValue || "" })
                }
                onInputChange={(_, newInputValue) =>
                  setForm({ ...form, name: newInputValue })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Name *" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Class / Level *"
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
                  htmlInput: { min: 1, max: 10, step: 1 },
                }}
                onChange={(e) => {
                  const val = Math.min(
                    40,
                    Math.max(1, parseInt(e.target.value) || 0),
                  );
                  setForm({ ...form, coefficient: Number(e.target.value) });
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
                  htmlInput: { min: 1, max: 40, step: 1 },
                }}
                onChange={(e) => {
                  const val = Math.min(
                    40,
                    Math.max(1, parseInt(e.target.value) || 0),
                  );
                  setForm({ ...form, hours: Number(e.target.value) });
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
