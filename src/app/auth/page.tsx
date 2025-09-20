"use client";
import { useState } from "react";
export default function AuthPage() {
  const [mode, setMode] = useState<"register" | "login" | "otp" | "anon">(
    "register",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [anonName, setAnonName] = useState("");
  const [message, setMessage] = useState("");
  const [jwt, setJwt] = useState<string | null>(null);
  const [_userId, setUserId] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Registered! Now login." : data.error || "Error");
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok && data.token && data.id) {
      setJwt(data.token);
      setUserId(data.id);
      setMessage("Logged in! Now verify OTP or set anon name.");
    } else {
      setMessage(data.error || "Error");
    }
  };

  const handleRequestOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMessage(
      res.ok ? `OTP sent! (mock: ${data.otp})` : data.error || "Error",
    );
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (res.ok && data.id) {
      setUserId(data.id);
      setMessage("OTP verified! Now choose your anonymous name.");
      setMode("anon");
    } else {
      setMessage(data.error || "Error");
    }
  };

  const handleSetAnonName = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    if (!jwt) {
      setMessage("You must be logged in to set anon name.");
      return;
    }
    const res = await fetch("/anon/set", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ anonName }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Anon name set! You are now anonymous as ${data.anonName}`);
      setMode("login");
    } else {
      setMessage(data.error || "Error");
    }
  };

  const inputClasses =
    "px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400";

  const buttonClasses = (active: boolean) =>
    `px-4 py-2 rounded font-medium border transition-colors duration-150 ${
      active
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-blue-600 border-blue-600 hover:bg-blue-50"
    }`;

  return (
    <div className="max-w-md mx-auto my-8 p-8 border border-gray-300 rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Auth Demo
      </h2>

      <div className="flex justify-center gap-2 mb-6">
        <button
          type="button"
          className={buttonClasses(mode === "register")}
          onClick={() => setMode("register")}
        >
          Register
        </button>
        <button
          type="button"
          className={buttonClasses(mode === "login")}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={buttonClasses(mode === "otp")}
          onClick={() => setMode("otp")}
        >
          OTP Auth
        </button>
      </div>

      {mode === "register" && (
        <form onSubmit={handleRegister} className="flex flex-col gap-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClasses}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClasses}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          >
            Register
          </button>
        </form>
      )}

      {mode === "login" && (
        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={inputClasses}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={inputClasses}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          >
            Login
          </button>
        </form>
      )}

      {mode === "otp" && (
        <>
          <form
            onSubmit={handleRequestOtp}
            className="flex flex-col gap-4 mb-4"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClasses}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
            >
              Request OTP
            </button>
          </form>

          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClasses}
            />
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className={inputClasses}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
            >
              Verify OTP
            </button>
          </form>
        </>
      )}

      {mode === "anon" && (
        <form onSubmit={handleSetAnonName} className="flex flex-col gap-4 mb-4">
          <input
            type="text"
            placeholder="Choose your anonymous name"
            value={anonName}
            onChange={(e) => setAnonName(e.target.value)}
            required
            className={inputClasses}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold"
          >
            Set Anon Name
          </button>
        </form>
      )}

      {message && (
        <div className="mt-4 text-green-600 text-center font-medium">
          {message}
        </div>
      )}
    </div>
  );
}
