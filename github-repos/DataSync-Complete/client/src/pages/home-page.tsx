import { useEffect } from "react";
import { useLocation } from "wouter";
import Dashboard from "./dashboard";

export default function HomePage() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Redirect to dashboard page
    navigate("/");
  }, [navigate]);
  
  return <Dashboard />;
}
