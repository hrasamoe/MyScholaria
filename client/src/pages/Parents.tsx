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
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Parent {
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
}

const ParentsList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const online = useOnlineStatus();
  const { enqueueSnackbar } = useSnackbar();

  const establishmentID = user?.establishment_id;
  const [parents, setParents] = useState<Parent[]>([]);

  const handleView = (id: string) => {};
  const handleEdit = (id: string) => {};
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
  const filteredParents = parents.filter(
    (p) =>
      p.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.last_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    const fetchParents = async () => {
      if (!establishmentID) return;
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/utils/get-parent-list/${establishmentID}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch parents");
        }
        setParents(result);
      } catch (error: any) {
        console.error("Error fetching parents:", error);
        enqueueSnackbar(error.message || "Failed to fetch parents", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchParents();
  }, [online, establishmentID]);

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader
        title="Parents & Guardians"
        subtitle="Manage information and contact links for student guardians"
        action={
          <Button
            variant="contained"
            onClick={() => navigate("/parents/create")}
            color="success"
            startIcon={<AddIcon />}
          >
            Add New Parent
          </Button>
        }
      />

      <Box sx={{ mt: 3, mb: 4, display: "flex", justifyContent: "flex-start" }}>
        <TextField
          size="small"
          placeholder="Search by name..."
          value={searchTerm}
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
        {filteredParents.map((parent) => (
          <Card key={parent.id} variant="outlined">
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
                }}
              >
                {parent.gender === "male" ? (
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
                <Typography
                  variant="h6"
                  fontWeight="500"
                  noWrap
                  sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
                >
                  {formatFirstName(parent.first_name)} {parent.last_name}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
                <IconButton size="small" onClick={() => handleEdit(parent.id)}>
                  <Delete fontSize="medium" color="error" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ParentsList;
