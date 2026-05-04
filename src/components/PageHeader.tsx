import { ReactNode } from "react";
import { Box, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

const PageHeader = ({ title, subtitle, action }: PageHeaderProps) => (
  <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: "space-between", gap: 2, mb: 3 }}>
    <Box>
      <Typography variant="h5" fontWeight={700} color="text.primary">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {subtitle}
        </Typography>
      )}
    </Box>
    {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
  </Box>
);

export default PageHeader;
