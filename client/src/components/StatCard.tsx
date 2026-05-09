import { ReactNode } from "react";
import { Card, CardContent, Box, Typography } from "@mui/material";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  color?: "primary" | "success" | "warning" | "error";
}

const StatCard = ({ title, value, icon, trend, color = "primary" }: StatCardProps) => (
  <Card>
    <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
      <Box>
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} color="text.primary" mt={0.5}>
          {value}
        </Typography>
        {trend && (
          <Typography variant="caption" color="success.main" fontWeight={500} mt={0.5}>
            {trend}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: `${color}.main`,
          color: `${color}.contrastText`,
          opacity: 0.15,
          display: "flex",
          position: "relative",
        }}
      >
        <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 1 }}>
          {icon}
        </Box>
      </Box>
      {/* icon rendered separately for full opacity */}
    </CardContent>
  </Card>
);

// Simpler approach with proper icon rendering
const StatCardFixed = ({ title, value, icon, trend, color = "primary" }: StatCardProps) => (
  <Card>
    <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, "&:last-child": { pb: 2 } }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap>
          {title}
        </Typography>
        <Typography variant="h5" fontWeight={700} color="text.primary" mt={0.5}>
          {value}
        </Typography>
        {trend && (
          <Typography variant="caption" color="success.main" fontWeight={500} display="block" mt={0.5}>
            {trend}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: (theme) => theme.palette[color]?.main + "1A",
          color: `${color}.main`,
          display: "flex",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
    </CardContent>
  </Card>
);

export default StatCardFixed;
