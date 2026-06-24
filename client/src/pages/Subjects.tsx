import PageHeader from "@/components/PageHeader";
import { TeacherSubject } from "@/data/type";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BookIcon from "@mui/icons-material/Book";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
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
  Skeleton,
  TextField,
  Typography,
  useTheme,
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
  id: string;
  class_id: string;
  class_name: string;
  code: string;
  coefficient: number;
  hours: number;
  teacher_id: string | null;
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

interface TeacherOption {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  contractType: string;
  subject: string;
  pid: string;
}

const Subjects = () => {
  const [items, setItems] = useState<GroupedSubject[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const [openEdit, setOpenEdit] = useState(false);
  const [openAssignTeacher, setOpenAssignTeacher] = useState(false);
  const [selectedSubjectClass, setSelectedSubjectClass] =
    useState<SubjectClassDetails | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<GroupedSubject | null>(
    null,
  );
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherOption | null>(
    null,
  );
  const [editingRow, setEditingRow] = useState<{
    subjectID: string;
    classID: string;
  } | null>(null);
  const [form, setForm] = useState<{
    name?: string;
    level?: string;
    code?: string;
    coefficient?: number;
    hours?: number;
  }>({});
  const [editForm, setEditForm] = useState<{
    name: string;
    level: string;
    code: string;
    coefficient: number;
    hours: number;
  }>({ name: "", level: "", code: "", coefficient: 1, hours: 1 });
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

  const handleOpenEdit = (
    subject: GroupedSubject,
    cls: SubjectClassDetails,
  ) => {
    setEditingRow({ subjectID: cls.id, classID: cls.class_id });
    setEditForm({
      name: subject.name,
      level: cls.class_id,
      code: cls.code,
      coefficient: cls.coefficient,
      hours: cls.hours,
    });
    setOpenEdit(true);
  };

  const handleOpenAssignTeacher = (
    cls: SubjectClassDetails,
    subject: GroupedSubject,
  ) => {
    setSelectedSubjectClass(cls);
    setSelectedSubject(subject);
    const existingTeacher =
      teachers.find((t) => t.id === cls.teacher_id) || null;
    setSelectedTeacher(existingTeacher);
    setOpenAssignTeacher(true);
  };

  const handleAssignTeacher = async () => {
    if (!selectedTeacher || !selectedSubjectClass) {
      enqueueSnackbar("Please select a teacher", { variant: "error" });
      return;
    }

    setOperationLoading(true);
    try {
      const response = await apiRequest("/api/subject/assign-teacher", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subjectClassId: selectedSubjectClass.id,
          teacherId: selectedTeacher.pid,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorMessage = await response.json().catch(() => ({}));
        throw new Error(errorMessage.message || "Failed to assign teacher");
      } else {
        enqueueSnackbar("Teacher assigned successfully", {
          variant: "success",
        });
        await getSubjectList();
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Error assigning teacher";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setOpenAssignTeacher(false);
      setSelectedSubjectClass(null);
      setOperationLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editForm.code || !editForm.name || !editForm.level || !editingRow) {
      enqueueSnackbar("All fields required", { variant: "error" });
      return;
    }

    setOperationLoading(true);
    try {
      const response = await apiRequest(
        `/api/subject/edit/${editingRow.subjectID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editForm),
          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorMessage = await response.json().catch(() => ({}));
        throw new Error(errorMessage.message || "Failed to update the subject");
      } else {
        enqueueSnackbar("Subject updated successfully", { variant: "success" });
        await getSubjectList();
      }
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "Error updating subject";
      enqueueSnackbar(msg, { variant: "error" });
    } finally {
      setOpenEdit(false);
      setEditingRow(null);
      setOperationLoading(false);
    }
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
        .map((subject) => ({
          ...subject,
          classes: subject.classes.filter((cls) => cls.id !== subjectID),
        }))
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
        delete timeoutsRef.current[subjectID];
      } catch (error: any) {
        setItems(previousState);
        enqueueSnackbar(
          error.message || "Error deleting subject-class relation",
          { variant: "error" },
        );
      }
    };

    const timeoutID = setTimeout(executeDelete, 5000);
    timeoutsRef.current[subjectID] = timeoutID;

    enqueueSnackbar(`Removing ${subjectName} from ${className}`, {
      autoHideDuration: 5000,
      variant: "warning",
      action: () => (
        <Button
          color="inherit"
          onClick={() => {
            clearTimeout(timeoutsRef.current[subjectID]);
            delete timeoutsRef.current[subjectID];
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

    setOperationLoading(true);
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
      setOperationLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [classesRes, teachersRes, subjectsRes] = await Promise.all([
          apiRequest(`/api/establishment/classes-list`, {
            credentials: "include",
          }),
          apiRequest(`/api/teachers/get-list`, { credentials: "include" }),
          apiRequest("/api/subject/list", {
            method: "GET",
            credentials: "include",
          }),
        ]);

        if (classesRes.ok) {
          const data = await classesRes.json();
          setClasses(data);
        } else {
          enqueueSnackbar("Failed to load classes", { variant: "error" });
        }

        if (teachersRes.ok) {
          const data = await teachersRes.json();
          setTeachers(data);
        } else {
          enqueueSnackbar("Failed to load teachers", { variant: "error" });
        }

        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          setItems(data);
        } else {
          enqueueSnackbar("Failed to load subjects", { variant: "error" });
        }
      } catch (error) {
        enqueueSnackbar("Error loading data from API", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    if (establishmentID) {
      fetchData();
    }
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

  const currentClassOption =
    classes.find((cls) => cls.id === form.level) || null;
  const currentEditClassOption =
    classes.find((cls) => cls.id === editForm.level) || null;

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
                    background: theme.palette.background.paper,
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
                        alignItems: "flex-start",
                        flexDirection: "column",
                        width: "100%",
                        gap: 1,
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
                        sx={{ fontWeight: "600" }}
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
                      {item.classes.map((cls) => {
                        const assignedTeacher = teachers.find(
                          (t) => t.id === cls.teacher_id,
                        );
                        return (
                          <Box
                            key={cls.id}
                            sx={{
                              position: "relative",
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
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  fontWeight="600"
                                  color="primary.main"
                                >
                                  {cls.class_name}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleOpenAssignTeacher(cls, item)
                                  }
                                >
                                  <AssignmentIndIcon
                                    fontSize="small"
                                    color={
                                      cls.teacher_id ? "success" : "inherit"
                                    }
                                  />
                                </IconButton>
                              </Box>

                              <Chip
                                size="small"
                                label={cls.code}
                                variant="outlined"
                              />
                            </Box>

                            {assignedTeacher && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mb: 1,
                                  color: "success.main",
                                }}
                              >
                                <PersonIcon sx={{ fontSize: "1rem" }} />
                                <Typography variant="caption" fontWeight="500">
                                  {assignedTeacher.first_name}{" "}
                                  {assignedTeacher.last_name}
                                </Typography>
                              </Box>
                            )}

                            <Box
                              sx={{
                                display: "flex",
                                gap: 2,
                                color: "text.secondary",
                                alignItems: "center",
                                mb: assignedTeacher ? 1.5 : 0,
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
                            </Box>
                            <Box
                              sx={{
                                display: "flex",
                                position: "absolute",
                                bottom: "3px",
                                right: "0px",
                              }}
                            >
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(item, cls)}
                              >
                                <EditIcon fontSize="inherit" color="primary" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleDeleteClassRelation(
                                    cls.class_id,
                                    cls.class_name,
                                    item.name,
                                    cls.id,
                                  )
                                }
                              >
                                <DeleteIcon fontSize="inherit" color="error" />
                              </IconButton>
                            </Box>
                          </Box>
                        );
                      })}
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
              <Autocomplete
                options={classes}
                getOptionLabel={(option) =>
                  `${option.name} ${option.level ? `(${option.level})` : ""}`
                }
                value={currentClassOption}
                onChange={(_, newValue) =>
                  setForm({ ...form, level: newValue?.id || "" })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Class / Level *" fullWidth />
                )}
              />
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
                onChange={(e) =>
                  setForm({ ...form, coefficient: Number(e.target.value) })
                }
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
                onChange={(e) =>
                  setForm({ ...form, hours: Number(e.target.value) })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={operationLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={operationLoading}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Subject Assignment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Code *"
                value={editForm.code}
                onChange={(e) =>
                  setEditForm({ ...editForm, code: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                freeSolo
                options={SUBJECT_OPTIONS}
                value={editForm.name}
                onChange={(_, newValue) =>
                  setEditForm({ ...editForm, name: newValue || "" })
                }
                onInputChange={(_, newInputValue) =>
                  setEditForm({ ...editForm, name: newInputValue })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Name *" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={classes}
                getOptionLabel={(option) =>
                  `${option.name} ${option.level ? `(${option.level})` : ""}`
                }
                value={currentEditClassOption}
                onChange={(_, newValue) =>
                  setEditForm({ ...editForm, level: newValue?.id || "" })
                }
                renderInput={(params) => (
                  <TextField {...params} label="Class / Level *" fullWidth />
                )}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Coefficient"
                value={editForm.coefficient}
                slotProps={{
                  htmlInput: { min: 1, max: 10, step: 1 },
                }}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    coefficient: Number(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField
                fullWidth
                type="number"
                label="Hours/week"
                value={editForm.hours}
                slotProps={{
                  htmlInput: { min: 1, max: 40, step: 1 },
                }}
                onChange={(e) =>
                  setEditForm({ ...editForm, hours: Number(e.target.value) })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            disabled={operationLoading}
            onClick={() => setOpenEdit(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdate}
            disabled={operationLoading}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openAssignTeacher}
        onClose={() => setOpenAssignTeacher(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Teacher to {selectedSubject?.name} for class{" "}
          {selectedSubjectClass?.class_name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1.5 }}>
            <Autocomplete
              options={teachers}
              getOptionLabel={(option) =>
                `${option.first_name} ${option.last_name} ${option.subject ? `(${option.subject})` : ""}`
              }
              value={selectedTeacher}
              onChange={(_, newValue) => setSelectedTeacher(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="Select Teacher *" fullWidth />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            disabled={operationLoading}
            onClick={() => setOpenAssignTeacher(false)}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleAssignTeacher}
            disabled={operationLoading}
          >
            Assign
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Subjects;
