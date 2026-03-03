import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import DealSearch from "./pages/DealSearch";
import DealDetails from "./pages/DealDetails";
import Negotiation from "./pages/Negotiation";
import Agreement from "./pages/Agreement";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<DealSearch />} />
        <Route path="/deal" element={<DealDetails />} />
        <Route path="/negotiate" element={<Negotiation />} />
        <Route path="/agreement" element={<Agreement />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}