import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import SearchIcon from "@mui/icons-material/Search";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Box,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Skeleton,
  TextField,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
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

export default function StudentFinanceSetupList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  const establishmentID = user?.establishment_id;

  useEffect(() => {
    const fetchStudents = async () => {
      if (!establishmentID) return;
      try {
        setLoading(true);
        const response = await apiRequest(`/api/students/list`, {
          method: "GET",
          credentials: "include",
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch students");
        }
        setStudents(result);

        const uniqueClasses: string[] = Array.from(
          new Set(result.map((s: Student) => s.class_name).filter(Boolean)),
        );
        setClasses(uniqueClasses);
      } catch (error: any) {
        enqueueSnackbar(error.message || "Failed to fetch students", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [establishmentID, enqueueSnackbar]);

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

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_number.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClass === "all" || s.class_name === selectedClass;

    return matchesSearch && matchesClass;
  });

  const sortedStudents = [...filteredStudents].sort((a, b) =>
    a.first_name.localeCompare(b.first_name),
  );

  return (
    <Box sx={{ p: 2 }}>
      <PageHeader
        title="Tuition & Fees Configuration"
        subtitle="Select a class or search for a student to modify their financial plan structures"
      />

      <Box
        sx={{
          mt: 3,
          mb: 4,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Search by name or ID..."
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
          sx={{ width: 300, bgcolor: "background.paper" }}
        />

        <FormControl
          size="small"
          sx={{ minWidth: 200, bgcolor: "background.paper" }}
        >
          <InputLabel id="class-filter-label">Filter by Class</InputLabel>
          <Select
            labelId="class-filter-label"
            value={selectedClass}
            label="Filter by Class"
            disabled={loading}
            onChange={(e) => setSelectedClass(e.target.value)}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon fontSize="small" />
              </InputAdornment>
            }
          >
            <MenuItem value="all">All Classes (Toutes)</MenuItem>
            {classes.map((cls) => (
              <MenuItem key={cls} value={cls}>
                {cls}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
                    justifycontent: "space-between",
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
                      width={60}
                      height={60}
                      sx={{ flexShrink: 0 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Skeleton variant="text" width="80%" height={24} />
                      <Skeleton
                        variant="text"
                        width="40%"
                        height={20}
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))
          : sortedStudents.map((student) => (
              <Card
                key={student.id}
                variant="outlined"
                sx={{
                  border: "1px solid #2a2f3d",
                  bgcolor: "background.paper",
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    "&:last-child": { pb: 2 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                    }}
                  >
                    <img
                      src={
                        student.gender === "male" ? "/male.png" : "/female.png"
                      }
                      alt={student.gender}
                      style={{ width: 55, height: 55, flexShrink: 0 }}
                    />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography
                        fontWeight="600"
                        sx={{
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                          fontSize: "16px",
                        }}
                      >
                        {formatFirstName(student.first_name)}{" "}
                        {student.last_name}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 0.5 }}
                        flexWrap="wrap"
                        gap={0.5}
                      >
                        <Chip
                          label={student.student_number}
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
                        {student.class_name && (
                          <Chip
                            label={student.class_name}
                            size="small"
                            color="secondary"
                            sx={{
                              fontWeight: 600,
                              borderRadius: 1,
                              height: 20,
                              fontSize: "11px",
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Box>

                  <Button
                    fullWidth
                    size="small"
                    variant="contained"
                    color="primary"
                    startIcon={<AccountBalanceWalletIcon />}
                    onClick={() =>
                      navigate(`/students/finance-setup/${student.id}`)
                    }
                  >
                    Setup Financial Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
      </Box>

      {!loading && sortedStudents.length === 0 && (
        <Box
          sx={{
            mt: 4,
            textalign: "center",
            p: 4,
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography color="text.secondary">
            No students matched the chosen criteria.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
