"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role: "ADMIN",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      // Save admin information for admin pages/API requests
      localStorage.setItem(
        "verovex_admin",
        JSON.stringify({
          email: email,
          role: "ADMIN",
        })
      );

      setMessage("Admin login successful! 🎉");

      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 500);
    } catch (error) {
      console.error(error);

      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">

        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="text-3xl font-bold">
            VeroVex
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Administration Portal
          </p>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold">
          Admin Login
        </h1>

        <p className="mt-2 text-gray-600">
          Login to manage the VeroVex platform.
        </p>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gray-900 px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Admin Login"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <p className="mt-5 rounded-lg bg-gray-100 p-4 text-center text-sm">
            {message}
          </p>
        )}

        {/* Back */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            ← Back to VeroVex
          </a>
        </div>

      </div>
    </main>
  );
}