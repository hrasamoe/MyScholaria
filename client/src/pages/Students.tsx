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
  Chip,
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

interface Student {
  id: string;
  first_name: string;
  student_number: string;
  last_name: string;
  gender: "male" | "female";
  class_name: string;
}

const Students = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const online = useOnlineStatus();
  const { enqueueSnackbar } = useSnackbar();

  const establishmentID = user?.establishment_id;
  const [students, setStudents] = useState<Student[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleDelete = async (id: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/api/students/delete/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    const result = await response.json();
    if (response.ok) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      enqueueSnackbar("Student deleted successfully", { variant: "success" });
    } else {
      enqueueSnackbar(result.message || "Deletion error", {
        variant: "error",
      });
    }
    setOpenDialog(false);
    setSelectedStudent(null);
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

  const filteredStudents = students.filter(
    (s) =>
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedStudents = [...filteredStudents].sort((a, b) =>
    a.first_name.localeCompare(b.first_name),
  );

  useEffect(() => {
    const fetchStudents = async () => {
      if (!establishmentID) return;
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/students/list/${establishmentID}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch students");
        }
        setStudents(result);
      } catch (error: any) {
        console.error("Error fetching students:", error);
        enqueueSnackbar(error.message || "Failed to fetch students", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [establishmentID]);

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader
        title="Students"
        subtitle="Manage information and academic links for students"
        action={
          <Button
            variant="contained"
            onClick={() => navigate("/students/create")}
            color="success"
            startIcon={<AddIcon />}
            disabled={loading}
          >
            Add New Student
          </Button>
        }
      />

      <Box sx={{ mt: 3, mb: 4, display: "flex", justifyContent: "flex-start" }}>
        <TextField
          size="small"
          placeholder="Search by name..."
          value={searchTerm}
          disabled={loading}
          onChange={(e) => setSearchTerm(e.target.value)}
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
                    <Skeleton variant="text" width="60%" height={24} />
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Skeleton variant="circular" width={30} height={30} />
                  </Box>
                </CardContent>
              </Card>
            ))
          : sortedStudents.map((student) => (
              <Card
                key={student.id}
                variant="outlined"
                onClick={() => navigate(`/students/details/${student.id}`)}
                sx={{
                  cursor: "pointer",
                  border: "1px solid #2a2f3d",
                }}
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
                    {student.gender === "male" ? (
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
                    <Box>
                      {" "}
                      <Typography
                        fontWeight="500"
                        noWrap
                        sx={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          fontSize: "18px",
                        }}
                      >
                        {formatFirstName(student.first_name)}{" "}
                        {student.last_name}
                      </Typography>{" "}
                      <Chip
                        label={student.student_number}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{ fontWeight: 600, borderRadius: 1 }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStudent(student);
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Warning</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you really want to delete student{" "}
            <strong>
              {selectedStudent?.first_name} {selectedStudent?.last_name}
            </strong>{" "}
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            No
          </Button>
          <Button
            onClick={() => selectedStudent && handleDelete(selectedStudent.id)}
            color="error"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Students;
