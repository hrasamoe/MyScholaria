import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import SchoolIcon from "@mui/icons-material/School";
import PaymentsIcon from "@mui/icons-material/Payments";
import BusinessIcon from "@mui/icons-material/Business";
import WarningIcon from "@mui/icons-material/Warning";

const Terms = () => {
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
          elevation={0}
          sx={{
            p: { xs: 4, md: 10 },
            borderRadius: 6,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack spacing={2} mb={8}>
            <Typography
              variant="overline"
              color="primary"
              fontWeight={800}
              letterSpacing={2}
            >
              LEGAL FRAMEWORK v1.0.0
            </Typography>
            <Typography variant="h2" fontWeight={900}>
              Master Terms of Service
            </Typography>
            <Typography variant="body1" color="text.secondary">
              These terms govern the entire MyScholaria ecosystem. Please read
              sections regarding
              <strong> Liability </strong> and <strong> Data Ownership </strong>{" "}
              with extreme care.
            </Typography>
          </Stack>

          <Alert
            severity="warning"
            variant="filled"
            sx={{ mb: 8, fontSize: 16, borderRadius: 3 }}
          >
            <strong>NOTICE:</strong> MyScholaria is a technical intermediary. We
            do not provide educational instruction, nor do we certify the
            validity of diplomas or grades entered by Institutions.
          </Alert>

          {/* SECTION 1: PROVISION OF SERVICE */}
          <Box sx={{ mb: 8 }}>
            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <BusinessIcon fontSize="large" color="primary" /> 1. Provision of
              SaaS Platform
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              1.1 <strong>License Grant:</strong> MyScholaria grants the
              Institution a non-exclusive, non-transferable, revocable license
              to access the platform. This license is strictly limited to
              educational management purposes within the scope of the subscribed
              establishment.
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              1.2 <strong>Modifications:</strong> We reserve the right to deploy
              updates, patches, and "futuristic" UI enhancements at any time.
              While we strive for backwards compatibility, some legacy features
              may be deprecated with a 30-day notice.
            </Typography>
          </Box>

          <Divider sx={{ mb: 6 }} />

          {/* DETAILED ACCORDIONS */}
          <Typography variant="h5" fontWeight={800} mb={4}>
            Detailed Operational Framework
          </Typography>

          <Accordion
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              mb: 3,
              borderRadius: "12px !important",
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: "action.hover" }}
            >
              <Typography fontWeight={700} variant="h6">
                2. Identity & Role-Based Access Control (RBAC)
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4 }}>
              <Typography variant="body2" paragraph>
                2.1 <strong>Account Security:</strong> You are responsible for
                maintaining the confidentiality of your OAuth2 tokens and
                session cookies. MyScholaria implements Row-Level Security (RLS)
                at the database layer, but this does not protect against "social
                engineering" or shared passwords.
              </Typography>
              <Typography variant="body2" paragraph>
                2.2 <strong>Profiles & Impersonation:</strong> Using the
                'Profiles' table to misrepresent qualifications or identity is a
                material breach. Administrators must verify the 'is_active'
                status of staff members weekly to prevent unauthorized access by
                terminated employees.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              mb: 3,
              borderRadius: "12px !important",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: "action.hover" }}
            >
              <Typography fontWeight={700} variant="h6">
                3. Financial Integrity & Invoicing
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4 }}>
              <Typography variant="body2" paragraph>
                3.1 <strong>Automatic Calculations:</strong> The 'Invoices'
                module calculates totals based on 'unit_price' and 'quantity'.
                While we ensure the logic is mathematically sound ($Total = \sum
                (q \times p)$), the Institution must audit final invoices before
                sending them to students.
              </Typography>
              <Typography variant="body2" paragraph>
                3.2 <strong>Scholarships & Waivers:</strong> Scholarship entries
                in the 'Scholarships' table are deductive records only.
                MyScholaria does not provide the funds for these discounts.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              mb: 3,
              borderRadius: "12px !important",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{ bgcolor: "action.hover" }}
            >
              <Typography fontWeight={700} variant="h6">
                4. Intellectual Property & Database Schema
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 4 }}>
              <Typography variant="body2" paragraph>
                4.1 <strong>Proprietary Rights:</strong> The structure, logic,
                and code behind the tables (e.g., `coursebook`, `timetable`,
                `audit_logs`) are protected trade secrets.
              </Typography>
              <Typography variant="body2">
                4.2 <strong>Data Export:</strong> Upon termination, the
                Institution has 30 days to export raw data in CSV or JSON
                format. After this period, MyScholaria reserves the right to
                permanently delete the database instance to free up resources.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Box
            sx={{
              mt: 8,
              p: 5,
              bgcolor: "#421717",
              color: "#fff",
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h5"
              fontWeight={800}
              gutterBottom
              sx={{ color: theme.palette.text.secondary }}
            >
              5. Limitation of Liability & Force Majeure
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, opacity: 0.9 }}>
              In no event shall Scholara be liable for any consequential,
              indirect, or special damages. This includes but is not limited to:
              <ol>
                <li>Loss of academic progress data</li>
                <li> Reputational damage due to public announcements</li>
                <li>Financial losses due to incorrect invoice generation</li>
                <li> Unauthorized access to sensitive student documents</li>
              </ol>
              Our total liability is capped at the amount paid by the
              institution during the previous 6 months.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Terms;
