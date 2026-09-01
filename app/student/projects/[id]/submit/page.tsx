"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type StudentLogin = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function SubmitProjectPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [student, setStudent] = useState<StudentLogin | null>(null);
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedStudent = localStorage.getItem("verovex_student");

    if (!savedStudent) {
      router.push("/student/login");
      return;
    }

    try {
      const parsedStudent: StudentLogin = JSON.parse(savedStudent);
      setStudent(parsedStudent);
    } catch {
      localStorage.removeItem("verovex_student");
      router.push("/student/login");
    }
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!student) {
      setError("Please login as a student first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/student/projects/${id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": student.email,
        },
        body: JSON.stringify({
          description,
          fileUrl,
        }),
      });

      const text = await response.text();

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          `Server returned invalid response: ${text || "empty response"}`
        );
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit work.");
      }

      setMessage(result.message || "Work submitted successfully!");

      setTimeout(() => {
        router.push(`/student/projects/${id}`);
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit work."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">
            VeroVex
          </h1>

          <p className="text-sm text-gray-500">
            Submit Project
          </p>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">

        <div className="rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-2xl font-bold">
            Submit Your Work
          </h2>

          <p className="mt-2 text-gray-500">
            Provide a description of your completed work or a file link.
          </p>

          {message && (
            <div className="mt-6 rounded-lg bg-green-50 p-4 text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">

            <div>
              <label className="block text-sm font-semibold">
                Work Description
              </label>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the work you completed..."
                rows={6}
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">
                File URL
              </label>

              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="Paste your Google Drive / GitHub / file link"
                className="mt-2 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">

              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border px-5 py-3 font-semibold hover:bg-gray-100"
              >
                Back
              </button>

              <button
                type="submit"
                disabled={loading || !student}
                className="flex-1 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Work"}
              </button>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}