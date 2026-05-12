import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography, Button } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useAuth } from "@/hooks/Authcontext";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { saveAuth } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("error");
      return;
    }

    fetch(
      `${import.meta.env.VITE_API_URL}/api/auth/verify-email?token=${token}`,
    )
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          saveAuth(data.user, data.accessToken, data.refreshToken);
          setStatus("success");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
    >
      {status === "loading" && (
        <>
          <CircularProgress />
          <Typography>Vérification de votre e-mail...</Typography>
        </>
      )}

      {status === "success" && (
        <>
          <CheckCircleIcon sx={{ fontSize: 64, color: "success.main" }} />
          <Typography variant="h5" fontWeight={700}>
            E-mail vérifié !
          </Typography>
          <Typography color="text.secondary">
            Votre compte est maintenant activé.
            <br />
            Veuillez renseigner les informations de votre établissement (code
            d’identification, adresse) pour continuer.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/auth/etablissement")}
            sx={{ mt: 2 }}
          >
            Continuer
          </Button>
        </>
      )}

      {status === "error" && (
        <>
          <ErrorIcon sx={{ fontSize: 64, color: "error.main" }} />
          <Typography variant="h5" fontWeight={700}>
            Lien invalide
          </Typography>
          <Typography color="text.secondary">
            Ce lien est expiré ou invalide.
          </Typography>
          <Button variant="outlined" onClick={() => navigate("/auth/signup")}>
            S’inscrire de nouveau
          </Button>
        </>
      )}
    </Box>
  );
}
