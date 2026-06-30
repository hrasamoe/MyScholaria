import PageHeader from "@/components/PageHeader";
import { apiRequest } from "@/services/api.service";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SchoolIcon from "@mui/icons-material/School";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import PendingIcon from "@mui/icons-material/Pending";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const MOCK_TUITION_SUMMARY = {
  total_due: 500000,
  total_paid: 200000,
  balance: 300000,
  overdue: 50000,
};

const MOCK_SCHED_ITEMS: TuitionScheduleItem[] = [
  {
    id: "1",
    month: "September",
    due_date: "2025-09-05",
    amount_due: 50000,
    amount_paid: 50000,
    status: "paid",
  },
  {
    id: "2",
    month: "October",
    due_date: "2025-10-05",
    amount_due: 50000,
    amount_paid: 50000,
    status: "paid",
  },
  {
    id: "3",
    month: "November",
    due_date: "2025-11-05",
    amount_due: 50000,
    amount_paid: 50000,
    status: "paid",
  },
  {
    id: "4",
    month: "December",
    due_date: "2025-12-05",
    amount_due: 50000,
    amount_paid: 50000,
    status: "paid",
  },
  {
    id: "5",
    month: "January",
    due_date: "2026-01-05",
    amount_due: 50000,
    amount_paid: 0,
    status: "overdue",
  },
  {
    id: "6",
    month: "February",
    due_date: "2026-02-05",
    amount_due: 50000,
    amount_paid: 0,
    status: "pending",
  },
  {
    id: "7",
    month: "March",
    due_date: "2026-03-05",
    amount_due: 50000,
    amount_paid: 0,
    status: "pending",
  },
  {
    id: "8",
    month: "April",
    due_date: "2026-04-05",
    amount_due: 50000,
    amount_paid: 0,
    status: "pending",
  },
  {
    id: "9",
    month: "May",
    due_date: "2026-05-05",
    amount_due: 50000,
    amount_paid: 0,
    status: "pending",
  },
  {
    id: "10",
    month: "June",
    due_date: "2026-06-05",
    amount_due: 50000,
    amount_paid: 0,
    status: "pending",
  },
];

const MOCK_TRANSACTIONS: TuitionTransaction[] = [
  {
    id: "t1",
    amount: 100000,
    payment_method: "Mvola",
    reference: "TX-948293",
    payment_date: "2025-09-04",
    remarks: "Sept & Oct Tuition",
  },
  {
    id: "t2",
    amount: 100000,
    payment_method: "Cash",
    reference: null,
    payment_date: "2025-11-02",
    remarks: "Nov & Dec Tuition",
  },
];

interface StudentDetail {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  student_number: string;
  enrollment_date: string;
  class_id: string | null;
  class_name: string | null;
  status: "active" | "expelled" | "transferred" | "graduated";
  medical_notes: string | null;
  parents: ParentOption[] | null;
}

interface ParentOption {
  id: string;
  first_name: string;
  last_name: string;
  gender: "male" | "female";
}

interface TeacherOption {
  id: string;
  first_name: string;
  last_name: string;
  link_id: string;
  subject: string;
  gender: "male" | "female";
}

interface TuitionScheduleItem {
  id: string;
  month: string;
  due_date: string;
  amount_due: number;
  amount_paid: number;
  status: "paid" | "partial" | "overdue" | "pending";
}

interface TuitionTransaction {
  id: string;
  amount: number;
  payment_method: string;
  reference: string | null;
  payment_date: string;
  remarks: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

const CLASS_COLORS = [
  "#1976d2",
  "#388e3c",
  "#f57c00",
  "#7b1fa2",
  "#0097a7",
  "#c62828",
];

const getClassColor = (name: string) => {
  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return CLASS_COLORS[hash % CLASS_COLORS.length];
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: "success" | "error" | "warning" | "default" }
> = {
  active: { label: "Active", color: "success" },
  expelled: { label: "Expelled", color: "error" },
  transferred: { label: "Transferred", color: "warning" },
  graduated: { label: "Graduated", color: "default" },
};

const TUITION_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    color: "success" | "warning" | "error" | "default";
    icon: React.ReactNode;
  }
