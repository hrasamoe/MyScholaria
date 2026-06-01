import PageHeader from "@/components/PageHeader";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SchoolIcon from "@mui/icons-material/School";
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
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  parent_ids: string[];
  parent_first_name?: string | null;
  parent_last_name?: string | null;
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

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/students/details/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to load student data");
        }

        const data: StudentDetail = await res.json();
        setStudent(data);

        if (data.parent_first_name || data.parent_last_name) {
          setParents([
            {
              id: data.parent_ids?.[0] || "",
              first_name: data.parent_first_name || "",
              last_name: data.parent_last_name || "",
              gender: "male",
            },
          ]);
        } else {
          setParents([]);
        }

        try {
          const resTeacher = await fetch(
            `${API_URL}/api/students/teacher/${id}`,
            {
              credentials: "include",
            },
          );
          if (resTeacher.ok) {
            const t = await resTeacher.json();
            setTeacher(t || null);
          }
        } catch (teacherError) {
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
  }, [id, enqueueSnackbar]);

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
                color="primary"
                startIcon={<SchoolIcon />}
                onClick={() => navigate(`/students/edit/${id}`)}
              >
                Change Class
              </Button>
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
                  sx={{
                    cursor: "pointer",
                    // bgcolor: "primary.main",
                    color: "white",
                    fontWeight: 500,
                  }}
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
            justifyContent: "space-between",
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
    </Container>
  );
};

export default StudentDetails;
