"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ClientLogin = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function NewJobPage() {
  const router = useRouter();

  const [client, setClient] = useState<ClientLogin | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    skills: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedClient = localStorage.getItem("verovex_client");

    if (!savedClient) {
      router.push("/client/login");
      return;
    }

    try {
      const parsedClient: ClientLogin = JSON.parse(savedClient);

      if (parsedClient.role !== "CLIENT") {
        localStorage.removeItem("verovex_client");
        router.push("/client/login");
        return;
      }

      setClient(parsedClient);
    } catch {
      localStorage.removeItem("verovex_client");
      router.push("/client/login");
    }
  }, [router]);

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

    if (!client) {
      setMessage("Please login as a client first.");
      return;
    }

    setMessage("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/client/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": client.email,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to create job.");
        return;
      }

      setSuccess(true);
      setMessage("Job created successfully! 🎉");

      setForm({
        title: "",
        description: "",
        location: "",
        salary: "",
        skills: "",
      });
    } catch (error) {
      console.error(error);

      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              VeroVex
            </h1>

            <p className="text-sm text-gray-500">
              Post a Job
            </p>
          </div>

          <a
            href="/client/dashboard"
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            ← Dashboard
          </a>

        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">

        <div className="rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-3xl font-bold">
            Post a Job
          </h2>

          <p className="mt-2 text-gray-600">
            Create an opportunity for students on VeroVex.
          </p>

          {client && (
            <p className="mt-2 text-sm text-gray-500">
              Posting as: <span className="font-semibold">{client.email}</span>
            </p>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 flex flex-col gap-5"
          >

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Job Title
              </label>

              <input
                name="title"
                type="text"
                placeholder="e.g. Software Developer Intern"
                value={form.title}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                name="description"
                placeholder="Describe the role, responsibilities and requirements..."
                value={form.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Location
              </label>

              <input
                name="location"
                type="text"
                placeholder="e.g. Bengaluru / Remote"
                value={form.location}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Salary
              </label>

              <input
                name="salary"
                type="text"
                placeholder="e.g. ₹25,000/month"
                value={form.salary}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Skills
              </label>

              <input
                name="skills"
                type="text"
                placeholder="e.g. React, Next.js, PostgreSQL"
                value={form.skills}
                onChange={handleChange}
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-600"
              />

              <p className="mt-1 text-xs text-gray-500">
                Separate multiple skills with commas.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !client}
              className="mt-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Creating Job..." : "Create Job"}
            </button>

          </form>

          {message && (
            <div
              className={`mt-6 rounded-lg p-4 text-center ${
                success
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

        </div>

      </section>

    </main>
  );
}