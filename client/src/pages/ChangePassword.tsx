import { useState } from "react";
import {
  Box, Card, CardContent, TextField, Button, Typography, Stack,
  IconButton, InputAdornment, Alert, LinearProgress, Divider, List, ListItem, ListItemIcon, ListItemText,
} from "@mui/material";
import PageHeader from "@/components/PageHeader";
import LockResetIcon from "@mui/icons-material/LockReset";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useSnackbar } from "notistack";

const checks = (pw: string) => ({
  length: pw.length >= 8,
  upper: /[A-Z]/.test(pw),
  number: /[0-9]/.test(pw),
  special: /[^A-Za-z0-9]/.test(pw),
});

const ChangePassword = () => {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const c = checks(next);
  const score = Object.values(c).filter(Boolean).length * 25;
  const valid = Object.values(c).every(Boolean);
  const color: any = score < 50 ? "error" : score < 75 ? "warning" : "success";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !next || !confirm) { setError("All fields are required"); return; }
    if (!valid) { setError("Password does not meet requirements"); return; }
    if (next !== confirm) { setError("New passwords do not match"); return; }
    if (next === current) { setError("New password must differ from current"); return; }
    setError("");
    enqueueSnackbar("Password changed successfully (mockup)", { variant: "success" });
    setCurrent(""); setNext(""); setConfirm("");
  };

  const Req = ({ ok, label }: { ok: boolean; label: string }) => (
    <ListItem dense disableGutters>
      <ListItemIcon sx={{ minWidth: 28 }}>
        {ok ? <CheckCircleIcon color="success" fontSize="small" /> : <RadioButtonUncheckedIcon fontSize="small" color="disabled" />}
      </ListItemIcon>
      <ListItemText primary={<Typography variant="body2" color={ok ? "success.main" : "text.secondary"}>{label}</Typography>} />
    </ListItem>
  );

  return (
    <>
      <PageHeader title="Change Password" subtitle="Update your account password regularly to stay secure" />
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Card sx={{ width: "100%", maxWidth: 560 }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
              <LockResetIcon color="primary" />
              <Typography variant="subtitle1" fontWeight={700}>Update password</Typography>
            </Stack>
            <Divider sx={{ mb: 3 }} />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <TextField
                  fullWidth label="Current password" type={show ? "text" : "password"}
                  value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShow(!show)} edge="end">
                          {show ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth label="New password" type={show ? "text" : "password"}
                  value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password"
                />
                {next && (
                  <Box>
                    <LinearProgress variant="determinate" value={score} color={color} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                )}
                <TextField
                  fullWidth label="Confirm new password" type={show ? "text" : "password"}
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password"
                  error={!!confirm && confirm !== next}
                  helperText={!!confirm && confirm !== next ? "Passwords do not match" : ""}
                />

                <Box sx={{ bgcolor: "background.default", p: 2, borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>PASSWORD REQUIREMENTS</Typography>
                  <List dense sx={{ py: 0 }}>
                    <Req ok={c.length} label="At least 8 characters" />
                    <Req ok={c.upper} label="One uppercase letter" />
                    <Req ok={c.number} label="One number" />
                    <Req ok={c.special} label="One special character" />
                  </List>
                </Box>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button onClick={() => { setCurrent(""); setNext(""); setConfirm(""); setError(""); }}>Cancel</Button>
                  <Button type="submit" variant="contained">Update Password</Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};

export default ChangePassword;
