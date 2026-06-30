import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/services/api.service";
import SchoolIcon from "@mui/icons-material/School";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import {
  Box,
  Container,
  Paper,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface ClassOption {
  id: string;
  name: string;
}

interface MonthlyStatus {
  month: string;
  status: "paid" | "partial" | "overdue" | "pending";
}

interface StudentTuitionRow {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  payment_profile: "paid_all" | "in_advance" | "monthly" | "overdue";
  total_paid: number;
  remaining_balance: number;
  months: MonthlyStatus[];
}

const MOCK_CLASSES: ClassOption[] = [
  { id: "c1", name: "Grade 11 - A" },
  { id: "c2", name: "Grade 12 - B" },
];

const MOCK_STUDENTS_TUITION: StudentTuitionRow[] = [
  {
    id: "s1",
    student_number: "STD-2026-001",
    first_name: "Heritiana",
    last_name: "Rasamoelina",
    payment_profile: "paid_all",
    total_paid: 500000,
    remaining_balance: 0,
    months: [
      { month: "Sept", status: "paid" },
      { month: "Oct", status: "paid" },
      { month: "Nov", status: "paid" },
      { month: "Déc", status: "paid" },
      { month: "Janv", status: "paid" },
      { month: "Févr", status: "paid" },
      { month: "Mars", status: "paid" },
      { month: "Avril", status: "paid" },
      { month: "Mai", status: "paid" },
      { month: "Juin", status: "paid" },
    ],
  },
  {
    id: "s2",
    student_number: "STD-2026-002",
    first_name: "Aina",
    last_name: "Rakoto",
    payment_profile: "in_advance",
    total_paid: 250000,
    remaining_balance: 250000,
    months: [
      { month: "Sept", status: "paid" },
      { month: "Oct", status: "paid" },
      { month: "Nov", status: "paid" },
      { month: "Déc", status: "paid" },
      { month: "Janv", status: "paid" },
      { month: "Févr", status: "pending" },
      { month: "Mars", status: "pending" },
      { month: "Avril", status: "pending" },
      { month: "Mai", status: "pending" },
      { month: "Juin", status: "pending" },
    ],
  },
  {
    id: "s3",
    student_number: "STD-2026-003",
    first_name: "Sitraka",
    last_name: "Ranaivo",
    payment_profile: "overdue",
    total_paid: 150000,
    remaining_balance: 350000,
    months: [
      { month: "Sept", status: "paid" },
      { month: "Oct", status: "paid" },
      { month: "Nov", status: "paid" },
      { month: "Déc", status: "partial" },
      { month: "Janv", status: "overdue" },
      { month: "Févr", status: "pending" },
      { month: "Mars", status: "pending" },
      { month: "Avril", status: "pending" },
      { month: "Mai", status: "pending" },
      { month: "Juin", status: "pending" },
    ],
  },
];

const PROFILE_CONFIG: Record<
  string,
  { label: string; color: "success" | "info" | "primary" | "error" }
> = {
  paid_all: { label: "Paid All Year", color: "success" },
  in_advance: { label: "Paid In Advance", color: "info" },
  monthly: { label: "Monthly Regular", color: "primary" },
  overdue: { label: "In Arrears", color: "error" },
};

const renderMonthIcon = (status: string) => {
  switch (status) {
    case "paid":
      return <CheckCircleIcon sx={{ color: "success.main", fontSize: 18 }} />;
    case "partial":
      return <HourglassTopIcon sx={{ color: "warning.main", fontSize: 18 }} />;
    case "overdue":
      return <CancelIcon sx={{ color: "error.main", fontSize: 18 }} />;
    default:
      return (
        <Box
          sx={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: "2px solid",
            borderColor: "action.disabled",
            mx: "auto",
          }}
        />
      );
  }
};

const TuitionClassTracking = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassOption[]>(MOCK_CLASSES);
  const [selectedClass, setSelectedClass] = useState<string>("c1");
  const [students, setStudents] = useState<StudentTuitionRow[]>(
    MOCK_STUDENTS_TUITION,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await apiRequest("/api/classes", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setClasses(data);
            setSelectedClass(data[0].id);
          }
        }
      } catch {
        // Fallback automatique aux données initiales
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    const fetchClassTuition = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(
          `/api/finance/class-tuition/${selectedClass}`,
          { credentials: "include" },
        );
        if (res.ok) {
          setStudents(await res.json());
        }
      } catch {
        // Garde les données initiales si l'API n'est pas disponible
      } finally {
        setLoading(false);
      }
    };
    fetchClassTuition();
  }, [selectedClass]);

  return (
    <Container sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <PageHeader
        title="Tuition Tracker by Class"
        subtitle="Monitor student accounts, advances, full-year payments and monthly compliance matrices"
      />

      <Paper sx={{ p: 2, mt: 3, mb: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <SchoolIcon color="action" />
          <TextField
            select
            label="Select Target Class"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            sx={{ width: 260 }}
            size="small"
          >
            {classes.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflowX: "auto" }}
      >
        <Table size="small" sx={{ minWidth: 1000 }}>
          <TableHead>
            <TableRow sx={{ borderBottom: "2px solid", borderColor: "divider" }}>
              <TableCell sx={{ fontWeight: 700 }}>Student</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Payment Type</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Total Paid</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Balance</TableCell>
              <TableCell
                align="center"
                colSpan={10}
                sx={{
                  letterSpacing: 1,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: 11,
                  borderLeft: "1px solid",
                  borderColor: "divider",
                }}
              >
                Academic Months Grid
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
            <TableRow sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
              <TableCell colSpan={4} />
              {students[0]?.months.map((m, idx) => (
                <TableCell
                  key={idx}
                  align="center"
                  sx={{ 
                    fontSize: 10, 
                    fontWeight: 600, 
                    py: 1,
                    borderLeft: idx === 0 ? "1px solid" : "none",
                    borderColor: "divider"
                  }}
                >
                  {m.month}
                </TableCell>
              ))}
              <TableCell colSpan={1} />
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={15} sx={{ py: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading database records...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              students.map((student) => {
                const profile =
                  PROFILE_CONFIG[student.payment_profile] ||
                  PROFILE_CONFIG.monthly;
                return (
                  <TableRow key={student.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {student.first_name} {student.last_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {student.student_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={profile.label}
                        color={profile.color}
                        size="small"
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: 600, color: "success.dark" }}
                    >
                      {student.total_paid.toLocaleString()} AR
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 600,
                        color:
                          student.remaining_balance > 0
                            ? "error.main"
                            : "text.secondary",
                      }}
                    >
                      {student.remaining_balance.toLocaleString()} AR
                    </TableCell>

                    {student.months.map((m, idx) => (
                      <TableCell 
                        key={idx} 
                        align="center"
                        sx={{
                          borderLeft: idx === 0 ? "1px solid" : "none",
                          borderColor: "divider"
                        }}
                      >
                        <Tooltip
                          title={`${m.month}: ${m.status.toUpperCase()}`}
                          arrow
                        >
                          <Box sx={{ display: "inline-flex", mt: 0.5 }}>
                            {renderMonthIcon(m.status)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                    ))}

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() =>
                          navigate(`/students/details/${student.id}`)
                        }
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TuitionClassTracking;