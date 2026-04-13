import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem("theme");
    if (stored === "light") return false;
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setDark((d) => !d)}
      className="w-9 h-9 rounded-xl border-border/60 bg-card/80 backdrop-blur-sm hover:bg-muted transition-all"
      title={dark ? "Modo claro" : "Modo escuro"}
    >
      {dark ? (
        <Sun className="w-4 h-4 text-yellow-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-muted-foreground transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}
