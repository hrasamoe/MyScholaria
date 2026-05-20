import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Card,
  CardContent,
  Box,
  Stack,
  Skeleton,
} from "@mui/material";

interface DataTableSkeletonProps {
  columnCount?: number;
  rowCount?: number;
  hasActions?: boolean;
}

function DataTableSkeleton({
  columnCount = 4,
  rowCount = 5,
  hasActions = true,
}: DataTableSkeletonProps) {
  const rows = Array.from({ length: rowCount });
  const columns = Array.from({ length: columnCount });

  return (
    <>
      {/* Mobile card view skeleton */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <Stack spacing={1.5}>
          {rows.map((_, rowIndex) => (
            <Card key={rowIndex}>
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                {columns.map((_, colIndex) => (
                  <Box
                    key={colIndex}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 0.5,
                    }}
                  >
                    <Skeleton variant="text" width="30%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                ))}
                {hasActions && (
                  <Stack
                    direction="row"
                    spacing={1}
                    mt={1.5}
                    pt={1.5}
                    sx={{ borderTop: 1, borderColor: "divider" }}
                  >
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={30}
                      sx={{ borderRadius: 1 }}
                    />
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={30}
                      sx={{ borderRadius: 1 }}
                    />
                  </Stack>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>

      {/* Desktop table view skeleton */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                {columns.map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    <Skeleton variant="text" width="60%" height={24} />
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell align="right">
                    <Skeleton
                      variant="text"
                      width="40%"
                      height={24}
                      sx={{ ml: "auto" }}
                    />
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton variant="text" width="80%" height={20} />
                    </TableCell>
                  ))}
                  {hasActions && (
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={24}
                          sx={{ borderRadius: 1 }}
                        />
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={24}
                          sx={{ borderRadius: 1 }}
                        />
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </>
  );
}

export default DataTableSkeleton;
