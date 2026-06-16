import { useEffect, useState } from "react";

async function checkRealInternet(): Promise<boolean> {
  try {
    const res = await fetch("https://myscholaria.onrender.com/api/health", {
      method: "GET",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  useEffect(() => {
    const handleOnline = () => {
      checkRealInternet().then(setIsOnline);
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const interval = setInterval(() => {
      if (navigator.onLine) {
        checkRealInternet().then(setIsOnline);
      } else {
        setIsOnline(false);
      }
    }, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);
  return isOnline;
}
