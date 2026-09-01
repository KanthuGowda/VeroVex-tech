"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  description: string;
  location?: string | null;
  paymentAmount: number;
  skills?: string | null;
  status: string;
  createdAt: string;
  hasApplied: boolean;
  client?: {
    companyName?: string | null;
    user?: {
      name?: string;
      email?: string;
    } | null;
  };
};

export default function OpportunitiesPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [applying, setApplying] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const storedStudent = localStorage.getItem("verovex_student");

      if (!storedStudent) {
        router.push("/student/login");
        return;
      }

      const student = JSON.parse(storedStudent);

      const response = await fetch("/api/student/opportunities", {
        headers: {
          "x-user-email": student.email,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load opportunities.");
      }

      setProjects(data.projects || []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load opportunities."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const applyForProject = async (projectId: string) => {
    try {
      setApplying(projectId);
      setError("");

      const storedStudent = localStorage.getItem("verovex_student");

      if (!storedStudent) {
        router.push("/student/login");
        return;
      }

      const student = JSON.parse(storedStudent);

      const response = await fetch("/api/student/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": student.email,
        },
        body: JSON.stringify({
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to apply.");
      }

      alert("Application submitted successfully!");

      await loadProjects();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Unable to submit application."
      );
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="mx-auto max-w-6xl">
          <p className="text-gray-600">Loading opportunities...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <button
            onClick={() => router.push("/student/dashboard")}
            className="mb-4 text-sm text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Project Opportunities
          </h1>

          <p className="mt-2 text-gray-600">
            Browse projects posted by all VeroVex clients.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-gray-800">
              No Open Projects
            </h2>

            <p className="mt-2 text-gray-500">
              There are currently no open projects available.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    {project.title}
                  </h2>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    OPEN
                  </span>
                </div>

                <p className="mb-4 text-sm text-gray-600">
                  {project.description}
                </p>

                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Client:</strong>{" "}
                    {project.client?.companyName ||
                      project.client?.user?.name ||
                      "Client"}
                  </p>

                  {project.location && (
                    <p>
                      <strong>Location:</strong> {project.location}
                    </p>
                  )}

                  <p>
                    <strong>Payment:</strong>{" "}
                    ₹{Number(project.paymentAmount).toLocaleString("en-IN")}
                  </p>

                  {project.skills && (
                    <p>
                      <strong>Skills:</strong> {project.skills}
                    </p>
                  )}
                </div>

                <div className="mt-6">
                  {project.hasApplied ? (
                    <button
                      disabled
                      className="w-full rounded-lg bg-gray-200 px-4 py-3 font-semibold text-gray-600"
                    >
                      ✓ Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => applyForProject(project.id)}
                      disabled={applying === project.id}
                      className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {applying === project.id
                        ? "Applying..."
                        : "Apply for Project"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
