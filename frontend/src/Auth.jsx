
import { useState } from "react";
import { loginUser, registerUser } from "./services/api";
import "./Auth.css";

function Auth({ onClose, initialMode = "login", onAuthenticated }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = isRegister
        ? await registerUser({
            name: name.trim(),
            email: email.trim(),
            password,
          })
        : await loginUser({
            email: email.trim(),
            password,
          });

      const token = response?.token || response?.data?.token;
      const user = response?.user || response?.data?.user;

      if (!token || !user) {
        throw new Error("Authentication response is incomplete.");
      }

      localStorage.setItem("refoundToken", token);
      localStorage.setItem("refoundUser", JSON.stringify(user));

      onAuthenticated(user);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-heading">
        <div className="auth-logo">R</div>

        <h2>{isRegister ? "Create your account" : "Welcome back!"}</h2>

        <p>
          {isRegister
            ? "Join your campus community and help lost belongings find their way home."
            : "Log in to continue your ReFound journey."}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {isRegister && (
          <div>
            <label htmlFor="auth-name">Full name</label>
            <input
              id="auth-name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>
        )}

        <div>
          <label htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div>
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            autoComplete={isRegister ? "new-password" : "current-password"}
            required
          />
        </div>

        {isRegister && (
          <div>
            <label htmlFor="auth-confirm-password">
              Confirm password
            </label>
            <input
              id="auth-confirm-password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading
            ? "Please wait..."
            : isRegister
              ? "Create account →"
              : "Log in →"}
        </button>
      </form>

      <div className="auth-switch">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Log in
            </button>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Sign up
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Auth;
