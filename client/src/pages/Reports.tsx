import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { Card, CardContent, Typography, Box, Stack, LinearProgress, Button, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import AssessmentIcon from "@mui/icons-material/Assessment";
import GroupIcon from "@mui/icons-material/Group";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import SchoolIcon from "@mui/icons-material/School";
import DownloadIcon from "@mui/icons-material/Download";

const Reports = () => (
  <>
    <PageHeader title="Reports & KPIs" subtitle="Strategic indicators dashboard" action={
      <Button variant="outlined" startIcon={<DownloadIcon />}>Export</Button>
    } />

    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Success rate" value="87%" icon={<AssessmentIcon />} color="success" /></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Attendance" value="94%" icon={<EventAvailableIcon />} color="primary" /></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Active students" value="1 248" icon={<SchoolIcon />} color="primary" /></Grid>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Staff" value="86" icon={<GroupIcon />} color="warning" /></Grid>
    </Grid>

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Success rate by level</Typography>
            <Stack spacing={2}>
              {[
                { l: "3rd Year", v: 92 },
                { l: "4th Year", v: 88 },
                { l: "5th Year", v: 85 },
                { l: "6th Year", v: 78 },
              ].map(r => (
                <Box key={r.l}>
                  <Stack direction="row" justifyContent="space-between"><Typography variant="body2">{r.l}</Typography><Typography variant="body2" color="text.secondary">{r.v}%</Typography></Stack>
                  <LinearProgress variant="determinate" value={r.v} color="success" sx={{ mt: 0.5, height: 8, borderRadius: 1 }} />
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Financial summary</Typography>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Tuition collected</Typography><Chip size="small" color="success" title="312 000 TND" /></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Outstanding balance</Typography><Chip size="small" color="warning" title="48 200 TND" /></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Operating expenses</Typography><Chip size="small" color="error" title="218 400 TND" /></Stack>
              <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Net result</Typography><Chip size="small" color="primary" title="+93 600 TND" /></Stack>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={12}>
        <Card>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>Available reports</Typography>
            <Grid container spacing={1.5}>
              {["Annual academic report", "Monthly attendance", "Tuition collection", "Staff performance", "Library usage", "Exam results"].map(t => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={t}>
                  <Card variant="outlined">
                    <CardContent sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", "&:last-child": { pb: 2 } }}>
                      <Typography variant="body2">{t}</Typography>
                      <Button size="small" startIcon={<DownloadIcon />}>PDF</Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </>
);

export default Reports;
