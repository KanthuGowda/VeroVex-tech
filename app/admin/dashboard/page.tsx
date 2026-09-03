
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

type DashboardData = {
  pending: {
    applications: number;
    submissions: number;
    withdrawals: number;
  };
  revenue: {
    totalProjectValue: number;
    platformFee: number;
    studentEarnings: number;
  };
  recentStudents: {
    id: string;
    name: string;
    email: string;
    college: string | null;
    course: string | null;
    createdAt: string;
  }[];
  recentClients: {
    id: string;
    name: string;
    email: string;
    companyName: string;
    createdAt: string;
  }[];
  recentProjects: {
    id: string;
    title: string;
    status: string;
    amount: number;
    createdAt: string;
    clientName: string;
    companyName: string;
    studentName: string | null;
  }[];
};

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard", icon: "⌂" },
  { name: "Students", path: "/admin/students", icon: "👨‍🎓" },
  { name: "Clients", path: "/admin/clients", icon: "🏢" },
  { name: "Jobs", path: "/admin/jobs", icon: "💼" },
  { name: "Applications", path: "/admin/applications", icon: "📋" },
  { name: "Submissions", path: "/admin/submissions", icon: "📤" },
  { name: "Payments", path: "/admin/payments", icon: "💳" },
  { name: "Withdrawals", path: "/admin/withdrawals", icon: "💰" },
  { name: "Analytics", path: "/admin/analytics", icon: "📊" },
  { name: "Settings", path: "/admin/settings", icon: "⚙️" },
];

