import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Doc { id: number; ref: string; student: string; type: string; issued: string; verified: boolean; }

const initial: Doc[] = [
  { id: 1, ref: "DIP-2025-0142", student: "Lina Riahi", type: "Licence Computer Science", issued: "2025-07-15", verified: true },
  { id: 2, ref: "ATT-2026-0019", student: "Karim Saadi", type: "Enrollment certificate", issued: "2026-02-10", verified: true },
  { id: 3, ref: "DIP-2024-0098", student: "Sami Lakhal", type: "Master Data Engineering", issued: "2024-09-20", verified: false },
];

const Diplomas = () => {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Doc>>({});
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.student || !form.type) { enqueueSnackbar("Student and type required", { variant: "error" }); return; }
    const ref = `DOC-${new Date().getFullYear()}-${String(items.length + 1).padStart(4, "0")}`;
    setItems([...items, { id: items.length + 1, ref, student: form.student!, type: form.type!, issued: new Date().toISOString().slice(0, 10), verified: true }]);
    setForm({}); setOpen(false);
    enqueueSnackbar(`Document ${ref} issued`, { variant: "success" });
  };

  const columns = [
    { key: "ref", label: "Reference", render: (r: Doc) => <Chip size="small" label={r.ref} /> },
    { key: "student", label: "Student" },
    { key: "type", label: "Document" },
    { key: "issued", label: "Issued", hideOnMobile: true },
    { key: "verified", label: "Verified", render: (r: Doc) => <Chip size="small" label={r.verified ? "Verified" : "Pending"} color={r.verified ? "success" : "warning"} /> },
  ];

  return (
    <AppLayout>
      <PageHeader title="Diplomas & Certificates" subtitle="Issuance and verification" action={
        <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Issue Document</Button>
      } />
      <DataTable columns={columns} data={items} onView={() => {}} />

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Issue Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Student *" value={form.student || ""} onChange={(e) => setForm({ ...form, student: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Type *" value={form.type || ""} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Issue</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default Diplomas;
