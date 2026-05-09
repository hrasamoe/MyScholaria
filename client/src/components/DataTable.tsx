import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
} from "@mui/material";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onView?: (row: T) => void;
}

function DataTable<T extends Record<string, any>>({ columns, data, onEdit, onView }: DataTableProps<T>) {
  return (
    <>
      {/* Mobile card view */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {data.length === 0 ? (
          <Card><CardContent><Typography color="text.secondary" align="center" variant="body2">No data available</Typography></CardContent></Card>
        ) : (
          <Stack spacing={1.5}>
            {data.map((row, i) => (
              <Card key={i}>
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  {columns.map((col) => (
                    <Box key={col.key} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                        {col.label}
                      </Typography>
                      <Typography variant="body2" color="text.primary" textAlign="right">
                        {col.render ? col.render(row) : row[col.key]}
                      </Typography>
                    </Box>
                  ))}
                  {(onEdit || onView) && (
                    <Stack direction="row" spacing={1} mt={1.5} pt={1.5} sx={{ borderTop: 1, borderColor: "divider" }}>
                      {onView && <Button size="small" variant="outlined" fullWidth onClick={() => onView(row)}>View</Button>}
                      {onEdit && <Button size="small" variant="outlined" fullWidth onClick={() => onEdit(row)}>Edit</Button>}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Box>

      {/* Desktop table view */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: 600,
                      color: "text.secondary",
                      display: col.hideOnMobile ? { xs: "none", lg: "table-cell" } : undefined,
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
                {(onEdit || onView) && (
                  <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary" }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + 1} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, i) => (
                  <TableRow key={i} hover>
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        sx={{ display: col.hideOnMobile ? { xs: "none", lg: "table-cell" } : undefined }}
                      >
                        {col.render ? col.render(row) : row[col.key]}
                      </TableCell>
                    ))}
                    {(onEdit || onView) && (
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {onView && <Button size="small" onClick={() => onView(row)}>View</Button>}
                          {onEdit && <Button size="small" onClick={() => onEdit(row)}>Edit</Button>}
                        </Stack>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}

export default DataTable;
