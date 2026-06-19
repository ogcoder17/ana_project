import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DealSearch from "./pages/DealSearch";
import DealDetails from "./pages/DealDetails";
import Negotiation from "./pages/Negotiation";
import Agreement from "./pages/Agreement";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import SellerDashboard from "./pages/SellerDashboard";
import SellerNegotiation from "./pages/SellerNegotiation";
import Analytics from "./pages/Analytics";
// import AiAssistant from "./pages/AiAssistant";
import SellerHistory from "./pages/SellerHistory";

import ProtectedRoute from "./auth/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/search"
          element={
            <ProtectedRoute>
              <DealSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deal"
          element={
            <ProtectedRoute>
              <DealDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/negotiate"
          element={
            <ProtectedRoute>
              <Negotiation />
            </ProtectedRoute>
          }
        />
        
        <Route path="/agreement/:negotiationId" element={<Agreement />} />

        <Route
          path="/agreement"
          element={
            <ProtectedRoute>
              <Agreement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller"
          element={
            <ProtectedRoute>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/negotiation/:id"
          element={
            <ProtectedRoute>
              <SellerNegotiation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        {/* <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute>
              <AiAssistant />
            </ProtectedRoute>
          }
        /> */}
        
        <Route
          path="/seller-history"
          element={
            <ProtectedRoute>
              <SellerHistory />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}