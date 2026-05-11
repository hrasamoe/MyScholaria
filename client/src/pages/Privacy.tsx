import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Alert,
  AlertTitle,
  useTheme,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import ChildCareIcon from "@mui/icons-material/ChildCare";

const Privacy = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="md">
        <Paper
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            boxShadow: theme.shadows[2],
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h3" fontWeight={800} color={theme.palette.text.primary}>
              Privacy Policy
            </Typography>

            <Alert severity="info" icon={<ChildCareIcon fontSize="inherit" />}>
              <AlertTitle sx={{ fontWeight: 700 }}>
                GDPR Compliance (Protection of Minors)
              </AlertTitle>
              Since MyScholaria handles data for students, we strictly comply with
              EU regulations. Parental consent is required for students under 15
              via the ParentPortal.
            </Alert>

            <Box>
              <Typography variant="h5" fontWeight={700} gutterBottom>
                Data Collection
              </Typography>
              <Typography color="text.secondary" paragraph>
                We collect personal identifiers (Names, Emails), academic
                records (Grades, Attendance), and financial data (Payments) to
                fulfill our service to your institution.
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <LockIcon fontSize="small" /> Security Standards
              </Typography>
              <Typography color="text.secondary">
                Data is encrypted in transit (TLS) and at rest (AES). We store
                financial records for 10 years and connection logs for 12 months
                as per legal requirements.
              </Typography>
            </Box>

            <Box sx={{ p: 3, bgcolor: "action.hover", borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Your Rights
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Under GDPR, you have the right to access, rectify, or delete
                your data. Please contact your school administrator or our DPO
                for requests.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Privacy;
