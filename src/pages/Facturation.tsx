import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

const initialInvoices = [
  { id: 1, invoiceNo: "INV-001", student: "Ahmed Ben Ali", amount: "1,500 DT", date: "2026-03-01", dueDate: "2026-03-31", status: "Paid" },
  { id: 2, invoiceNo: "INV-002", student: "Sarah Bouazizi", amount: "1,500 DT", date: "2026-03-01", dueDate: "2026-03-31", status: "Pending" },
  { id: 3, invoiceNo: "INV-003", student: "Fatma Chaari", amount: "1,500 DT", date: "2026-02-01", dueDate: "2026-02-28", status: "Overdue" },
  { id: 4, invoiceNo: "INV-004", student: "Khaled Mansouri", amount: "750 DT", date: "2026-03-05", dueDate: "2026-04-05", status: "Pending" },
];

const statusColor = (s: string) => s === "Paid" ? "success" : s === "Pending" ? "warning" : "error";

const Facturation = () => {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Record<string, string>>({});
  const { enqueueSnackbar } = useSnackbar();

  const filtered = invoices.filter((inv) =>
    inv.student.toLowerCase().includes(search.toLowerCase()) ||
    inv.invoiceNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.student || !form.amount) { enqueueSnackbar("Please fill required fields", { variant: "error" }); return; }
    const num = invoices.length + 1;
    setInvoices([...invoices, {
      id: num, invoiceNo: `INV-${String(num).padStart(3, "0")}`, student: form.student, amount: form.amount,
      date: form.date || new Date().toISOString().split("T")[0], dueDate: form.dueDate || "", status: "Pending",
    }]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Invoice created", { variant: "success" });
  };

  const columns = [
    { key: "invoiceNo", label: "Invoice #" },
    { key: "student", label: "Student" },
    { key: "amount", label: "Amount" },
    { key: "date", label: "Date", hideOnMobile: true },
    { key: "dueDate", label: "Due Date", hideOnMobile: true },
    {
      key: "status", label: "Status",
      render: (row: typeof initialInvoices[0]) => <Chip label={row.status} size="small" color={statusColor(row.status) as any} />,
    },
  ];

  return (
    <AppLayout>
      <PageHeader title="Facturation" subtitle="Manage invoices and billing" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Create Invoice</Button>
      } />
      <TextField placeholder="Search invoices..." size="small" value={search} onChange={(e) => setSearch(e.target.value)} sx={{ mb: 2, maxWidth: 360, width: "100%" }} />
      <DataTable columns={columns} data={filtered} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Invoice</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Student *" value={form.student || ""} onChange={(e) => setForm({ ...form, student: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Amount *" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.date || ""} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Due Date" type="date" InputLabelProps={{ shrink: true }} value={form.dueDate || ""} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Create</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default Facturation;
