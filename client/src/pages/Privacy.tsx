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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import PolicyIcon from "@mui/icons-material/Policy";
import StorageIcon from "@mui/icons-material/Storage";
import ContactSupportIcon from "@mui/icons-material/ContactSupport";

const Privacy = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 6, md: 12 },
        bgcolor: "background.default",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          sx={{
            p: { xs: 4, md: 10 },
            borderRadius: 6,
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.1)",
          }}
        >
          <Stack spacing={6}>
            <Box>
              <Typography variant="h2" fontWeight={900}>
                Privacy Policy
              </Typography>
              <Typography variant="h6" color="text.secondary">
                Educational Data Protection & GDPR Alignment
              </Typography>
            </Box>

            <Divider />

            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                1. Data Processing Architecture
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                We collect data through four primary channels: Direct User
                Entry, Institutional Imports, Automated System Logs, and
                Third-Party OAuth providers.
              </Typography>

              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mt: 4 }}
              >
                <Table>
                  <TableHead sx={{ bgcolor: "action.hover" }}>
                    <TableRow>
                      <TableCell>
                        <strong>Data Cluster</strong>
                      </TableCell>
                      <TableCell>
                        <strong>SQL Table Reference</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Retention Period</strong>
                      </TableCell>
                      <TableCell>
                        <strong>Encryption Level</strong>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Identity</TableCell>
                      <TableCell>`profiles`, `users`</TableCell>
                      <TableCell>Active Account + 5 years</TableCell>
                      <TableCell>AES-256</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Academic Records</TableCell>
                      <TableCell>`grades`, `exams`, `attendance`</TableCell>
                      <TableCell>Lifetime of Institution</TableCell>
                      <TableCell>AES-256</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Disciplinary/Health</TableCell>
                      <TableCell>
                        `disciplinary_actions`, `medical_notes`
                      </TableCell>
                      <TableCell>End of School Year + 1 year</TableCell>
                      <TableCell>Table-Level Encryption</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>System Behavior</TableCell>
                      <TableCell>`audit_logs`, `refresh_tokens`</TableCell>
                      <TableCell>Rolling 12 months</TableCell>
                      <TableCell>Encrypted Logs</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                2. Use of Sub-Processors
              </Typography>
              <Typography variant="body1" paragraph>
                To provide the "2099-feeling" performance, MyScholaria leverages
                premium sub-processors:
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <StorageIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Database Infrastructure"
                    secondary="Supabase/PostgreSQL (Hosted on AWS Regions). Data is physically isolated using separate schemas."
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <VerifiedUserIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Authentication"
                    secondary="Google/GitHub OAuth. We never store raw passwords; only secure hashes."
                  />
                </ListItem>
              </List>
            </Box>

            <Box
              sx={{
                p: 4,
                bgcolor: "action.selected",
                borderRadius: 3,
                borderLeft: "8px solid",
                borderColor: "primary.main",
              }}
            >
              <Typography variant="h5" fontWeight={800} gutterBottom>
                3. The "Right to be Forgotten" in Education
              </Typography>
              <Typography variant="body2" paragraph>
                GDPR Article 17 grants the right to erasure. However, in an
                educational context, legal obligations regarding academic
                transcripts (`diplomas`, `grades`) may override immediate
                deletion requests.
              </Typography>
              <Typography variant="body2">
                We will anonymize profile data while preserving the integrity of
                academic history required for government audits or future
                transcript verification.
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 2 }}
              >
                <PolicyIcon /> 4. Audit & Transparency
              </Typography>
              <Typography variant="body1">
                Every action taken by an Administrator (e.g., deleting a
                student, modifying a salary in `staff`) is captured in our
                immutable Audit Logs. These logs are available for review by the
                Institution's Data Protection Officer (DPO).
              </Typography>
            </Box>

            <Divider />

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={4}
              alignItems="center"
            >
              <ContactSupportIcon sx={{ fontSize: 60, opacity: 0.2 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Questions or Compliance Reports?
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Contact our Legal & Privacy team at{" "}
                  <a
                    href="mailto:hrasamoevj@gmail.com"
                    style={{
                      fontWeight: 'bold',
                      color: theme.palette.text.primary
                    }}
                  >
                    hrasamoevj@gmail.com
                  </a>
                  {/* . Physical inquiries can be directed to our headquarters in
                  Antananarivo, Madagascar. */}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default Privacy;
