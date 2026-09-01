"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [skills, setSkills] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Get the currently logged-in client
      const storedClient = localStorage.getItem("verovex_client");

      if (!storedClient) {
        setError("Please login as a client first.");
        return;
      }

      const client = JSON.parse(storedClient);

      if (!client.email) {
        setError("Client email not found. Please login again.");
        return;
      }

      const response = await fetch("/api/client/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": client.email,
        },
        body: JSON.stringify({
          title,
          description,
          location,
          paymentAmount,
          skills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create project.");
        return;
      }

      router.push("/client/dashboard");
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">VeroVex</h1>

            <p className="text-sm text-gray-500">
              Create Project
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
            Create a Project
          </h2>

          <p className="mt-2 text-gray-600">
            Create an opportunity for students on VeroVex.
          </p>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            <div>
              <label className="text-sm font-semibold">
                Project Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="e.g. Build a company website"
                required
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Describe the project and what the student needs to do..."
                required
                rows={6}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-semibold">
                  Location
                </label>

                <input
                  type="text"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  placeholder="e.g. Bangalore / Remote"
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Payment Amount (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentAmount}
                  onChange={(event) =>
                    setPaymentAmount(event.target.value)
                  }
                  placeholder="e.g. 15000"
                  required
                  className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">
                Required Skills
              </label>

              <input
                type="text"
                value={skills}
                onChange={(event) =>
                  setSkills(event.target.value)
                }
                placeholder="e.g. React, Next.js, PostgreSQL"
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-sm text-gray-500">
                Separate multiple skills with commas.
              </p>
            </div>

            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <a
                href="/client/dashboard"
                className="rounded-lg border px-6 py-3 text-center font-semibold hover:bg-gray-100"
              >
                Cancel
              </a>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}