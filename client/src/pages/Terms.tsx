import React from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import GavelIcon from "@mui/icons-material/Gavel";
import SecurityIcon from "@mui/icons-material/Security";
import SchoolIcon from "@mui/icons-material/School";

const Terms = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 4, md: 8 },
        bgcolor: "background.default",
        // background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.divider} 100%)`,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            boxShadow: theme.shadows[2],
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h3" fontWeight={800} gutterBottom>
            Terms of Service
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Last updated: May 2026
          </Typography>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <SchoolIcon color="primary" /> 1. Platform Purpose
            </Typography>
            <Typography color="text.secondary" paragraph>
              MyScholaria is a SaaS solution for school management. By using our
              services (Academic, Finance, and Communication portals), you agree
              to these terms.
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <GavelIcon color="primary" /> 2. Acceptable Use
            </Typography>
            <List>
              <ListItem disableGutters>
                <ListItemText
                  primary="Academic Integrity"
                  secondary="Users must not use the 'Grades' or 'Exams' modules to falsify information."
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText
                  primary="Communication"
                  secondary="The 'Messages' and 'Announcements' features must be used professionally and appropriately."
                />
              </ListItem>
            </List>
          </Box>

          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <SecurityIcon color="primary" /> 3. Data Ownership
            </Typography>
            <Typography color="text.secondary">
              The school remains the owner of its data. MyScholaria provides the
              technical infrastructure and ensures security through encryption
              and role-based access.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Terms;
