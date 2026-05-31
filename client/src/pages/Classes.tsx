import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import AddIcon from "@mui/icons-material/Add";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import PersonIcon from "@mui/icons-material/Person";
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";

interface ClassItem {
  id: string;
  name: string;
  level: string;
  teacher_id: string;
  teacher_name?: string;
  teacher_gender?: "male" | "female";
  classroom_id: string;
  classroom_name?: string;
  students?: number;
  academic_year: string;
}

interface ClassroomOption {
  id: string;
  name: string;
  building: string;
}

interface TeacherOption {
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
}

const API_URL = import.meta.env.VITE_API_URL;

const initialFakeClasses: ClassItem[] = [
  {
    id: "fake-1",
    name: "Terminale S1",
    level: "Lycée",
    teacher_id: "",
    teacher_name: "Mme Rasoa R.",
    teacher_gender: "female",
    classroom_id: "",
    classroom_name: "Salle 102 (Bâtiment A)",
    students: 35,
    academic_year: "2025-2026",
  },
  {
    id: "fake-2",
    name: "Seconde G2",
    level: "Lycée",
    teacher_id: "",
    teacher_name: "Mr Rakoto J.",
    teacher_gender: "male",
    classroom_id: "",
    classroom_name: "Labo Physique",
    students: 30,
    academic_year: "2025-2026",
  },
];