> = {
  paid: {
    label: "Paid",
    color: "success",
    icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
  },
  partial: {
    label: "Partial",
    color: "warning",
    icon: <PendingIcon sx={{ fontSize: 14 }} />,
  },
  overdue: {
    label: "Overdue",
    color: "error",
    icon: <ErrorIcon sx={{ fontSize: 14 }} />,
  },
  pending: {
    label: "Pending",
    color: "default",
    icon: <PendingIcon sx={{ fontSize: 14 }} />,
  },
};

const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatParentName = (p: ParentOption) => {
  const parts = (p.first_name || "").trim().split(/\s+/);
  const first =
    parts.length <= 1
      ? parts[0]
      : `${parts[0]} ${parts
          .slice(1)
          .map((x) => `${x[0].toUpperCase()}.`)
          .join(" ")}`;
  return `${first} ${p.last_name || ""}`.trim();
};

const InfoRow = ({
  label,
  value,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
      {label}
    </Typography>
    {loading ? (
      <Skeleton variant="text" width="60%" height={22} />
    ) : (
      <Typography variant="body2" mt={0.25}>
        {value ?? <span style={{ opacity: 0.4, fontStyle: "italic" }}>—</span>}
      </Typography>
    )}
  </Box>
);

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [parents, setParents] = useState<ParentOption[]>([]);
  const [teacher, setTeacher] = useState<TeacherOption | null>(null);
  const [loading, setLoading] = useState(true);

  const [tuitionSummary, setTuitionSummary] = useState(MOCK_TUITION_SUMMARY);
  const [tuitionSchedule, setTuitionSchedule] =
    useState<TuitionScheduleItem[]>(MOCK_SCHED_ITEMS);
  const [transactions, setTransactions] =
    useState<TuitionTransaction[]>(MOCK_TRANSACTIONS);
  const [tuitionLoading, setTuitionLoading] = useState(true);
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [reference, setReference] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const fetchTuitionData = async () => {
    if (!id) return;
    try {
      setTuitionLoading(true);
      const [resSummary, resSchedule, resTransactions] = await Promise.all([
        apiRequest(`/api/finance/student-tuition-summary/${id}`, {
          credentials: "include",
        }),
        apiRequest(`/api/finance/student-tuition-schedule/${id}`, {
          credentials: "include",
        }),
        apiRequest(`/api/finance/student-tuition-transactions/${id}`, {
          credentials: "include",
        }),
      ]);

      if (resSummary.ok) setTuitionSummary(await resSummary.json());
      if (resSchedule.ok) setTuitionSchedule(await resSchedule.json());
      if (resTransactions.ok) setTransactions(await resTransactions.json());
    } catch {
      // Fallback
    } finally {
      setTuitionLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await apiRequest(`/api/students/details/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to load student data");
        }

        const data: StudentDetail = await res.json();
        setStudent(data);
        setParents(data.parents || []);

        try {
          const resTeacher = await fetch(
            `${API_URL}/api/students/teacher/${id}`,
            { credentials: "include" },
          );
          if (resTeacher.ok) {
            const t = await resTeacher.json();
            setTeacher(t || null);
          }
        } catch {
          setTeacher(null);
        }
      } catch (e: any) {
        enqueueSnackbar(e.message || "Error loading student", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    fetchTuitionData();
  }, [id, enqueueSnackbar]);

  const handleMonthToggle = (item: TuitionScheduleItem) => {
    const isSelected = selectedMonths.includes(item.id);
    let updatedMonths = [];

    if (isSelected) {
      updatedMonths = selectedMonths.filter((mId) => mId !== item.id);
    } else {
      updatedMonths = [...selectedMonths, item.id];
    }

    setSelectedMonths(updatedMonths);

    const calculatedTotal = tuitionSchedule
      .filter((m) => updatedMonths.includes(m.id))
      .reduce(
        (acc, current) => acc + (current.amount_due - current.amount_paid),
        0,
      );

    setPaymentAmount(calculatedTotal);
  };

  const handleProcessPayment = async () => {
    if (paymentAmount <= 0 || selectedMonths.length === 0) {
      enqueueSnackbar("Please pick outstanding items to pay.", {
        variant: "warning",
      });
      return;
    }

    try {
      setProcessingPayment(true);
      const res = await apiRequest(`/api/finance/collect-tuition`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          studentId: id,
          scheduleItemIds: selectedMonths,
          amountPaid: paymentAmount,
          paymentMethod,
          reference,
          remarks,
        }),
      });

      if (!res.ok) throw new Error();

      enqueueSnackbar("Payment successfully captured and matched!", {
        variant: "success",
      });
      setOpenPaymentModal(false);
      setSelectedMonths([]);
      setPaymentAmount(0);
      setReference("");
      setRemarks("");
      fetchTuitionData();
    } catch {
      enqueueSnackbar("Error executing server payment posting transaction.", {
        variant: "error",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const statusCfg = STATUS_CONFIG[student?.status ?? "active"];
  const fullName = student ? `${student.first_name} ${student.last_name}` : "";

  return (
    <Container sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Student Profile"
        subtitle="Full profile and linked records for this student"
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/students/edit/${id}`)}
              disabled={loading}
            >
              Edit
            </Button>
          </Stack>
        }
      />

      <Paper
        variant="outlined"
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        {loading ? (
          <>
            <Skeleton variant="circular" width={64} height={64} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width={200} height={32} />
              <Skeleton variant="text" width={120} height={20} />
            </Box>
          </>
        ) : (
          <>
            <Avatar
              src={
                student?.gender?.toLowerCase() === "female"
                  ? "/female.png"
                  : "/male.png"
              }
              sx={{ width: 64, height: 64 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                {fullName}
              </Typography>
              <Stack direction="row" spacing={1} mt={0.75} flexWrap="wrap">
                <Chip
                  label={statusCfg?.label ?? student?.status}
                  color={statusCfg?.color ?? "default"}
                  size="small"
                />
                <Chip
                  label={`ID: ${student?.student_number}`}
                  size="small"
                  variant="outlined"
                />
                {student?.class_name && (
                  <Chip
                    icon={<SchoolIcon sx={{ fontSize: 14 }} />}
                    label={student.class_name}
                    size="small"
                    sx={{
                      bgcolor: getClassColor(student.class_name),
                      color: "white",
                      "& .MuiChip-icon": { color: "white" },
                    }}
                  />
                )}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                size="small"
                variant="outlined"
                color="success"
                startIcon={<PersonAddIcon />}
                onClick={() => navigate(`/students/edit/${id}`)}
              >
                Add Parent
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
                onClick={() => navigate("/students/create")}
              >
                New Student
              </Button>
            </Stack>
          </>
        )}
      </Paper>

      <Paper
        variant="outlined"
        sx={{ p: 3, mt: 2, borderRadius: 2, borderColor: "primary.light" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6" fontWeight={600} color="primary.main">
              Tuition & School Fees Status
            </Typography>
            {!tuitionLoading && (
              <Chip
                label={
                  tuitionSummary.balance === 0
                    ? "Paid All Year (Soldé)"
                    : tuitionSchedule.filter((m) => m.status === "paid")
                          .length > 4
                      ? "Paid In Advance (En Avance)"
                      : "Standard Monthly"
                }
                color={tuitionSummary.balance === 0 ? "success" : "info"}
                // variant="contained"
                size="small"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<ReceiptLongIcon />}
            onClick={() => setOpenPaymentModal(true)}
            disabled={tuitionLoading}
          >
            Collect Tuition Payment
          </Button>
        </Box>

        {tuitionLoading ? (
          <Skeleton
            variant="rectangular"
            width="100%"
            height={100}
            sx={{ borderRadius: 1 }}
          />
        ) : (
          <>
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                bgcolor: "background.default",
                borderRadius: 1,
                borderLeft: "4px solid",
                borderLeftColor: "primary.main",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                <strong>Payment Standing:</strong> This student has completely
                fulfilled{" "}
                <strong>
                  {tuitionSchedule.filter((m) => m.status === "paid").length}{" "}
                  out of {tuitionSchedule.length} months
                </strong>{" "}
                for this current academic iteration cycle.
                {tuitionSummary.balance === 0 &&
                  " The structural account invoice balances to zero. Complete year cleared."}
              </Typography>
            </Box>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    // bgcolor: "grey.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Total Expected
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="text.primary"
                  >
                    {tuitionSummary.total_due.toLocaleString()} AR
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "success.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "success.light",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="success.dark"
                    fontWeight={500}
                  >
                    Total Paid
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="success.dark"
                  >
                    {tuitionSummary.total_paid.toLocaleString()} AR
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "info.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "info.light",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    color="info.dark"
                    fontWeight={500}
                  >
                    Remaining Balance
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color="info.dark"
                  >
                    {tuitionSummary.balance.toLocaleString()} AR
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor:
                      tuitionSummary.overdue > 0 ? "error.50" : "grey.50",
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor:
                      tuitionSummary.overdue > 0 ? "error.light" : "divider",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    color={
                      tuitionSummary.overdue > 0
                        ? "error.dark"
                        : "text.secondary"
                    }
                    fontWeight={500}
                  >
                    Arrears (Overdue)
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    color={
                      tuitionSummary.overdue > 0 ? "error.main" : "text.primary"
                    }
                  >
                    {tuitionSummary.overdue.toLocaleString()} AR
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Monthly Installments Schedule
            </Typography>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ maxHeight: 260, mb: 3 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Month</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="right">Amount Due</TableCell>
                    <TableCell align="right">Amount Paid</TableCell>
                    <TableCell align="center">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tuitionSchedule.map((row) => {
                    const cfg =
                      TUITION_STATUS_CONFIG[row.status] ||
                      TUITION_STATUS_CONFIG.pending;
                    return (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>
                          {row.month}
                        </TableCell>
                        <TableCell>{formatDate(row.due_date)}</TableCell>
                        <TableCell align="right">
                          {row.amount_due.toLocaleString()} AR
                        </TableCell>
                        <TableCell align="right">
                          {row.amount_paid.toLocaleString()} AR
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            // icon={cfg.icon}
                            label={cfg.label}
                            color={cfg.color}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Recent Payments Ledger
            </Typography>
            {transactions.length === 0 ? (
              <Typography
                variant="body2"
                color="text.disabled"
                sx={{ fontStyle: "italic", pb: 1 }}
              >
                No previous invoice payments registered.
              </Typography>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Method</TableCell>
                      <TableCell>Reference ID</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{formatDate(tx.payment_date)}</TableCell>
                        <TableCell>
                          <Chip
                            label={tx.payment_method}
                            size="small"
                            // variant="contained"
                            color="secondary"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            // variant="fontFamily"
                            sx={{ fontSize: 12 }}
                          >
                            {tx.reference || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ fontWeight: 600, color: "success.dark" }}
                        >
                          {tx.amount.toLocaleString()} AR
                        </TableCell>
                        <TableCell
                          sx={{ fontSize: 12, color: "text.secondary" }}
                        >
                          {tx.remarks || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Identity & Contact
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="First Name"
              value={student?.first_name}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Last Name"
              value={student?.last_name}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Gender" value={student?.gender} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Date of Birth"
              value={formatDate(student?.date_of_birth ?? null)}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Email" value={student?.email} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Phone" value={student?.phone} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <InfoRow
              label="Address"
              value={student?.address}
              loading={loading}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Academic Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Student ID"
              value={student?.student_number}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Enrollment Date"
              value={formatDate(student?.enrollment_date ?? null)}
              loading={loading}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              Class
            </Typography>
            <Box mt={0.25}>
              {loading ? (
                <Skeleton variant="rounded" width={100} height={26} />
              ) : student?.class_name ? (
                <Chip
                  label={student.class_name}
                  size="small"
                  onClick={() => navigate("/classes")}
                  sx={{
                    bgcolor: getClassColor(student.class_name),
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography
                    variant="body2"
                    color="text.disabled"
                    fontStyle="italic"
                  >
                    No class assigned
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<SchoolIcon />}
                    onClick={() => navigate(`/students/edit/${id}`)}
                  >
                    Assign
                  </Button>
                </Box>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              Status
            </Typography>
            <Box mt={0.25}>
              {loading ? (
                <Skeleton variant="rounded" width={80} height={26} />
              ) : (
                <Chip
                  label={statusCfg?.label ?? student?.status}
                  color={statusCfg?.color ?? "default"}
                  size="small"
                />
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              Main Teacher
            </Typography>
            <Box mt={0.25}>
              {loading ? (
                <Skeleton variant="rounded" width={220} height={32} />
              ) : teacher ? (
                <Chip
                  avatar={
                    <img
                      src={
                        teacher.gender === "female"
                          ? "/female.png"
                          : "/male.png"
                      }
                      alt="teacher"
                      style={{ width: 24, height: 24, borderRadius: "50%" }}
                    />
                  }
                  label={`${teacher.first_name} ${teacher.last_name} - ${teacher.subject}`}
                  onClick={() => navigate(`/teachers/edit/${teacher.link_id}`)}
                  sx={{ cursor: "pointer", color: "white", fontWeight: 500 }}
                />
              ) : (
                <Typography
                  variant="body2"
                  color="text.disabled"
                  fontStyle="italic"
                >
                  No teacher assigned
                </Typography>
              )}
            </Box>
          </Grid>

          {(loading || student?.medical_notes) && (
            <Grid size={{ xs: 12 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                Medical Notes
              </Typography>
              {loading ? (
                <Skeleton variant="rounded" height={64} sx={{ mt: 0.5 }} />
              ) : (
                <Box
                  sx={{
                    mt: 0.5,
                    p: 2,
                    bgcolor: "warning.50",
                    border: "1px solid",
                    borderColor: "warning.light",
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="body2" whiteSpace="pre-line">
                    {student?.medical_notes}
                  </Typography>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            justifycontent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Parents / Guardians
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => navigate("/parents/create")}
          >
            Create new parent
          </Button>
        </Box>

        {loading ? (
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={56} />
            <Skeleton variant="rounded" height={56} />
          </Stack>
        ) : parents.length === 0 ? (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Typography variant="body2" color="text.disabled">
              No parents or guardians linked to this student.
            </Typography>
            <Button
              sx={{ mt: 1 }}
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate(`/students/edit/${id}`)}
            >
              Link a parent
            </Button>
          </Box>
        ) : (
          <Stack spacing={1}>
            {parents.map((p) => (
              <Box
                key={p.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <img
                  src={p.gender === "male" ? "/male.png" : "/female.png"}
                  alt={p.gender}
                  style={{ width: 36, height: 36, borderRadius: "50%" }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {formatParentName(p)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {p.gender === "male"
                      ? "Father / Guardian"
                      : "Mother / Guardian"}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/parents/edit/${p.id}`)}
                >
                  View
                </Button>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" onClick={() => navigate(-1)}>
          Back to List
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/students/edit/${id}`)}
          disabled={loading}
        >
          Edit Profile
        </Button>
      </Box>

      <Dialog
        open={openPaymentModal}
        onClose={() => setOpenPaymentModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Process School Fee Collection</DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Select Months to Cover:
          </Typography>
          <Box
            sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 3 }}
          >
            {tuitionSchedule.map((m) => (
              <FormControlLabel
                key={m.id}
                control={
                  <Checkbox
                    checked={selectedMonths.includes(m.id)}
                    disabled={m.status === "paid"}
                    onChange={() => handleMonthToggle(m)}
                  />
                }
                label={
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: 400,
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: m.status === "overdue" ? 600 : 400 }}
                    >
                      {m.month} (
                      {m.status === "paid"
                        ? "Fully Paid"
                        : `${(m.amount_due - m.amount_paid).toLocaleString()} AR Remaining`}
                      )
                    </Typography>
                    {m.status === "overdue" && (
                      <Chip label="Overdue" color="error" size="small" />
                    )}
                  </Box>
                }
              />
            ))}
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Amount Received (AR)"
                type="number"
                value={paymentAmount}
                onChange={(e) =>
                  setPaymentAmount(parseFloat(e.target.value) || 0)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                select
                label="Payment Gateway / Mode"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="Cash">Cash (Espèces)</MenuItem>
                <MenuItem value="Mvola">Mvola</MenuItem>
                <MenuItem value="AirtelMoney">Airtel Money</MenuItem>
                <MenuItem value="OrangeMoney">Orange Money</MenuItem>
                <MenuItem value="Bank">Bank Transfer / Check</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Transaction Reference (if applicable)"
                placeholder="e.g. Mvola Reference, Check #, ID"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Internal Audit Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenPaymentModal(false)} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleProcessPayment}
            disabled={processingPayment || paymentAmount <= 0}
          >
            Post Receipt
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default StudentDetails;
