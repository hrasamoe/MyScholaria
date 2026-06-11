import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { apiRequest } from "@/services/api.service";
import AddIcon from "@mui/icons-material/Add";
import Delete from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Card,
  Container,
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

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
  position: string;
  department: string;
}

const Staff = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const online = useOnlineStatus();
  const { enqueueSnackbar } = useSnackbar();

  const establishmentID = user?.establishment_id;
  const [staff, setStaff] = useState<StaffMember[]>([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  const handleDelete = async (id: string) => {
    const response = await apiRequest(`/api/staff/delete/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );
    const result = await response.json();
    if (response.ok) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
      enqueueSnackbar("Staff member deleted successfully", {
        variant: "success",
      });
    } else {
      enqueueSnackbar(result.message || "Deletion error", {
        variant: "error",
      });
    }
    setOpenDialog(false);
    setSelectedStaff(null);
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

  const filteredStaff = staff.filter(
    (s) =>
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.position.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const sortedStaff = [...filteredStaff].sort((a, b) =>
    a.first_name.localeCompare(b.first_name),
  );

  useEffect(() => {
    const fetchStaff = async () => {
      if (!establishmentID) return;
      try {
        setLoading(true);
        const response = await apiRequest(`/api/staff/list/${establishmentID}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch staff members");
        }
        setStaff(result);
      } catch (error: any) {
        console.error("Error fetching staff:", error);
        enqueueSnackbar(error.message || "Failed to fetch staff members", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [establishmentID]);

  return (
    <Container sx={{ p: 2 }}>
      <PageHeader
        title="Staff Members"
        subtitle="Manage administrative, pedagogical, and support personnel records"
        action={
          <Button
            variant="contained"
            onClick={() => navigate("/staff/create")}
            color="success"
            startIcon={<AddIcon />}
            disabled={loading}
          >
            Add New Staff
          </Button>
        }
      />

      <Box sx={{ mt: 3, mb: 4, display: "flex", justifyContent: "flex-start" }}>
        <TextField
          size="small"
          placeholder="Search by name or position..."
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
          : sortedStaff.map((member) => (
              <Card
                key={member.id}
                variant="outlined"
                onClick={() => navigate(`/staff/details/${member.id}`)}
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
                    {member.gender === "male" ? (
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
                        {formatFirstName(member.first_name)} {member.last_name}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          mb: 0.5,
                        }}
                      >
                        {member.position}
                      </Typography>
                      <Chip
                        label={member.department}
                        size="small"
                        variant="outlined"
                        color="primary"
                        sx={{
                          fontWeight: 600,
                          borderRadius: 1,
                          height: 20,
                          fontSize: "11px",
                        }}
                      />
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStaff(member);
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
            Do you really want to delete staff member{" "}
            <strong>
              {selectedStaff?.first_name} {selectedStaff?.last_name}
            </strong>{" "}
            ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} color="inherit">
            No
          </Button>
          <Button
            onClick={() => selectedStaff && handleDelete(selectedStaff.id)}
            color="error"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Staff;
