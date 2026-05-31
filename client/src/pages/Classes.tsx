import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import AddIcon from "@mui/icons-material/Add";
import ApartmentIcon from "@mui/icons-material/Apartment";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import GroupsIcon from "@mui/icons-material/Groups";
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
  establishment_id: string;
  name: string;
  level: string | null;
  academic_year: string;
  main_teacher_id: string | null;
  room_id: string;
  created_at: string;
  updated_at: string;
  teacher_pid: string | null;
  teacher_profile_id: string | null;
  teacher_full_name: string | null;
  teacher_gender: "male" | "female" | null;
  classroom_name: string | null;
  classroom_capacity: number | null;
  classroom_building: string | null;
  classroom_type: string | null;
}

interface ClassroomOption {
  id: string;
  name: string;
  building: string;
  capacity: number | null;
}

interface TeacherOption {
  pid: string;
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
}

const API_URL = import.meta.env.VITE_API_URL;

const Classes = () => {
  const { user } = useAuth();
  const establishmentID = user?.establishment_id || "";
  const { enqueueSnackbar } = useSnackbar();

  const [classes, setClasses] = useState<ClassItem[]>([]);
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
        fetch(`${API_URL}/api/establishment/classes-list/${establishmentID}`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/utils/get-classrooms/${establishmentID}`, {
          credentials: "include",
        }),
        fetch(`${API_URL}/api/teachers/get-list/${establishmentID}`, {
          credentials: "include",
        }),
      ]);

      if (resClasses.ok) {
        const classesData = await resClasses.json();
        setClasses(classesData.length > 0 ? classesData : null);
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
      academic_year: "",
      main_teacher_id: "",
      room_id: "",
    });
    setOpen(true);
  };

  const handleOpenEdit = (item: ClassItem) => {
    setSelectedClass(item);
    setForm({
      name: item.name,
      level: item.level || "",
      academic_year: item.academic_year,
      main_teacher_id: item.main_teacher_id || "",
      room_id: item.room_id,
    });
    setOpen(true);
  };

  const handleOpenDelete = (item: ClassItem) => {
    setSelectedClass(item);
    setOpenDelete(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.academic_year || !form.room_id) {
      enqueueSnackbar(
        "Please fill required fields (Name, Academic Year, Classroom)",
        { variant: "error" },
      );
      return;
    }

    const payload = {
      name: form.name,
      level: form.level || null,
      academicYear: form.academic_year,
      mainTeacherID: form.main_teacher_id || null,
      establishementID: establishmentID,
      classRoomID: form.room_id,
    };

    try {
      setActionLoading(true);
      const url = selectedClass
        ? `${API_URL}/api/establishment/edit-classes/${selectedClass.id}`
        : `${API_URL}/api/establishment/classes/${establishmentID}`;

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
        `${API_URL}/api/establishment/delete-classes/${selectedClass.id}`,
        { method: "DELETE", credentials: "include" },
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

  const selectedTeacherOption =
    teachers.find((t) => t.pid === form.main_teacher_id) || null;

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
                        <ApartmentIcon sx={{ height: "34px", width: "34px" }} />
                      </Box>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight="600" noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Level: {item.level || "N/A"}
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
                            item.teacher_gender === "female"
                              ? "/female.png"
                              : "/male.png"
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
                          <strong>{item.teacher_full_name || "None"}</strong>
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
                          Room: {item.classroom_name || "None"}
                        </Typography>
                      </Box>

                      {item.classroom_capacity != null && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            color: "text.secondary",
                          }}
                        >
                          <GroupsIcon fontSize="small" color="action" />
                          <Typography variant="body2" noWrap>
                            Room Capacity: {item.classroom_capacity} seats
                          </Typography>
                        </Box>
                      )}
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
                label="Level"
                value={form.level || ""}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 12 }}>
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
                isOptionEqualToValue={(option, value) =>
                  option.pid === value.pid
                }
                disabled={actionLoading}
                onChange={(_, newValue) => {
                  setForm({
                    ...form,
                    main_teacher_id: newValue ? newValue.pid : "",
                  });
                }}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <Box
                      component="li"
                      key={option.pid}
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
                label="Classroom *"
                value={form.room_id || ""}
                disabled={actionLoading}
                onChange={(e) => setForm({ ...form, room_id: e.target.value })}
              >
                <MenuItem value="" disabled>
                  <em>Select a room</em>
                </MenuItem>
                {classrooms.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.name} {room.building ? `(${room.building})` : ""}
                    {room.capacity ? ` - Max: ${room.capacity} seats` : ""}
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
