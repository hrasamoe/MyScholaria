import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import DataTable from "@/components/DataTable";
import { Button, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Tabs, Tab, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

interface Book { id: number; title: string; author: string; category: string; copies: number; available: number; }
interface Loan { id: number; book: string; borrower: string; loanDate: string; dueDate: string; status: "On loan" | "Returned" | "Overdue"; }

const initialBooks: Book[] = [
  { id: 1, title: "Le Petit Prince", author: "A. de Saint-Exupéry", category: "Fiction", copies: 8, available: 3 },
  { id: 2, title: "Algebra Linear", author: "G. Strang", category: "Math", copies: 5, available: 5 },
  { id: 3, title: "World History", author: "P. Frankopan", category: "History", copies: 4, available: 2 },
];

const initialLoans: Loan[] = [
  { id: 1, book: "Le Petit Prince", borrower: "Sarah Bouazizi", loanDate: "2026-04-15", dueDate: "2026-05-15", status: "On loan" },
  { id: 2, book: "World History", borrower: "Ahmed Ben Ali", loanDate: "2026-03-01", dueDate: "2026-04-01", status: "Overdue" },
  { id: 3, book: "Le Petit Prince", borrower: "Fatma Chaari", loanDate: "2026-02-10", dueDate: "2026-03-10", status: "Returned" },
];

const loanColor: any = { "On loan": "info", Returned: "success", Overdue: "error" };

const Library = () => {
  const [tab, setTab] = useState(0);
  const [books, setBooks] = useState(initialBooks);
  const [loans] = useState(initialLoans);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Book>>({});
  const { enqueueSnackbar } = useSnackbar();

  const handleAdd = () => {
    if (!form.title) { enqueueSnackbar("Title required", { variant: "error" }); return; }
    const c = Number(form.copies) || 1;
    setBooks([...books, { id: books.length + 1, title: form.title!, author: form.author || "", category: form.category || "", copies: c, available: c }]);
    setForm({}); setOpen(false);
    enqueueSnackbar("Book added", { variant: "success" });
  };

  const bookCols = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author", hideOnMobile: true },
    { key: "category", label: "Category", render: (r: Book) => <Chip size="small" label={r.category} /> },
    { key: "copies", label: "Copies" },
    { key: "available", label: "Available", render: (r: Book) => <Chip size="small" label={r.available} color={r.available > 0 ? "success" : "default"} /> },
  ];

  const loanCols = [
    { key: "book", label: "Book" },
    { key: "borrower", label: "Borrower" },
    { key: "loanDate", label: "Loan", hideOnMobile: true },
    { key: "dueDate", label: "Due" },
    { key: "status", label: "Status", render: (r: Loan) => <Chip size="small" label={r.status} color={loanColor[r.status]} /> },
  ];

  return (
    <AppLayout>
      <PageHeader title="Library" subtitle="Catalog and loans management" action={
        tab === 0 ? <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Book</Button> : undefined
      } />

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Catalog (${books.length})`} />
          <Tab label={`Loans (${loans.length})`} />
        </Tabs>
      </Box>

      {tab === 0 && <DataTable columns={bookCols} data={books} onEdit={() => {}} />}
      {tab === 1 && <DataTable columns={loanCols} data={loans} />}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Book</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}><TextField fullWidth label="Title *" value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Author" value={form.author || ""} onChange={(e) => setForm({ ...form, author: e.target.value })} /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label="Category" value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></Grid>
            <Grid size={{ xs: 6 }}><TextField fullWidth type="number" label="Copies" value={form.copies || ""} onChange={(e) => setForm({ ...form, copies: Number(e.target.value) })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Save</Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default Library;
