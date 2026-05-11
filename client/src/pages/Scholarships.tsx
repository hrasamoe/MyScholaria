import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, MenuItem } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Scholarship { id: number; student: string; type: string; amount: number; year: string; status: "Granted" | "Pending" | "Rejected"; }

const initial: Scholarship[] = [
  { id: 1, student: "Sarah Bouazizi", type: "Merit", amount: 1500, year: "2026-2027", status: "Granted" },
  { id: 2, student: "Youssef Trabelsi", type: "Social aid", amount: 800, year: "2026-2027", status: "Pending" },
  { id: 3, student: "Fatma Chaari", type: "Sports", amount: 1200, year: "2026-2027", status: "Granted" },
];

const statusColor: any = { Granted: "success", Pending: "warning", Rejected: "default" };

const Scholarships = () => {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Scholarship>>({ status: "Pending" });
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.student || !form.type) { enqueueSnackbar("Student and type required", { variant: "error" }); return; }
    setItems([...items, { id: items.length + 1, student: form.student!, type: form.type!, amount: Number(form.amount) || 0, year: form.year || "2026-2027", status: (form.status as any) || "Pending" }]);
    setForm({ status: "Pending" }); setOpen(false);
    enqueueSnackbar("Scholarship saved", { variant: "success" });
  };

  const columns = [
    { key: "student", label: "Student" },
    { key: "type", label: "Type" },
    { key: "amount", label: "Amount", render: (r: Scholarship) => `${r.amount} TND` },
    { key: "year", label: "Year", hideOnMobile: true },
    { key: "status", label: "Status", render: (r: Scholarship) => <Chip size="small" label={r.status} color={statusColor[r.status]} /> },
  ];

  return (
    <>
      <PageHeader title="Scholarships & Aid" subtitle="Financial aid management" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Scholarship</Button>
      } />
      <DataTable columns={columns} data={items} onView={() => {}} onEdit={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Scholarship</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Student *" value={form.student || ""} onChange={(e) => setForm({ ...form, student: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Type *" value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label="Amount (TND)" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Year" value={form.year || ""} onChange={(e) => setForm({ ...form, year: e.target.value })} /></Grid>
            <Grid size={12}>
              <TextField select fullWidth label="Status" value={form.status || "Pending"} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                {["Pending", "Granted", "Rejected"].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
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

export default Scholarships;
