"use client";

import { FormEvent, useState } from "react";

export default function ClientRegisterPage() {
  const [form, setForm] = useState({
    companyName: "",
    name: "",
    email: "",
    password: "",
    phone: "",
    website: "",
    address: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register-client", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Registration failed.");
        return;
      }

      setSuccess(true);
      setMessage(
        "Client account created successfully! 🎉"
      );

      setForm({
        companyName: "",
        name: "",
        email: "",
        password: "",
        phone: "",
        website: "",
        address: "",
      });
    } catch (error) {
      console.error(error);

      setMessage(
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-12">

      <div className="w-full max-w-lg rounded-xl bg-white p-8 shadow">

        <h1 className="text-3xl font-bold">
          Client Registration
        </h1>

        <p className="mt-2 text-gray-600">
          Create your VeroVex company account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4"
        >

          {/* Company Name */}
          <input
            name="companyName"
            type="text"
            placeholder="Company Name"
            value={form.companyName}
            onChange={handleChange}
            required
            className="rounded-lg border px-4 py-3"
          />

          {/* Contact Person */}
          <input
            name="name"
            type="text"
            placeholder="Contact Person Name"
            value={form.name}
            onChange={handleChange}
            required
            className="rounded-lg border px-4 py-3"
          />

          {/* Email */}
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="rounded-lg border px-4 py-3"
          />

          {/* Password */}
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            className="rounded-lg border px-4 py-3"
          />

          {/* Phone */}
          <input
            name="phone"
            type="tel"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            className="rounded-lg border px-4 py-3"
          />

          {/* Website */}
          <input
            name="website"
            type="url"
            placeholder="Website (optional)"
            value={form.website}
            onChange={handleChange}
            className="rounded-lg border px-4 py-3"
          />

          {/* Address */}
          <textarea
            name="address"
            placeholder="Company Address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="rounded-lg border px-4 py-3"
          />

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : "Create Client Account"}
          </button>

        </form>

        {/* Message */}
        {message && (
          <p
            className={`mt-5 rounded-lg p-4 text-center ${
              success
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

        {/* Login */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}

          <a
            href="/client/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Client Login
          </a>
        </p>

      </div>

    </main>
  );
}