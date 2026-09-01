"use client";

import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    college: "",
    course: "",
    graduationYear: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setMessage("");

    // Make sure every field is filled
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.phone ||
      !form.college ||
      !form.course ||
      !form.graduationYear
    ) {
      setMessage("Please fill in all student details.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.message || "Registration failed."
        );
        return;
      }

      setMessage(
        "Student account created successfully! 🎉"
      );

      setForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        college: "",
        course: "",
        graduationYear: "",
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
    <main className="min-h-screen bg-gray-50 px-6 py-12">

      <div className="mx-auto max-w-lg rounded-xl bg-white p-8 shadow">

        <h1 className="text-3xl font-bold">
          Student Registration
        </h1>

        <p className="mt-2 text-gray-600">
          Create your VeroVex student account.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col gap-4"
        >

          {/* Name */}
          <input
            name="name"
            placeholder="Full Name"
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
            required
            className="rounded-lg border px-4 py-3"
          />

          {/* College */}
          <input
            name="college"
            placeholder="College"
            value={form.college}
            onChange={handleChange}
            required
            className="rounded-lg border px-4 py-3"
          />

          {/* Course */}
          <input
            name="course"
            placeholder="Course"
            value={form.course}
            onChange={handleChange}
            required
            className="rounded-lg border px-4 py-3"
          />

          {/* Graduation Year */}
          <input
            name="graduationYear"
            type="number"
            placeholder="Graduation Year"
            value={form.graduationYear}
            onChange={handleChange}
            required
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
              : "Create Student Account"}
          </button>

        </form>

        {/* Message */}
        {message && (
          <p className="mt-5 rounded-lg bg-gray-100 p-4 text-center">
            {message}
          </p>
        )}

      </div>

    </main>
  );
}