function formatMoney(value: number) {
  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusStyle(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-blue-50 text-blue-700";
    case "ASSIGNED":
      return "bg-purple-50 text-purple-700";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700";
    case "SUBMITTED":
      return "bg-pink-50 text-pink-700";
    case "COMPLETED":
      return "bg-emerald-50 text-emerald-700";
    case "CANCELLED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

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

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const adminData = localStorage.getItem("verovex_admin");

        let adminEmail = "";

        if (adminData) {
          try {
            const parsed = JSON.parse(adminData);
            adminEmail = parsed.email || "";
          } catch {
            adminEmail = adminData;
          }
        }

        if (!adminEmail) {
          router.push("/admin/login");
          return;
        }

        const headers = {
          "x-user-email": adminEmail,
        };

        const [statsResponse, dashboardResponse] = await Promise.all([
          fetch("/api/admin/stats", {
            headers,
          }),
          fetch("/api/admin/dashboard", {
            headers,
          }),
        ]);

        const statsData = await statsResponse.json();
        const dashboardData = await dashboardResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message || "Unable to load dashboard statistics."
          );
        }

        if (!dashboardResponse.ok) {
          throw new Error(
            dashboardData.message || "Unable to load dashboard data."
          );
        }

        setStats(statsData);
        setDashboard(dashboardData);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load admin dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function logout() {
    localStorage.removeItem("verovex_admin");
    router.push("/admin/login");
  }

  function navigate(path: string) {
    router.push(path);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="border-b border-slate-200 px-7 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                V
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  VeroVex
                </h1>

                <p className="text-xs text-slate-500">
                  Admin Portal
                </p>
              </div>
            </div>
          </div>

          <div className="px-5 py-6">
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const active = item.path === "/admin/dashboard";

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                      active
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className="w-6 text-center">
                      {item.icon}
                    </span>

                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto border-t border-slate-200 p-5">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <span>↪</span>
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <div className="flex min-w-0 flex-1 flex-col">

          {/* TOP BAR */}
          <header className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Administration
                </p>

                <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                  Dashboard
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold">
                    VeroVex Admin
                  </p>

                  <p className="text-xs text-slate-500">
                    Administrator
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  A
                </div>

                <button
                  onClick={logout}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 lg:hidden"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* MOBILE NAV */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {menuItems.map((item) => {
                const active = item.path === "/admin/dashboard";

                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${
                      active
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {item.icon} {item.name}
                  </button>
                );
              })}
            </div>
          </header>

          {/* CONTENT */}
          <section className="flex-1 px-5 py-7 sm:px-8 lg:px-10">

            {/* WELCOME */}
            <div className="mb-8 rounded-2xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-300">
                    Welcome back 👋
                  </p>

                  <h3 className="text-2xl font-bold sm:text-3xl">
                    VeroVex Administration
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                    Monitor your complete marketplace, manage users,
                    review project activity and track payments.
                  </p>
                </div>

                <button
                  onClick={() => navigate("/admin/analytics")}
                  className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
                >
                  View Analytics →
                </button>
              </div>
            </div>

            {/* ERROR */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* PLATFORM OVERVIEW */}
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-lg font-bold">
                  Platform Overview
                </h3>

                <p className="text-sm text-slate-500">
                  Live statistics from your VeroVex database
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">

                {/* STUDENTS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total Students
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {loading ? "..." : stats.totalStudents}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Registered students
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                      👨‍🎓
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/admin/students")}
                    className="mt-5 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Manage students →
                  </button>
                </div>

                {/* CLIENTS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Total Clients
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {loading ? "..." : stats.totalClients}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Registered clients
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-xl">
                      🏢
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/admin/clients")}
                    className="mt-5 text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    Manage clients →
                  </button>
                </div>

                {/* PROJECTS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Active Projects
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {loading ? "..." : stats.activeProjects}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Currently active
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                      💼
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/admin/jobs")}
                    className="mt-5 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                  >
                    View projects →
                  </button>
                </div>

                {/* APPLICATIONS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Applications
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {loading ? "..." : stats.totalApplications}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Student applications
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl">
                      📋
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/admin/applications")}
                    className="mt-5 text-sm font-semibold text-amber-600 hover:text-amber-700"
                  >
                    Review applications →
                  </button>
                </div>

                {/* SUBMISSIONS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Submissions
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {loading ? "..." : stats.totalSubmissions}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Submitted projects
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-xl">
                      📤
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/admin/submissions")}
                    className="mt-5 text-sm font-semibold text-pink-600 hover:text-pink-700"
                  >
                    Review submissions →
                  </button>
                </div>

                {/* PAYMENTS */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Payments
                      </p>

                      <p className="mt-3 text-3xl font-bold">
                        {loading ? "..." : stats.totalPayments}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        Payment transactions
                      </p>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-xl">
                      💳
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/admin/payments")}
                    className="mt-5 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
                  >
                    View payments →
                  </button>
                </div>
              </div>
            </div>

            {/* PENDING ACTIONS */}
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-lg font-bold">
                  Requires Attention
                </h3>

                <p className="text-sm text-slate-500">
                  Items that may need administrator action
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">

                {/* PENDING APPLICATIONS */}
                <button
                  onClick={() => navigate("/admin/applications")}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-xl">
                      📋
                    </div>

                    <span className="text-3xl font-bold">
                      {loading
                        ? "..."
                        : dashboard?.pending.applications ?? 0}
                    </span>
                  </div>

                  <h4 className="mt-5 font-bold">
                    Pending Applications
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Applications waiting for review
                  </p>

                  <p className="mt-4 text-sm font-semibold text-amber-600">
                    Review applications →
                  </p>
                </button>

                {/* SUBMISSIONS */}
                <button
                  onClick={() => navigate("/admin/submissions")}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-xl">
                      📤
                    </div>

                    <span className="text-3xl font-bold">
                      {loading
                        ? "..."
                        : dashboard?.pending.submissions ?? 0}
                    </span>
                  </div>

                  <h4 className="mt-5 font-bold">
                    Submitted Projects
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Projects submitted by students
                  </p>

                  <p className="mt-4 text-sm font-semibold text-pink-600">
                    Review submissions →
                  </p>
                </button>

                {/* WITHDRAWALS */}
                <button
                  onClick={() => navigate("/admin/withdrawals")}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-xl">
                      💰
                    </div>

                    <span className="text-3xl font-bold">
                      {loading
                        ? "..."
                        : dashboard?.pending.withdrawals ?? 0}
                    </span>
                  </div>

                  <h4 className="mt-5 font-bold">
                    Pending Withdrawals
                  </h4>

                  <p className="mt-1 text-sm text-slate-500">
                    Student withdrawal requests
                  </p>

                  <p className="mt-4 text-sm font-semibold text-emerald-600">
                    Manage withdrawals →
                  </p>
                </button>
              </div>
            </div>

            {/* REVENUE */}
            <div className="mb-8">
              <div className="mb-4">
                <h3 className="text-lg font-bold">
                  Revenue Overview
                </h3>

                <p className="text-sm text-slate-500">
                  Payment distribution across the platform
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-3">

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">
                    Total Project Value
                  </p>

                  <p className="mt-3 text-3xl font-bold">
                    {loading
                      ? "..."
                      : formatMoney(
                          dashboard?.revenue.totalProjectValue ?? 0
                        )}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Total value of paid projects
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      VeroVex Platform Fee
                    </p>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                      40%
                    </span>
                  </div>

                  <p className="mt-3 text-3xl font-bold">
                    {loading
                      ? "..."
                      : formatMoney(
                          dashboard?.revenue.platformFee ?? 0
                        )}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Platform revenue
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-500">
                      Student Earnings
                    </p>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      60%
                    </span>
                  </div>

                  <p className="mt-3 text-3xl font-bold">
                    {loading
                      ? "..."
                      : formatMoney(
                          dashboard?.revenue.studentEarnings ?? 0
                        )}
                  </p>

                  <p className="mt-2 text-xs text-slate-400">
                    Amount allocated to students
                  </p>
                </div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="mb-8 grid gap-6 xl:grid-cols-2">

              {/* RECENT STUDENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h3 className="font-bold">
                      Recent Students
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Latest registered students
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/admin/students")}
                    className="text-sm font-semibold text-blue-600"
                  >
                    View all →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {loading ? (
                    <div className="p-6 text-sm text-slate-400">
                      Loading students...
                    </div>
                  ) : dashboard?.recentStudents.length ? (
                    dashboard.recentStudents.map((student) => (
                      <button
                        key={student.id}
                        onClick={() =>
                          navigate(`/admin/students/${student.id}`)
                        }
                        className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">
                          {student.name.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {student.name}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {student.email}
                          </p>
                        </div>

                        <span className="hidden text-xs text-slate-400 sm:block">
                          {formatDate(student.createdAt)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-sm text-slate-400">
                      No students found.
                    </div>
                  )}
                </div>
              </div>

              {/* RECENT CLIENTS */}
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                  <div>
                    <h3 className="font-bold">
                      Recent Clients
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Latest registered clients
                    </p>
                  </div>

                  <button
                    onClick={() => navigate("/admin/clients")}
                    className="text-sm font-semibold text-purple-600"
                  >
                    View all →
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {loading ? (
                    <div className="p-6 text-sm text-slate-400">
                      Loading clients...
                    </div>
                  ) : dashboard?.recentClients.length ? (
                    dashboard.recentClients.map((client) => (
                      <button
                        key={client.id}
                        onClick={() =>
                          navigate(`/admin/clients/${client.id}`)
                        }
                        className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50 font-bold text-purple-700">
                          {client.companyName.charAt(0).toUpperCase()}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">
                            {client.companyName}
                          </p>

                          <p className="truncate text-xs text-slate-500">
                            {client.email}
                          </p>
                        </div>

                        <span className="hidden text-xs text-slate-400 sm:block">
                          {formatDate(client.createdAt)}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-6 text-sm text-slate-400">
                      No clients found.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RECENT PROJECTS */}
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
                <div>
                  <h3 className="font-bold">
                    Recent Project Activity
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest projects created on VeroVex
                  </p>
                </div>

                <button
                  onClick={() => navigate("/admin/jobs")}
                  className="text-left text-sm font-semibold text-emerald-600 sm:text-right"
                >
                  View all projects →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs uppercase tracking-wider text-slate-400">
                      <th className="px-6 py-4 font-semibold">
                        Project
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Client
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Student
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Amount
                      </th>

                      <th className="px-6 py-4 font-semibold">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-sm text-slate-400"
                        >
                          Loading projects...
                        </td>
                      </tr>
                    ) : dashboard?.recentProjects.length ? (
                      dashboard.recentProjects.map((project) => (
                        <tr
                          key={project.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <p className="max-w-[220px] truncate text-sm font-semibold">
                              {project.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {formatDate(project.createdAt)}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">
                              {project.companyName}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {project.clientName}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-medium">
                              {project.studentName || "Not assigned"}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-bold">
                              {formatMoney(project.amount)}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle(
                                project.status
                              )}`}
                            >
                              {project.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-sm text-slate-400"
                        >
                          No projects found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* QUICK ACTIONS + STATUS */}
            <div className="grid gap-6 xl:grid-cols-2">

              {/* QUICK ACTIONS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">
                  Quick Actions
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Frequently used administration tools
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">

                  <button
                    onClick={() => navigate("/admin/students")}
                    className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <p className="font-semibold">
                      👨‍🎓 Students
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      View student accounts
                    </p>
                  </button>

                  <button
                    onClick={() => navigate("/admin/clients")}
                    className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <p className="font-semibold">
                      🏢 Clients
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      View client accounts
                    </p>
                  </button>

                  <button
                    onClick={() => navigate("/admin/withdrawals")}
                    className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <p className="font-semibold">
                      💰 Withdrawals
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Manage student withdrawals
                    </p>
                  </button>

                  <button
                    onClick={() => navigate("/admin/analytics")}
                    className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <p className="font-semibold">
                      📊 Analytics
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Analyze platform activity
                    </p>
                  </button>
                </div>
              </div>

              {/* PLATFORM STATUS */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-bold">
                  Platform Status
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Current system overview
                </p>

                <div className="mt-5 space-y-4">

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>

                      <span className="text-sm font-medium">
                        Platform
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-emerald-600">
                      Operational
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>

                      <span className="text-sm font-medium">
                        Database
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-emerald-600">
                      Connected
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>

                      <span className="text-sm font-medium">
                        Payment System
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-emerald-600">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full bg-emerald-500"></span>

                      <span className="text-sm font-medium">
                        Withdrawal System
                      </span>
                    </div>

                    <span className="text-sm font-semibold text-emerald-600">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="mt-10 border-t border-slate-200 pt-6">
              <div className="flex flex-col justify-between gap-2 text-xs text-slate-400 sm:flex-row">
                <p>
                  © 2026 VeroVex Technologies
                </p>

                <p>
                  Administration Portal
                </p>
              </div>
            </div>

          </section>
        </div>
      </div>
    </main>
  );
}

