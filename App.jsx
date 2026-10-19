import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import useDarkMode from "./hooks/useDarkMode";
import useSearchHistory from "./hooks/useSearchHistory";
import About from "./pages/About";
import Chat from "./pages/Chat";
import FAQ from "./pages/FAQ";
import Home from "./pages/Home";
import MedicineSearch from "./pages/MedicineSearch";
import StockSearch from "./pages/StockSearch";

export default function App() {
  const { dark, toggle } = useDarkMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const history = useSearchHistory();

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 transition-colors dark:bg-slate-900 dark:text-slate-100">
        <Navbar dark={dark} onToggleDark={toggle} onMenu={() => setSidebarOpen(true)} />
        <div className="flex flex-1">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} history={history} />
          <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/search" element={<MedicineSearch history={history} />} />
              <Route path="/stock" element={<StockSearch history={history} />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
        </div>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: "12px", background: dark ? "#1e293b" : "#fff", color: dark ? "#f1f5f9" : "#1e293b" },
          }}
        />
      </div>
    </BrowserRouter>
  );
}