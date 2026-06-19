import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    try {
      setErr("");
      setLoading(true);
      await login({ email, password });
      nav("/");
    } catch (ex) {
      setErr(ex.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <div className="pageHead">
          <h2 className="h2">🔐 Login</h2>
          <div className="muted">Welcome back</div>
        </div>

        <div className="card" style={{ maxWidth: 520 }}>
          <form onSubmit={submit}>
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

            {err ? <div className="error">⚠️ {err}</div> : null}

            <div className="row" style={{ marginTop: 10 }}>
              <Button variant="primary" type="submit">
                {loading ? "⏳ Logging in..." : "✅ Login"}
              </Button>
              <Button variant="ghost" type="button" onClick={() => nav("/signup")}>
                ✨ Create account
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}