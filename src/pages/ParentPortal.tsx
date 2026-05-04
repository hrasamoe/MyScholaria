import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, Typography, Box, Chip, Stack, Avatar, Divider, List, ListItem, ListItemText, ListItemAvatar } from "@mui/material";
import Grid from "@mui/material/Grid";
import GradeIcon from "@mui/icons-material/Grade";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import MessageIcon from "@mui/icons-material/Message";
import PaymentIcon from "@mui/icons-material/Payment";

const ParentPortal = () => (
  <AppLayout>
    <PageHeader title="Parent Portal" subtitle="Family overview — Mr. Mohamed Ben Ali" />

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>AB</Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>Ahmed Ben Ali</Typography>
                <Typography variant="body2" color="text.secondary">Class 3A • Student #STD-001</Typography>
                <Chip size="small" label="Active" color="success" sx={{ mt: 0.5 }} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <GradeIcon color="primary" /><Typography variant="subtitle1" fontWeight={700}>Recent grades</Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              {[
                { s: "Mathematics", g: "16/20", c: "success" },
                { s: "French", g: "13/20", c: "warning" },
                { s: "Physics", g: "17/20", c: "success" },
              ].map((it, i) => (
                <ListItem key={i} secondaryAction={<Chip size="small" label={it.g} color={it.c as any} />}>
                  <ListItemText primary={it.s} />
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
              <EventBusyIcon color="warning" /><Typography variant="subtitle1" fontWeight={700}>Absences this term</Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>2 <Typography component="span" variant="body2" color="text.secondary">days</Typography></Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>Last absence: 2026-04-22 (justified)</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <PaymentIcon color="success" /><Typography variant="subtitle1" fontWeight={700}>Tuition</Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2">Next due: <strong>2026-05-30</strong></Typography>
            <Typography variant="body2">Amount: <strong>1 200 TND</strong></Typography>
            <Chip size="small" label="On schedule" color="success" sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <MessageIcon color="primary" /><Typography variant="subtitle1" fontWeight={700}>Messages from teachers</Typography>
            </Box>
            <Divider sx={{ mb: 1 }} />
            <List dense>
              <ListItem><ListItemAvatar><Avatar sx={{ bgcolor: "primary.main" }}>D</Avatar></ListItemAvatar>
                <ListItemText primary="Mr. Dupont — Math" secondary="Excellent progress this month. Keep practicing geometry exercises." /></ListItem>
              <ListItem><ListItemAvatar><Avatar sx={{ bgcolor: "warning.main" }}>B</Avatar></ListItemAvatar>
                <ListItemText primary="Mrs. Bernard — French" secondary="Please review reading homework — submission was incomplete." /></ListItem>
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </AppLayout>
);

export default ParentPortal;
