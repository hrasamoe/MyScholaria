import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/Authcontext";
import { useThemeMode } from "@/hooks/Themecontext";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { getMyEstablishments } from "@/services/establishment.service";
import BackupIcon from "@mui/icons-material/Backup";
import BusinessIcon from "@mui/icons-material/Business";
import CheckIcon from "@mui/icons-material/Check";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import SecurityIcon from "@mui/icons-material/Security";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useEffect, useRef, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;

const Settings = () => {
  const { isDark, toggle } = useThemeMode();
  const [establishment, setEstablishments] = useState<any>(null);
  const [checked, setChecked] = useState(isDark);
  const [loading, setLoading] = useState(false);
  const isOnline = useOnlineStatus();
  const [copiedJoinCode, setCopiedJoinCode] = useState(false);
  const [copiedAdminCode, setCopiedAdminCode] = useState(false);
  const handleSwitch = (event) => {
    setChecked(event.target.checked);
  };
  const handleCopy = (text: string, type: "join" | "admin") => {
    if (text) {
      navigator.clipboard.writeText(text);

      if (type === "join") {
        setCopiedJoinCode(true);
        setTimeout(() => setCopiedJoinCode(false), 2000);
      } else if (type === "admin") {
        setCopiedAdminCode(true);
        setTimeout(() => setCopiedAdminCode(false), 2000);
      }
    }
  };
  const { user } = useAuth();
  const isSearching = useRef(false);
  useEffect(() => {
    // if (isSearching.current) return;
    const userID = user.id;
    isSearching.current = true;
    setLoading(true);

    getMyEstablishments(userID)
      .then((establishments) => {
        setEstablishments(establishments);
      })
      .catch((error) => {
        console.error("FETCH ERROR:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isOnline]);
  return (
    <>
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
        {isOnline ? (
          <Grid size={12}>
            <Card>
              <CardContent>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <BusinessIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Establishment Information
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {loading ? (
                  <Typography>Loading...</Typography>
                ) : establishment ? (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Establishment name"
                        value={
                          establishment?.establishment_name ||
                          establishment?.name ||
                          ""
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Code"
                        value={establishment?.code || ""}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Identification Number"
                        value={establishment?.identification_number || ""}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Type"
                        value={
                          establishment?.type === "university"
                            ? "University"
                            : "Test"
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={establishment?.email || ""}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Phone"
                        value={establishment?.phone || ""}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 8 }}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={establishment?.address || ""}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        label="Zip Code"
                        value={
                          establishment?.zip_code ||
                          establishment?.zipCode ||
                          ""
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Join Code"
                        value={
                          establishment?.join_code ||
                          establishment?.joinCode ||
                          ""
                        }
                        slotProps={{
                          input: {
                            style: { fontFamily: "Roboto, sans-serif" },
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    handleCopy(
                                      establishment?.join_code ||
                                        establishment?.joinCode ||
                                        "",
                                      "join",
                                    )
                                  }
                                  edge="end"
                                  color={copiedJoinCode ? "success" : "default"}
                                >
                                  {copiedJoinCode ? (
                                    <CheckIcon fontSize="small" />
                                  ) : (
                                    <ContentCopyIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        label="Admin Code"
                        value={
                          establishment?.admin_code ||
                          establishment?.adminCode ||
                          ""
                        }
                        slotProps={{
                          input: {
                            style: { fontFamily: "Roboto, sans-serif" },
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  onClick={() =>
                                    handleCopy(
                                      establishment?.admin_code ||
                                        establishment?.adminCode ||
                                        "",
                                      "admin",
                                    )
                                  }
                                  edge="end"
                                  color={
                                    copiedAdminCode ? "success" : "default"
                                  }
                                >
                                  {copiedAdminCode ? (
                                    <CheckIcon fontSize="small" />
                                  ) : (
                                    <ContentCopyIcon fontSize="small" />
                                  )}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Typography color="error">No establishment found</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
    </>
  );
};

export default Settings;
