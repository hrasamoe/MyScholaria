import AppLayout from "@/components/AppLayout";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import Grid from "@mui/material/Grid";
import { Chip } from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import SavingsIcon from "@mui/icons-material/Savings";

interface Entry { id: number; date: string; category: string; description: string; type: "Income" | "Expense"; amount: number; }

const ledger: Entry[] = [
  { id: 1, date: "2026-04-30", category: "Tuition", description: "April collected fees", type: "Income", amount: 42000 },
  { id: 2, date: "2026-04-28", category: "Salaries", description: "Teaching staff", type: "Expense", amount: 28000 },
  { id: 3, date: "2026-04-25", category: "Maintenance", description: "Building repairs", type: "Expense", amount: 3500 },
  { id: 4, date: "2026-04-20", category: "Tuition", description: "Late payments", type: "Income", amount: 6800 },
  { id: 5, date: "2026-04-15", category: "Supplies", description: "Lab materials", type: "Expense", amount: 2200 },
];

const Budget = () => {
  const income = ledger.filter(e => e.type === "Income").reduce((s, e) => s + e.amount, 0);
  const expense = ledger.filter(e => e.type === "Expense").reduce((s, e) => s + e.amount, 0);
  const balance = income - expense;

  const columns = [
    { key: "date", label: "Date" },
    { key: "category", label: "Category" },
    { key: "description", label: "Description", hideOnMobile: true },
    { key: "type", label: "Type", render: (r: Entry) => <Chip size="small" title={r.type} color={r.type === "Income" ? "success" : "warning"} /> },
    { key: "amount", label: "Amount", render: (r: Entry) => `${r.type === "Expense" ? "-" : "+"}${r.amount.toLocaleString()} TND` },
  ];

  return (
    <AppLayout>
      <PageHeader title="Budget & Accounting" subtitle="Income, expenses and balance" />
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Income" value={`${income.toLocaleString()} TND`} icon={<TrendingUpIcon />} color="success" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Expenses" value={`${expense.toLocaleString()} TND`} icon={<TrendingDownIcon />} color="warning" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Balance" value={`${balance.toLocaleString()} TND`} icon={<SavingsIcon />} color="primary" /></Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}><StatCard title="Budget Year" value="2026" icon={<AccountBalanceIcon />} color="primary" /></Grid>
      </Grid>
      <DataTable columns={columns} data={ledger} />
    </AppLayout>
  );
};

export default Budget;
