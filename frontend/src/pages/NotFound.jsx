import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";

export default function NotFound() {
  const nav = useNavigate();
  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="empty">
          <div className="empty__t">404 😵</div>
          <div className="empty__s">Page not found</div>
          <div className="row" style={{ marginTop: 12 }}>
            <Button variant="primary" onClick={() => nav("/")}>🏠 Go Home</Button>
          </div>
        </div>
      </main>
    </div>
  );
}