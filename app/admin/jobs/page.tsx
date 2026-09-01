"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  paymentAmount: number;
  skills: string | null;
  status: string;
  createdAt: string;
  client?: {
    user?: {
      name: string;
      email: string;
    };
    companyName?: string | null;
  };
  _count?: {
    applications: number;
  };
};

export default function AdminJobsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/api/admin/jobs");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load jobs.");
        }

        setProjects(data.projects || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load jobs."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Jobs
          </h1>

          <p className="mt-1 text-gray-600">
            Manage all projects posted by clients.
          </p>
        </div>

        {loading && (
          <div className="rounded-xl bg-white p-8 shadow">
            Loading jobs...
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-white p-8 shadow">
            <p className="font-semibold text-red-600">
              {error}
            </p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">
                  Total Jobs
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {projects.length}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">
                  Open Jobs
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {
                    projects.filter(
                      (project) => project.status === "OPEN"
                    ).length
                  }
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow">
                <p className="text-sm text-gray-500">
                  Assigned / Submitted
                </p>

                <p className="mt-2 text-3xl font-bold">
                  {
                    projects.filter(
                      (project) =>
                        project.status === "ASSIGNED" ||
                        project.status === "SUBMITTED"
                    ).length
                  }
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl bg-white shadow">
              {projects.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No jobs have been posted yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Project
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Client
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Payment
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Applications
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-sm font-semibold">
                          Created
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y">
                      {projects.map((project) => (
                        <tr key={project.id} className="hover:bg-gray-50">
                          <td className="px-6 py-5">
                            <p className="font-semibold">
                              {project.title}
                            </p>

                            <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                              {project.description}
                            </p>

                            {project.location && (
                              <p className="mt-1 text-xs text-gray-500">
                                📍 {project.location}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-5 text-sm">
                            <p className="font-medium">
                              {project.client?.companyName ||
                                project.client?.user?.name ||
                                "—"}
                            </p>

                            <p className="text-gray-500">
                              {project.client?.user?.email || ""}
                            </p>
                          </td>

                          <td className="px-6 py-5 text-sm font-semibold">
                            ₹
                            {Number(
                              project.paymentAmount
                            ).toFixed(2)}
                          </td>

                          <td className="px-6 py-5 text-sm">
                            {project._count?.applications ?? 0}
                          </td>

                          <td className="px-6 py-5">
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                              {project.status}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-sm text-gray-500">
                            {new Date(
                              project.createdAt
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}