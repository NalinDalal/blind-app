"use client";
import { useState } from "react";

export default function AuthPage() {
  const [mode, setMode] = useState<'register'|'login'|'otp'>('register');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) setMessage("Registered! Now login.");
    else setMessage(data.error || "Error");
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) setMessage("Logged in!");
    else setMessage(data.error || "Error");
  }

  async function handleRequestOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/request-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (res.ok) setMessage(`OTP sent! (mock: ${data.otp})`);
    else setMessage(data.error || "Error");
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    const data = await res.json();
    if (res.ok) setMessage("OTP verified!");
    else setMessage(data.error || "Error");
  }

  return (
    <div className="max-w-md mx-auto my-8 p-8 border border-gray-300 rounded-lg bg-white shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Auth Demo</h2>
      <div className="flex justify-center gap-2 mb-6">
        <button
          type="button"
          className={`px-4 py-2 rounded font-medium border transition-colors duration-150 ${mode === 'register' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}
          onClick={() => setMode('register')}
        >
          Register
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded font-medium border transition-colors duration-150 ${mode === 'login' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}
          onClick={() => setMode('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={`px-4 py-2 rounded font-medium border transition-colors duration-150 ${mode === 'otp' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-blue-600 hover:bg-blue-50'}`}
          onClick={() => setMode('otp')}
        >
          OTP Auth
        </button>
      </div>
      {mode === 'register' && (
        <form onSubmit={handleRegister} className="flex flex-col gap-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">Register</button>
        </form>
      )}
      {mode === 'login' && (
        <form onSubmit={handleLogin} className="flex flex-col gap-4 mb-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">Login</button>
        </form>
      )}
      {mode === 'otp' && (
        <>
          <form onSubmit={handleRequestOtp} className="flex flex-col gap-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">Request OTP</button>
          </form>
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="text"
              placeholder="OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              required
              className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold">Verify OTP</button>
          </form>
        </>
      )}
      {message && (
        <div className="mt-4 text-green-600 text-center font-medium">{message}</div>
      )}
    </div>
  );
}
