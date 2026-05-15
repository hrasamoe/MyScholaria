import { useState, useEffect } from "react";

async function checkRealInternet(): Promise<boolean> {
  try {
    await fetch("https://www.google.com", {
      mode: "no-cors",
      method: "HEAD",
      cache: "no-store",
    });
    return true;
  } catch {
    return false;
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
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
    }, 5000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);
  return isOnline;
}
