import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

import {
  Card,
  CardContent,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Box,
  Button,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import SecurityIcon from "@mui/icons-material/Security";
import BackupIcon from "@mui/icons-material/Backup";
import BusinessIcon from "@mui/icons-material/Business";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import { useState } from "react";
import { useThemeMode } from "@/hooks/Themecontext";

const Settings = () => {
  const { isDark, toggle } = useThemeMode();
  const [checked, setChecked] = useState(isDark);
  const handleSwitch = (event) => {
    setChecked(event.target.checked);
  };
  return (
    <AppLayout>
      <PageHeader
        title="Settings"
        subtitle="Security, backups and multi-campus configuration"
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <SecurityIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Security
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Two-factor authentication (2FA)"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Single Sign-On (SSO)"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="GDPR compliance mode"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Force password rotation (90 days)"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <BackupIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Backups
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Daily automatic backup"
                />
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Last backup</Typography>
                  <Chip size="small" color="success" label="Today, 03:00" />
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2">Retention</Typography>
                  <Chip size="small" label="30 days" />
                </Stack>
                <Button variant="outlined" size="small" sx={{ mt: 1 }}>
                  Run backup now
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <ColorLensIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Theme
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Stack spacing={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={checked}
                      onClick={toggle}
                      onChange={handleSwitch}
                    />
                  }
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {checked ? (
                        <>
                          <DarkModeIcon fontSize="small" />
                          <span>Dark Mode</span>
                        </>
                      ) : (
                        <>
                          <LightModeIcon fontSize="small" />
                          <span>Light Mode</span>
                        </>
                      )}
                    </Box>
                  }
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <BusinessIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={700}>
                  Multi-campus
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Establishment name"
                    defaultValue="Scholara Group"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Active campuses"
                    defaultValue="Tunis, Sousse, Sfax"
                  />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={1} mt={2}>
                <Chip label="Tunis (main)" color="primary" />
                <Chip label="Sousse" />
                <Chip label="Sfax" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </AppLayout>
  );
};

export default Settings;
