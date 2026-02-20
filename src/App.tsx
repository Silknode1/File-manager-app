import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from "./components/layout/Header";
import { ScanSetup } from "./components/scan/ScanSetup";
import { ScanProgress } from "./components/scan/ScanProgress";
import { ResultsView } from "./components/results/ResultsView";
import { useScanStore } from "./store/scanStore";

export default function App() {
  const { view, darkMode } = useScanStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-surface-0">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {view === "setup" && <ScanSetup key="setup" />}
            {view === "scanning" && <ScanProgress key="scanning" />}
            {view === "results" && <ResultsView key="results" />}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
