
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Stats = {
  totalStudents: number;
  totalClients: number;
  activeProjects: number;
  totalApplications: number;
  totalSubmissions: number;
  totalPayments: number;
};

export default function AdminDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalClients: 0,
    activeProjects: 0,
    totalApplications: 0,
    totalSubmissions: 0,
    totalPayments: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load dashboard statistics."
          );
        }

        setStats(data);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load dashboard statistics."
        );
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  function logout() {
    localStorage.removeItem("verovex_admin");
    router.push("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">VeroVex Admin</h1>
            <p className="text-sm text-gray-500">
              Administration Portal
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Admin Navigation */}
      <div className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-8 py-4">
          <h2 className="mb-3 font-bold">Administration</h2>

          <div className="flex flex-wrap gap-5 text-sm">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="font-semibold text-blue-600"
            >
              Dashboard
            </button>

            <button
              onClick={() => router.push("/admin/students")}
              className="hover:text-blue-600"
            >
              Students
            </button>

            <button
              onClick={() => router.push("/admin/clients")}
              className="hover:text-blue-600"
            >
              Clients
            </button>

            <button
              onClick={() => router.push("/admin/jobs")}
              className="hover:text-blue-600"
            >
              Jobs
            </button>

            <button
              onClick={() => router.push("/admin/applications")}
              className="hover:text-blue-600"
            >
              Applications
            </button>

            <button
              onClick={() => router.push("/admin/submissions")}
              className="hover:text-blue-600"
            >
              Submissions
            </button>

            <button
              onClick={() => router.push("/admin/payments")}
              className="hover:text-blue-600"
            >
              Payments
            </button>

            <button
              onClick={() => router.push("/admin/analytics")}
              className="hover:text-blue-600"
            >
              Analytics
            </button>

            <button
              onClick={() => router.push("/admin/settings")}
              className="hover:text-blue-600"
            >
              Settings
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <h2 className="text-3xl font-bold">Dashboard</h2>

        <p className="mt-2 text-gray-500">
          Manage the VeroVex platform.
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Students</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : stats.totalStudents}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Clients</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : stats.totalClients}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Active Projects</p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : stats.activeProjects}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Applications
            </p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : stats.totalApplications}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Submissions
            </p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : stats.totalSubmissions}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Payments
            </p>
            <p className="mt-2 text-3xl font-bold">
              {loading ? "..." : stats.totalPayments}
            </p>
          </div>
        </div>

        {/* Welcome */}
        <div className="mt-10 rounded-xl bg-white p-8 shadow-sm">
          <h3 className="text-xl font-bold">
            Welcome, VeroVex Admin 👋
          </h3>

          <p className="mt-3 text-gray-500">
            From this dashboard you can manage students, clients,
            projects, applications, submissions, payments and the
            VeroVex platform.
          </p>
        </div>
      </section>
    </main>
  );
}

