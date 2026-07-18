import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import { apiRequest } from "@/services/api.service";
import Grid from "@mui/material/Grid";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Autocomplete,
  Tabs,
  Tab,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";

interface Book {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  year: number | null;
  category: string | null;
  total_copies: number;
  available_copies: number;
  location: string | null;
}

interface Loan {
  id: string;
  loan_date: string;
  due_date: string;
  return_date: string | null;
  fine_amount: number | null;
  book_id: string;
  book_title: string;
  borrower_type: "student" | "teacher";
  borrower_first_name: string;
  borrower_last_name: string;
  // Computed server-side on every read (see getLoans): "active" flips
  // to "overdue" once due_date has passed, without needing a cron job
  // to update the stored value.
  status: "active" | "returned" | "overdue" | "lost";
}

// Combined shape used to search across both students and teachers when
// picking a borrower in the "New Loan" dialog.
interface BorrowerOption {
  id: string;
  label: string;
  type: "student" | "teacher";
}

const STATUS_COLOR: Record<
  Loan["status"],
  "success" | "warning" | "error" | "default"
> = {
  active: "default",
  returned: "success",
  overdue: "error",
  lost: "error",
};

const Library = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Tab 0 = Catalog, Tab 1 = Active Loans, Tab 2 = History
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState({
    total_copies: 0,
    available_copies: 0,
    active_loans: 0,
    overdue_loans: 0,
  });
  const [borrowers, setBorrowers] = useState<BorrowerOption[]>([]);

  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [bookForm, setBookForm] = useState<Record<string, string>>({});

  const [loanDialogOpen, setLoanDialogOpen] = useState(false);
  const [loanBook, setLoanBook] = useState<Book | null>(null);
  const [loanBorrower, setLoanBorrower] = useState<BorrowerOption | null>(null);
  const [loanDueDate, setLoanDueDate] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null);
  const [returnTarget, setReturnTarget] = useState<Loan | null>(null);
  const [fineAmount, setFineAmount] = useState("");

  const [actionLoading, setActionLoading] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [booksRes, loansRes, statsRes, studentsRes, teachersRes] =
        await Promise.all([
          apiRequest("/api/library/books", { credentials: "include" }),
          apiRequest("/api/library/loans", { credentials: "include" }),
          apiRequest("/api/library/stats", { credentials: "include" }),
          apiRequest("/api/students/list", { credentials: "include" }),
          apiRequest("/api/teachers/get-list", { credentials: "include" }),
        ]);

      if (booksRes.ok) setBooks(await booksRes.json());
      if (loansRes.ok) setLoans(await loansRes.json());
      if (statsRes.ok) setStats(await statsRes.json());

      // Merge students and teachers into a single searchable borrower
      // list for the "New Loan" dialog's Autocomplete.
      const borrowerOptions: BorrowerOption[] = [];
      if (studentsRes.ok) {
        const students = await studentsRes.json();
        students.forEach((s: any) =>
          borrowerOptions.push({
            id: s.id,
            label: `${s.first_name} ${s.last_name} (Student)`,
            type: "student",
          }),
        );
      }
      if (teachersRes.ok) {
        const teachers = await teachersRes.json();
        teachers.forEach((t: any) =>
          borrowerOptions.push({
            id: t.id,
            label: `${t.first_name} ${t.last_name} (Teacher)`,
            type: "teacher",
          }),
        );
      }
      setBorrowers(borrowerOptions);
    } catch (error) {
      enqueueSnackbar("Error loading library data", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Same underlying data (loans), split into two views purely on the
  // frontend. Nothing is deleted or archived in the database when a
  // loan is returned — it just moves from one filtered list to the
  // other because its status field changes.
  const activeLoans = useMemo(
    () => loans.filter((l) => l.status === "active" || l.status === "overdue"),
    [loans],
  );

  const loanHistory = useMemo(
    () => loans.filter((l) => l.status === "returned" || l.status === "lost"),
    [loans],
  );

  // Book CRUD

  const handleOpenCreateBook = () => {
    setSelectedBook(null);
    setBookForm({
      title: "",
      author: "",
      isbn: "",
      publisher: "",
      year: "",
      category: "",
      totalCopies: "1",
      location: "",
    });
    setBookDialogOpen(true);
  };

  const handleOpenEditBook = (book: Book) => {
    setSelectedBook(book);
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn || "",
      publisher: book.publisher || "",
      year: book.year?.toString() || "",
      category: book.category || "",
      totalCopies: book.total_copies.toString(),
      location: book.location || "",
    });
    setBookDialogOpen(true);
  };

  const handleSaveBook = async () => {
    if (!bookForm.title || !bookForm.author || !bookForm.totalCopies) {
      enqueueSnackbar("Title, author and total copies are required", {
        variant: "error",
      });
      return;
    }

    const payload = {
      isbn: bookForm.isbn || undefined,
      title: bookForm.title,
      author: bookForm.author,
      publisher: bookForm.publisher || undefined,
      year: bookForm.year ? parseInt(bookForm.year) : undefined,
      category: bookForm.category || undefined,
      totalCopies: parseInt(bookForm.totalCopies),
      location: bookForm.location || undefined,
    };

    try {
      setActionLoading(true);
      const url = selectedBook
        ? `/api/library/books/${selectedBook.id}`
        : "/api/library/books";
      const method = selectedBook ? "PUT" : "POST";
      const res = await apiRequest(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      enqueueSnackbar(selectedBook ? "Book updated" : "Book added", {
        variant: "success",
      });
      setBookDialogOpen(false);
      fetchAll();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error saving book", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBook = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      const res = await apiRequest(`/api/library/books/${deleteTarget.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Archiving failed");
      enqueueSnackbar("Book archived", { variant: "success" });
      setDeleteTarget(null);
      fetchAll();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error archiving book", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Loans

  const handleOpenLoanDialog = (book?: Book) => {
    setLoanBook(book || null);
    setLoanBorrower(null);
    setLoanDueDate("");
    setLoanDialogOpen(true);
  };

  const handleCreateLoan = async () => {
    if (!loanBook || !loanBorrower || !loanDueDate) {
      enqueueSnackbar("Please select a book, a borrower and a due date", {
        variant: "error",
      });
      return;
    }

    try {
      setActionLoading(true);
      const res = await apiRequest("/api/library/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          bookID: loanBook.id,
          borrowerID: loanBorrower.id,
          borrowerType: loanBorrower.type,
          dueDate: loanDueDate,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      enqueueSnackbar("Loan created", { variant: "success" });
      setLoanDialogOpen(false);
      fetchAll();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error creating loan", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnLoan = async () => {
    if (!returnTarget) return;
    try {
      setActionLoading(true);
      const res = await apiRequest(
        `/api/library/loans/${returnTarget.id}/return`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            fineAmount: fineAmount ? parseFloat(fineAmount) : undefined,
          }),
        },
      );
      if (!res.ok) throw new Error("Return failed");
      enqueueSnackbar("Book marked as returned", { variant: "success" });
      setReturnTarget(null);
      setFineAmount("");
      fetchAll();
    } catch (error: any) {
      enqueueSnackbar(error.message || "Error returning book", {
        variant: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const bookColumns = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    {
      key: "category",
      label: "Category",
      render: (r: Book) => r.category || "N/A",
    },
    {
      key: "available_copies",
      label: "Available",
      render: (r: Book) => (
        <Chip
          label={`${r.available_copies} / ${r.total_copies}`}
          size="small"
          color={r.available_copies > 0 ? "success" : "error"}
        />
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (r: Book) => r.location || "N/A",
    },
    {
      key: "actions",
      label: "Actions",
      render: (r: Book) => (
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            size="small"
            disabled={r.available_copies <= 0}
            onClick={() => handleOpenLoanDialog(r)}
          >
            <LibraryBooksIcon
              fontSize="small"
              color={r.available_copies > 0 ? "primary" : "disabled"}
            />
          </IconButton>
          <IconButton size="small" onClick={() => handleOpenEditBook(r)}>
            <EditIcon fontSize="small" color="primary" />
          </IconButton>
          <IconButton size="small" onClick={() => setDeleteTarget(r)}>
            <DeleteIcon fontSize="small" color="error" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Used for the "Active Loans" tab: shows the Return action.
  const loanColumns = [
    {
      key: "borrower",
      label: "Borrower",
      render: (r: Loan) =>
        `${r.borrower_first_name} ${r.borrower_last_name} (${r.borrower_type})`,
    },
    { key: "book_title", label: "Book" },
    { key: "due_date", label: "Due Date" },
    {
      key: "status",
      label: "Status",
      render: (r: Loan) => (
        <Chip label={r.status} size="small" color={STATUS_COLOR[r.status]} />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (r: Loan) => (
        <Button
          size="small"
          startIcon={<AssignmentReturnIcon />}
          onClick={() => setReturnTarget(r)}
        >
          Return
        </Button>
      ),
    },
  ];

  // Used for the "History" tab: read-only, shows return date and fine
  // instead of an action button since these loans are already closed.
  const historyColumns = [
    {
      key: "borrower",
      label: "Borrower",
      render: (r: Loan) =>
        `${r.borrower_first_name} ${r.borrower_last_name} (${r.borrower_type})`,
    },
    { key: "book_title", label: "Book" },
    { key: "loan_date", label: "Loan Date" },
    {
      key: "return_date",
      label: "Return Date",
      render: (r: Loan) => r.return_date || "—",
    },
    {
      key: "fine_amount",
      label: "Fine",
      render: (r: Loan) =>
        r.fine_amount ? `${Number(r.fine_amount).toLocaleString()} AR` : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (r: Loan) => (
        <Chip label={r.status} size="small" color={STATUS_COLOR[r.status]} />
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Library"
        subtitle="Manage the book catalog and track loans"
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<LibraryBooksIcon />}
              onClick={() => handleOpenLoanDialog()}
            >
              New Loan
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateBook}
            >
              Add Book
            </Button>
          </Box>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Copies"
            value={loading ? "—" : stats.total_copies}
            icon={<MenuBookIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Available Now"
            value={loading ? "—" : stats.available_copies}
            icon={<LibraryBooksIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Active Loans"
            value={loading ? "—" : stats.active_loans}
            icon={<AssignmentReturnIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Overdue"
            value={loading ? "—" : stats.overdue_loans}
            icon={<WarningAmberIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Catalog" />
        <Tab label={`Active Loans (${activeLoans.length})`} />
        <Tab label="History" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {Array.from(new Array(5)).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width="100%"
              height={50}
              sx={{ borderRadius: 1 }}
            />
          ))}
        </Box>
      ) : tab === 0 ? (
        <DataTable columns={bookColumns} data={books} />
      ) : tab === 1 ? (
        <DataTable columns={loanColumns} data={activeLoans} />
      ) : (
        <DataTable columns={historyColumns} data={loanHistory} />
      )}

      {/* Add / Edit Book */}
      <Dialog
        open={bookDialogOpen}
        onClose={() => setBookDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedBook ? "Edit Book" : "Add New Book"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Title *"
                value={bookForm.title || ""}
                onChange={(e) =>
                  setBookForm({ ...bookForm, title: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Author *"
                value={bookForm.author || ""}
                onChange={(e) =>
                  setBookForm({ ...bookForm, author: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="ISBN"
                value={bookForm.isbn || ""}
                onChange={(e) =>
                  setBookForm({ ...bookForm, isbn: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Publisher"
                value={bookForm.publisher || ""}
                onChange={(e) =>
                  setBookForm({ ...bookForm, publisher: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Year"
                value={bookForm.year || ""}
                onChange={(e) =>
                  setBookForm({ ...bookForm, year: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                label="Category"
                value={bookForm.category || ""}
                onChange={(e) =>
                  setBookForm({ ...bookForm, category: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="Total Copies *"
                value={bookForm.totalCopies || ""}
                onChange={(e) =>
                  setBookForm({ ...bookForm, totalCopies: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Shelf Location"
                value={bookForm.location || ""}
                onChange={(e) =>
                  setBookForm({ ...bookForm, location: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setBookDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleSaveBook}
            disabled={actionLoading}
          >
            {actionLoading ? "Saving..." : "Save Book"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* New Loan */}
      <Dialog
        open={loanDialogOpen}
        onClose={() => setLoanDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Loan</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={books.filter((b) => b.available_copies > 0)}
                getOptionLabel={(b) =>
                  `${b.title} (${b.available_copies} available)`
                }
                value={loanBook}
                onChange={(_, v) => setLoanBook(v)}
                renderInput={(params) => (
                  <TextField {...params} label="Book *" />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Autocomplete
                options={borrowers}
                getOptionLabel={(b) => b.label}
                value={loanBorrower}
                onChange={(_, v) => setLoanBorrower(v)}
                renderInput={(params) => (
                  <TextField {...params} label="Borrower *" />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                type="date"
                label="Due Date *"
                InputLabelProps={{ shrink: true }}
                value={loanDueDate}
                onChange={(e) => setLoanDueDate(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setLoanDialogOpen(false)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleCreateLoan}
            disabled={actionLoading}
          >
            {actionLoading ? "Saving..." : "Create Loan"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Return Loan */}
      <Dialog open={!!returnTarget} onClose={() => setReturnTarget(null)}>
        <DialogTitle>Mark as Returned</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="number"
            label="Fine Amount (optional)"
            helperText="Leave empty if no penalty applies. No automatic rate is configured — enter the amount manually if needed."
            sx={{ mt: 1 }}
            value={fineAmount}
            onChange={(e) => setFineAmount(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setReturnTarget(null)}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleReturnLoan}
            disabled={actionLoading}
          >
            {actionLoading ? "Saving..." : "Confirm Return"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Book */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Archive Book</DialogTitle>
        <DialogContent>
          Are you sure you want to remove <strong>{deleteTarget?.title}</strong>{" "}
          from the active catalog? Its loan history will be preserved.
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={actionLoading}
          >
            No
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDeleteBook}
            disabled={actionLoading}
          >
            {actionLoading ? "Archiving..." : "Yes, Archive"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Library;
