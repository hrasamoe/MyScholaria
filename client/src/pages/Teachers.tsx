import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import AddIcon from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export type TeacherSubject =
  | "Mathematics"
  | "Physics"
  | "Chemistry"
  | "Biology"
  | "Malagasy"
  | "English"
  | "Phylosophy"
  | "French"
  | "History & Geography"
  | "Computer Science"
  | "Physical Education"
  | "Art & Music";

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  subject: TeacherSubject;
}

const Teachers = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { user } = useAuth();
  const online = useOnlineStatus();
  const { enqueueSnackbar } = useSnackbar();

  const establishmentID = user?.establishment_id;
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const handleDelete = async (id: string) => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/utils/delete-teacher/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const result = await response.json();
      if (response.ok) {
        setTeachers((prev) => prev.filter((t) => t.id !== id));
        enqueueSnackbar("Teacher deleted successfully", { variant: "success" });
      } else {
        enqueueSnackbar(result.message || "Deletion error", {
          variant: "error",
        });
      }
    } catch (error: any) {
      enqueueSnackbar("An error occurred during deletion", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
      setOpenDialog(false);
      setSelectedTeacher(null);
    }
  };

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

  const filteredTeachers = teachers.filter(
    (t) =>
      t.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()),
  );
  const sortedTeachers = [...filteredTeachers].sort((a, b) =>
    a.first_name.localeCompare(b.first_name),
  );
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!establishmentID) return;
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/utils/get-teacher-list/${establishmentID}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch teachers");
        }
        setTeachers(result);
      } catch (error: any) {
        console.error("Error fetching teachers:", error);
        enqueueSnackbar(error.message || "Failed to fetch teachers", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [online, establishmentID]);

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader
        title="Teachers"
        subtitle="Manage academic staff profiles and subject assignments"
        action={
          <Button
            variant="contained"
            onClick={() => navigate("/teachers/create")}
            color="success"
            startIcon={<AddIcon />}
            disabled={loading || actionLoading}
          >
            Add New Teacher
          </Button>
        }
      />

      <Box sx={{ mt: 3, mb: 4, display: "flex", justifyContent: "flex-start" }}>
        <TextField
          size="small"
          placeholder="Search by name or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loading}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 2,
        }}
      >
        {loading
          ? Array.from(new Array(6)).map((_, index) => (
              <Card key={index} variant="outlined">
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    "&:last-child": { pb: 2 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexGrow: 1,
                    }}
                  >
                    <Skeleton
                      variant="circular"
                      width={45}
                      height={45}
                      sx={{ flexShrink: 0 }}
                    />
                    <Box sx={{ width: "100%" }}>
                      <Skeleton variant="text" width="60%" height={24} />
                      <Skeleton variant="text" width="40%" height={18} />
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Skeleton variant="circular" width={30} height={30} />
                  </Box>
                </CardContent>
              </Card>
            ))
          : sortedTeachers.map((teacher) => (
              <Card
                key={teacher.id}
                variant="outlined"
                onClick={() =>
                  !actionLoading && navigate(`/teachers/edit/${teacher.id}`)
                }
                sx={{ cursor: "pointer" }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                    "&:last-child": { pb: 2 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      flexGrow: 1,
                      minWidth: 0,
                      padding: "4px 1px",
                    }}
                  >
                    {teacher.gender === "male" ? (
                      <img
                        src="/male.png"
                        alt="Male"
                        style={{ width: 60, height: 60, flexShrink: 0 }}
                      />
                    ) : (
                      <img
                        src="/female.png"
                        alt="Female"
                        style={{ width: 60, height: 60, flexShrink: 0 }}
                      />
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        fontWeight="500"
                        noWrap
                        sx={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          fontSize: "18px",
                        }}
                      >
                        {formatFirstName(teacher.first_name)}{" "}
                        {teacher.last_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {teacher.subject}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTeacher(teacher);
                        setOpenDialog(true);
                      }}
                    >
                      <Delete fontSize="medium" color="error" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            ))}
      </Box>

      <Dialog
        open={openDialog}
        onClose={() => !actionLoading && setOpenDialog(false)}
      >
        <DialogTitle>Warning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you really want to delete teacher{" "}
            <strong>
              {selectedTeacher?.first_name} {selectedTeacher?.last_name}
            </strong>{" "}
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            color="inherit"
            disabled={actionLoading}
          >
            No
          </Button>
          <Button
            onClick={() => selectedTeacher && handleDelete(selectedTeacher.id)}
            color="error"
            disabled={actionLoading}
            autoFocus
          >
            {actionLoading ? "Deleting..." : "Yes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Teachers;
