import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { useAuth } from "../auth/AuthContext";

export default function Signup() {
  const nav = useNavigate();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("buyer");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      setLoading(true);
      await signup({ name, email, password, role });
      nav("/");
    } catch (ex) {
      setErr(ex.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">✨ Create account</h2>
          <div className="muted">Buyer or Seller</div>
        </div>

        <div className="card" style={{ maxWidth: 520 }}>
          <form onSubmit={submit}>
            <div className="field">
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="select">
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            {err ? <div className="error">⚠️ {err}</div> : null}

            <div className="row" style={{ marginTop: 10 }}>
              <Button variant="primary" type="submit">
                {loading ? "⏳ Creating..." : "✅ Sign up"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => nav("/login")}>
                🔐 Go to Login
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}