const Classes = () => {
  const { user } = useAuth();
  const establishmentID = user?.establishment_id || "";
  const { enqueueSnackbar } = useSnackbar();

  const [classes, setClasses] = useState<ClassItem[]>(initialFakeClasses);
  const [classrooms, setClassrooms] = useState<ClassroomOption[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});

  const formatFirstName = (firstName: string) => {
    if (!firstName) return "";
    const parts = firstName.trim().split(/\s+/);
    if (parts.length <= 1) return parts[0];
    const initiales = parts
      .slice(1)
      .map((part) => `${part[0].toUpperCase()}.`)
      .join(" ");
    return `${parts[0]} ${initiales}`;
  };

  const formatTeacherName = (
    teacher: TeacherOption | { first_name: string; last_name: string },
  ) => {
    return `${formatFirstName(teacher.first_name)} ${teacher.last_name}`;
  };

  const fetchAllData = async () => {
    if (!establishmentID) return;
    try {
      setLoading(true);
      const [resClasses, resClassrooms, resTeachers] = await Promise.all([
        fetch(`${API_URL}/utils/classes`, { credentials: "include" }),
        fetch(`${API_URL}/api/utils/get-classrooms/${establishmentID}`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/teachers/get-list/${establishmentID}`, {
          credentials: "include",
        }),
      ]);

      if (resClasses.ok) {
        const classesData = await resClasses.json();
        setClasses(classesData.length > 0 ? classesData : initialFakeClasses);
      }

      if (resClassrooms.ok) {
        const classroomsData = await resClassrooms.json();
        setClassrooms(classroomsData);
      }

      if (resTeachers.ok) {
        const teachersData = await resTeachers.json();
        setTeachers(teachersData);
      }
    } catch (error) {
      enqueueSnackbar("Error loading data from API", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [establishmentID]);

  const handleOpenCreate = () => {
    setSelectedClass(null);
    setForm({
      name: "",
      level: "",
      teacher_id: "",
      schedule: "",
      classroom_id: "",
      academic_year: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (item: ClassItem) => {
    setSelectedClass(item);
    setForm({
      name: item.name,
      level: item.level,
      teacher_id: item.teacher_id,
      classroom_id: item.classroom_id,
      academic_year: item.academic_year || "",
    });
    setOpen(true);
  };

  const handleOpenDelete = (item: ClassItem) => {
    setSelectedClass(item);
    setOpenDelete(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.level || !form.academic_year) {
      enqueueSnackbar("Please fill required fields", { variant: "error" });
      return;
    }

    const payload = {
      name: form.name,
      level: form.level,
      teacher_id: form.teacher_id || "",
      schedule: form.schedule || "",
      classroom_id: form.classroom_id || "",
      academic_year: form.academic_year,
    };

    try {
      setActionLoading(true);
      const url = selectedClass
        ? `${API_URL}/establishment/classes/${selectedClass.id}`
        : `${API_URL}/establishment/classes/${establishmentID}`;

      const method = selectedClass ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "An error occurred");

      enqueueSnackbar(
        selectedClass
          ? "Class updated successfully"
          : "Class added successfully",
        { variant: "success" },
      );
      setOpen(false);
      fetchAllData();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error saving class", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    try {
      setActionLoading(true);
      const response = await fetch(
        `${API_URL}/establishment/classes/${selectedClass.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) throw new Error("Deletion failed");

      enqueueSnackbar("Class deleted successfully", { variant: "success" });
      setOpenDelete(false);
      fetchAllData();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error deleting class", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getTeacherGender = (item: ClassItem) => {
    if (item.teacher_gender) return item.teacher_gender;
    const found = teachers.find((t) => t.id === item.teacher_id);
    return found ? found.gender : "male";
  };

  const getTeacherDisplayName = (item: ClassItem) => {
    if (item.teacher_name) return item.teacher_name;
    const found = teachers.find((t) => t.id === item.teacher_id);
    return found ? formatTeacherName(found) : "None";
  };

  const selectedTeacherOption =
    teachers.find((t) => t.id === form.teacher_id) || null;

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader
        title="Classes"
        subtitle={`${classes.length} classes`}
        action={
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={loading || actionLoading}
          >
            Add Class
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {loading
          ? Array.from(new Array(3)).map((_, idx) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
                <Card variant="outlined" sx={{ p: 1, borderRadius: 2 }}>
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                      }}
                    >
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="text" width="60%" height={28} />
                    </Box>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="50%" />
                  </CardContent>
                </Card>
              </Grid>
            ))
          : classes.map((item) => (
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
                          bgcolor: "success.shades",
                          color: "success.main",
                          display: "flex",
                        }}
                      >
                        <ApartmentIcon
                          sx={{
                            height: "34px",
                            width: "34px",
                          }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="600" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Level: {item.level}
                        </Typography>
                      </Box>
                      {item.academic_year && (
                        <Box
                          sx={{
                            alignSelf: "flex-start",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: "action.selected",
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="caption" fontWeight="600">
                            {item.academic_year}
                          </Typography>
                        </Box>
                      )}
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
                        <img
                          src={
                            getTeacherGender(item) === "male"
                              ? "/male.png"
                              : "/female.png"
                          }
                          alt="Gender"
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="body2" noWrap>
                          Teacher:{" "}
                          <strong>{getTeacherDisplayName(item)}</strong>
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
                        <MeetingRoomIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap>
                          Room:{" "}
                          {item.classroom_name ||
                            classrooms.find((r) => r.id === item.classroom_id)
                              ?.name ||
                            "None"}
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
                        disabled={actionLoading}
                      >
                        <EditIcon fontSize="small" color="primary" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDelete(item)}
                        disabled={actionLoading}
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
        onClose={() => !actionLoading && setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedClass ? "Edit Class" : "Add New Class"}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Class Name *"
                value={form.name || ""}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Level *"
                value={form.level || ""}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Academic Year *"
                placeholder="ex: 2025-2026"
                value={form.academic_year || ""}
                disabled={actionLoading}
                onChange={(e) =>
                  setForm({ ...form, academic_year: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                options={teachers}
                value={selectedTeacherOption}
                getOptionLabel={(option) => formatTeacherName(option)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                disabled={actionLoading}
                onChange={(_, newValue) => {
                  setForm({ ...form, teacher_id: newValue ? newValue.id : "" });
                }}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <Box
                      component="li"
                      key={option.id}
                      {...optionProps}
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <img
                        src={
                          option.gender === "male" ? "/male.png" : "/female.png"
                        }
                        alt={option.gender}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2">
                        {formatTeacherName(option)}
                      </Typography>
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Main Teacher"
                    placeholder="Select teacher..."
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          {selectedTeacherOption ? (
                            <img
                              src={
                                selectedTeacherOption.gender === "male"
                                  ? "/male.png"
                                  : "/female.png"
                              }
                              alt="Selected Gender"
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: "50%",
                                marginRight: 8,
                                flexShrink: 0,
                              }}
                            />
                          ) : (
                            <PersonIcon
                              color="action"
                              sx={{ mr: 0.5, fontSize: 20 }}
                            />
                          )}
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Classroom"
                value={form.classroom_id || ""}
                disabled={actionLoading}
                onChange={(e) =>
                  setForm({ ...form, classroom_id: e.target.value })
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {classrooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name} {room.building ? `(${room.building})` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSave}
            disabled={actionLoading}
          >
            {actionLoading ? "Saving..." : "Save Class"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openDelete}
        onClose={() => !actionLoading && setOpenDelete(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the class{" "}
            <strong>{selectedClass?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenDelete(false)}
            color="inherit"
            disabled={actionLoading}
          >
            No
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            {actionLoading ? "Deleting..." : "Yes, Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Classes;
