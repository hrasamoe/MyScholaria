import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import {
  Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

const initialPayments = [
  { id: 1, student: "Ahmed Ben Ali", amount: "1,500 DT", method: "Cash", date: "2026-03-15", status: "Paid" },
  { id: 2, student: "Sarah Bouazizi", amount: "1,500 DT", method: "Bank Transfer", date: "2026-03-14", status: "Pending" },
  { id: 3, student: "Youssef Trabelsi", amount: "750 DT", method: "Cash", date: "2026-03-13", status: "Paid" },
  { id: 4, student: "Fatma Chaari", amount: "1,500 DT", method: "Check", date: "2026-03-10", status: "Overdue" },
];

const statusColor = (s: string) => s === "Paid" ? "success" : s === "Pending" ? "warning" : "error";

const Payments = () => {
  const [payments, setPayments] = useState(initialPayments);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const { enqueueSnackbar } = useSnackbar();

  const filtered = payments.filter((p) => p.student.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    if (!form.student || !form.amount) { enqueueSnackbar("Please fill required fields", { variant: "error" }); return; }
    setPayments([...payments, { id: payments.length + 1, student: form.student, amount: form.amount, method: form.method || "Cash", date: form.date || new Date().toISOString().split("T")[0], status: form.status || "Pending" }]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Payment recorded", { variant: "success" });
  };

  const columns = [
    { key: "student", label: "Student" },
    { key: "amount", label: "Amount" },
    { key: "method", label: "Method", hideOnMobile: true },
    { key: "date", label: "Date" },
    {
      key: "status", label: "Status",
      render: (row: typeof initialPayments[0]) => <Chip label={row.status} size="small" color={statusColor(row.status) as any} />,
    },
  ];

  return (
    <>
      <PageHeader title="Payments" subtitle="Track student payments" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Record Payment</Button>
      } />
      <TextField placeholder="Search payments..." size="small" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2, maxWidth: 360, width: "100%" }} />
      <DataTable columns={columns} data={filtered} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Student *" value={form.student || ""} onChange={(e) => setForm({ ...form, student: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Amount *" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Method</InputLabel>
                <Select value={form.method || ""} label="Method" onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
                  <MenuItem value="Check">Check</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select value={form.status || ""} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Payments;
