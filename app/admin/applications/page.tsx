
"use client";

import { useEffect, useMemo, useState } from "react";

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  project: {
    id: string;
    title: string;
    paymentAmount: number | string;
    status: string;
  };
  student: {
    id: string;
    phone: string | null;
    college: string | null;
    course: string | null;
    graduationYear: number | null;
    user: {
      name: string;
      email: string;
    };
  };
};

const menuItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Students", href: "/admin/students" },
  { label: "Clients", href: "/admin/clients" },
  { label: "Projects", href: "/admin/jobs" },
  { label: "Applications", href: "/admin/applications" },
  { label: "Submissions", href: "/admin/submissions" },
  { label: "Payments", href: "/admin/payments" },
  { label: "Withdrawals", href: "/admin/withdrawals" },
  { label: "Analytics", href: "/admin/analytics" },
  { label: "Settings", href: "/admin/settings" },
];

function getAdminEmail() {
  if (typeof window === "undefined") return "";

  const saved = localStorage.getItem("verovex_admin");

  if (!saved) return "";

  try {
    const parsed = JSON.parse(saved);
    return parsed.email || "";
  } catch {
    return saved;
  }
}

function formatMoney(value: number | string) {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusClass(status: string) {
  if (status === "ACCEPTED") {
    return "bg-green-100 text-green-700";
  }

  if (status === "SHORTLISTED") {
    return "bg-purple-100 text-purple-700";
  }

  if (status === "REJECTED") {
    return "bg-red-100 text-red-700";
  }

  return "bg-yellow-100 text-yellow-700";
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const email = getAdminEmail();

    if (!email) {
      window.location.href = "/admin/login";
      return;
    }

    setAdminEmail(email);

    fetch("/api/admin/applications", {
      headers: {
        "x-user-email": email,
      },
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || "Unable to load applications."
          );
        }

        setApplications(data.applications || []);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load applications."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  async function updateApplication(id: string, status: string) {
    const email = getAdminEmail();

    if (!email) {
      window.location.href = "/admin/login";
      return;
    }

    setUpdatingId(id);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email,
        },
        body: JSON.stringify({
          applicationId: id,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Unable to update application."
        );
      }

      const projectId = data.application?.project?.id;

      setApplications((current) =>
        current.map((application) => {
          if (application.id === id) {
            return {
              ...application,
              status,
              project: {
                ...application.project,
                status:
                  status === "ACCEPTED"
                    ? "ASSIGNED"
                    : application.project.status,
              },
            };
          }

          if (
            status === "ACCEPTED" &&
            projectId &&
            application.project.id === projectId
          ) {
            return {
              ...application,
              status: "REJECTED",
            };
          }

          return application;
        })
      );

      if (status === "ACCEPTED") {
        setMessage(
          "Application accepted and student assigned successfully."
        );
      } else if (status === "SHORTLISTED") {
        setMessage("Application shortlisted successfully.");
      } else {
        setMessage("Application rejected successfully.");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update application."
      );
    } finally {
      setUpdatingId("");
    }
  }

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        application.student.user.name
          .toLowerCase()
          .includes(searchText) ||
        application.student.user.email
          .toLowerCase()
          .includes(searchText) ||
        application.project.title
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "ALL" ||
        application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const pendingCount = applications.filter(
    (application) => application.status === "PENDING"
  ).length;

  const shortlistedCount = applications.filter(
    (application) => application.status === "SHORTLISTED"
  ).length;

  const acceptedCount = applications.filter(
    (application) => application.status === "ACCEPTED"
  ).length;

  const rejectedCount = applications.filter(
    (application) => application.status === "REJECTED"
  ).length;

  function logout() {
    localStorage.removeItem("verovex_admin");
    window.location.href = "/admin/login";
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="flex h-16 items-center justify-between px-4 md:px-8">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              VeroVex Admin
            </h1>

            <p className="text-xs text-slate-500">
              Application Management
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                Administrator
              </p>

              <p className="text-xs text-slate-500">
                {adminEmail}
              </p>
            </div>

            <button
              onClick={logout}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden min-h-[calc(100vh-64px)] w-64 border-r bg-white p-4 lg:block">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Administration
          </p>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const active =
                item.href === "/admin/applications";

              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={
                    active
                      ? "block rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                      : "block rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100"
                  }
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </aside>

        <main className="w-full p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-sm font-semibold text-blue-600">
                Administration / Applications
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                Applications Management
              </h2>

              <p className="mt-2 text-slate-500">
                Review, shortlist, accept, and reject student
                applications.
              </p>
            </div>

            {message && (
              <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Pending</p>
                <p className="mt-2 text-3xl font-bold text-yellow-600">
                  {pendingCount}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Shortlisted
                </p>
                <p className="mt-2 text-3xl font-bold text-purple-600">
                  {shortlistedCount}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Accepted</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {acceptedCount}
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Rejected</p>
                <p className="mt-2 text-3xl font-bold text-red-600">
                  {rejectedCount}
                </p>
              </div>
            </div>

            <div className="mb-6 rounded-2xl border bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  placeholder="Search student, email, or project..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="SHORTLISTED">
                    Shortlisted
                  </option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                <p className="text-slate-500">
                  Loading applications...
                </p>
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800">
                  No applications found
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or status filter.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((application) => (
                  <div
                    key={application.id}
                    className="rounded-2xl border bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-bold text-slate-900">
                            {application.student.user.name}
                          </h3>

                          <span
                            className={
                              "rounded-full px-3 py-1 text-xs font-bold " +
                              statusClass(application.status)
                            }
                          >
                            {application.status}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {application.student.user.email}
                        </p>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                          <div>
                            <p className="text-xs text-slate-400">
                              Project
                            </p>

                            <p className="font-semibold text-slate-800">
                              {application.project.title}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Project Payment
                            </p>

                            <p className="font-semibold text-slate-800">
                              ₹
                              {formatMoney(
                                application.project.paymentAmount
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Project Status
                            </p>

                            <p className="font-semibold text-slate-800">
                              {application.project.status}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Applied
                            </p>

                            <p className="font-semibold text-slate-800">
                              {formatDate(application.appliedAt)}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                          {application.student.college && (
                            <span className="rounded-lg bg-slate-100 px-3 py-1">
                              {application.student.college}
                            </span>
                          )}

                          {application.student.course && (
                            <span className="rounded-lg bg-slate-100 px-3 py-1">
                              {application.student.course}
                            </span>
                          )}

                          {application.student.graduationYear && (
                            <span className="rounded-lg bg-slate-100 px-3 py-1">
                              Graduation{" "}
                              {application.student.graduationYear}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        {application.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                updateApplication(
                                  application.id,
                                  "SHORTLISTED"
                                )
                              }
                              disabled={
                                updatingId === application.id
                              }
                              className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                            >
                              Shortlist
                            </button>

                            <button
                              onClick={() =>
                                updateApplication(
                                  application.id,
                                  "ACCEPTED"
                                )
                              }
                              disabled={
                                updatingId === application.id
                              }
                              className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Accept & Assign
                            </button>

                            <button
                              onClick={() =>
                                updateApplication(
                                  application.id,
                                  "REJECTED"
                                )
                              }
                              disabled={
                                updatingId === application.id
                              }
                              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {application.status === "SHORTLISTED" && (
                          <>
                            <button
                              onClick={() =>
                                updateApplication(
                                  application.id,
                                  "ACCEPTED"
                                )
                              }
                              disabled={
                                updatingId === application.id
                              }
                              className="rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Accept & Assign
                            </button>

                            <button
                              onClick={() =>
                                updateApplication(
                                  application.id,
                                  "REJECTED"
                                )
                              }
                              disabled={
                                updatingId === application.id
                              }
                              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {application.status === "ACCEPTED" && (
                          <span className="rounded-xl bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
                            Student Assigned
                          </span>
                        )}

                        {application.status === "REJECTED" && (
                          <span className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                            Application Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

