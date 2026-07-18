import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import DataTable from "@/components/DataTable";
import { useAuth } from "@/hooks/Authcontext";
import { apiRequest } from "@/services/api.service";
import Grid from "@mui/material/Grid";
import {
  Box,
  Chip,
  TextField,
  InputAdornment,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SearchIcon from "@mui/icons-material/Search";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

// Shape returned directly by GET /api/finance/overview.
// All amounts are pre-computed server-side (discounts, totals,
// balances) so the frontend does not need to re-derive anything.
interface StudentFinanceRow {
  id: string;
  name: string;
  class_name: string | null;
  student_number: string;
  totalDue: number;
  totalPaid: number;
  balance: number;
  hasOverdue: boolean;
  hasSetup: boolean;
}

interface FinanceTotals {
  expected: number;
  collected: number;
  remaining: number;
  unpaidCount: number;
}

type FilterMode = "all" | "unpaid" | "no_setup";

const FinanceOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const establishmentID = user?.establishment_id;

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<StudentFinanceRow[]>([]);
  const [totals, setTotals] = useState<FinanceTotals>({
    expected: 0,
    collected: 0,
    remaining: 0,
    unpaidCount: 0,
  });
  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  useEffect(() => {
    if (!establishmentID) return;

    const fetchOverview = async () => {
      try {
        setLoading(true);
        // Single aggregate call: the backend computes discounts,
        // totals, balances and overdue flags in SQL, so no per-student
        // fetch loop is needed here anymore.
        const res = await apiRequest(`/api/finance/overview`, {
          credentials: "include",
        });

        if (!res.ok) {
          const err = await res.json().catch(() => null);
          throw new Error(err?.message || "Failed to load finance overview");
        }

        const data = await res.json();
        setTotals(data.totals);
        setRows(data.students);
      } catch (error: any) {
        console.error("Error loading finance overview:", error);
        enqueueSnackbar(error.message || "Failed to load finance overview", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, [establishmentID, enqueueSnackbar]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.student_number.toLowerCase().includes(search.toLowerCase()) ||
        (r.class_name ?? "").toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filterMode === "unpaid") return r.balance > 0;
      if (filterMode === "no_setup") return !r.hasSetup;
      return true;
    });
  }, [rows, search, filterMode]);

  const columns = [
    { key: "name", label: "Student" },
    {
      key: "class_name",
      label: "Class",
      render: (r: StudentFinanceRow) => r.class_name || "N/A",
    },
    {
      key: "totalDue",
      label: "Total Expected",
      render: (r: StudentFinanceRow) => `${r.totalDue.toLocaleString()} AR`,
    },
    {
      key: "totalPaid",
      label: "Total Collected",
      render: (r: StudentFinanceRow) => `${r.totalPaid.toLocaleString()} AR`,
    },
    {
      key: "balance",
      label: "Remaining",
      render: (r: StudentFinanceRow) => `${r.balance.toLocaleString()} AR`,
    },
    {
      key: "status",
      label: "Status",
      render: (r: StudentFinanceRow) => {
        if (!r.hasSetup) {
          return <Chip label="No setup" size="small" variant="outlined" />;
        }
        if (r.hasOverdue) {
          return <Chip label="Overdue" size="small" color="error" />;
        }
        if (r.balance === 0) {
          return <Chip label="Fully paid" size="small" color="success" />;
        }
        return <Chip label="Pending" size="small" color="warning" />;
      },
    },
    {
      key: "actions",
      label: "",
      render: (r: StudentFinanceRow) => (
        <Box
          component="span"
          sx={{ color: "primary.main", cursor: "pointer", fontSize: "0.8rem" }}
          onClick={() => navigate(`/students/details/${r.id}`)}
        >
          View
        </Box>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Finance Overview"
        subtitle="Expected vs collected fees, and who still owes money"
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Expected"
            value={loading ? "—" : `${totals.expected.toLocaleString()} AR`}
            icon={<AccountBalanceIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Total Collected"
            value={loading ? "—" : `${totals.collected.toLocaleString()} AR`}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Remaining to Collect"
            value={loading ? "—" : `${totals.remaining.toLocaleString()} AR`}
            icon={<TrendingDownIcon />}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Students Owing Money"
            value={loading ? "—" : totals.unpaidCount}
            icon={<WarningAmberIcon />}
            color="warning"
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          mb: 2,
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          size="small"
          placeholder="Search by name, ID or class..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={loading}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ width: 300 }}
        />

        <ToggleButtonGroup
          size="small"
          value={filterMode}
          exclusive
          onChange={(_, value) => value && setFilterMode(value)}
          disabled={loading}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="unpaid">Owing money</ToggleButton>
          <ToggleButton value="no_setup">No setup</ToggleButton>
        </ToggleButtonGroup>
      </Box>

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
      ) : (
        <DataTable columns={columns} data={filteredRows} />
      )}
    </>
  );
};

export default FinanceOverview;
