import PageHeader from "@/components/PageHeader";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

interface ParentDetail {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  email: string | null;
  phone: string;
  address: string | null;
  profession: string | null;
}

const API_URL = import.meta.env.VITE_API_URL;

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

const ParentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [parent, setParent] = useState<ParentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchParentDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/utils/get-parent-details/${id}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Failed to load parent data");
        }

        const data: ParentDetail = await res.json();
        setParent(data);
      } catch (e: any) {
        enqueueSnackbar(e.message || "Error loading parent profile", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchParentDetails();
  }, [id, enqueueSnackbar]);

  const fullName = parent ? `${parent.first_name} ${parent.last_name}` : "";

  return (
    <Container sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <PageHeader
        title="Parent Profile"
        subtitle="Full administrative profile and contact links for this guardian"
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
              onClick={() => navigate(`/parents/edit/${id}`)}
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
                parent?.gender?.toLowerCase() === "female"
                  ? "/female.png"
                  : "/male.png"
              }
              sx={{ width: 64, height: 64 }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                {fullName}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {parent?.gender?.toLowerCase() === "female" ? "Mother / Legal Guardian" : "Father / Legal Guardian"}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => navigate("/parents/create")}
              >
                New Parent
              </Button>
            </Stack>
          </>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Personal Information
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="First Name"
              value={parent?.first_name}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Last Name"
              value={parent?.last_name}
              loading={loading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Gender" value={parent?.gender} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow
              label="Profession"
              value={parent?.profession}
              loading={loading}
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mt: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Contact Details & Address
        </Typography>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Phone Number" value={parent?.phone} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <InfoRow label="Email Address" value={parent?.email} loading={loading} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <InfoRow
              label="Home Address"
              value={parent?.address}
              loading={loading}
            />
          </Grid>
        </Grid>
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
          onClick={() => navigate(`/parents/edit/${id}`)}
          disabled={loading}
        >
          Edit Profile
        </Button>
      </Box>
    </Container>
  );
};

export default ParentDetails;