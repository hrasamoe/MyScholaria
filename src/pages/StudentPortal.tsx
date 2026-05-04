import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, Typography, Box, Chip, List, ListItem, ListItemText, Divider, LinearProgress, Stack } from "@mui/material";
import Grid from "@mui/material/Grid";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

const StudentPortal = () => (
  <AppLayout>
    <PageHeader title="Student Portal" subtitle="Welcome back, Ahmed — Class 3A" />

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <CalendarMonthIcon color="primary" /><Typography variant="subtitle1" fontWeight={700}>Today's classes</Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              {[
                { t: "08:00 — 09:00", s: "Mathematics", r: "A101" },
                { t: "09:00 — 10:00", s: "French", r: "A105" },
                { t: "10:15 — 11:15", s: "Physics", r: "B203" },
                { t: "11:15 — 12:15", s: "History", r: "C301" },
              ].map((c, i) => (
                <ListItem key={i} secondaryAction={<Chip size="small" label={c.r} />}>
                  <ListItemText primary={c.s} secondary={c.t} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AssignmentIcon color="warning" /><Typography variant="subtitle1" fontWeight={700}>Upcoming homework</Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              <ListItem secondaryAction={<Chip size="small" label="Tomorrow" color="error" />}><ListItemText primary="Math — exercises p. 45" secondary="Mr. Dupont" /></ListItem>
              <ListItem secondaryAction={<Chip size="small" label="3 days" color="warning" />}><ListItemText primary="French — essay 200 words" secondary="Mrs. Bernard" /></ListItem>
              <ListItem secondaryAction={<Chip size="small" label="Next week" />}><ListItemText primary="Physics — lab report" secondary="Ms. Martin" /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <MenuBookIcon color="primary" /><Typography variant="subtitle1" fontWeight={700}>Term progress</Typography>
            </Box>
            <Stack spacing={2}>
              {[
                { s: "Mathematics", v: 80 },
                { s: "French", v: 65 },
                { s: "Physics", v: 85 },
                { s: "History", v: 55 },
              ].map((p, i) => (
                <Box key={i}>
                  <Stack direction="row" justifyContent="space-between"><Typography variant="body2">{p.s}</Typography><Typography variant="body2" color="text.secondary">{p.v}%</Typography></Stack>
                  <LinearProgress variant="determinate" value={p.v} sx={{ mt: 0.5, height: 8, borderRadius: 1 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </AppLayout>
);

export default StudentPortal;
