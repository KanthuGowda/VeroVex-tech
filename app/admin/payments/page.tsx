"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: number | string;
  platformFee: number | string;
  studentAmount: number | string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  project: {
    id: string;
    title: string;
  };
  student: {
    user: {
      name: string;
      email: string;
    };
  };
  client: {
    user: {
      name: string;
      email: string;
    };
  };
};

type Withdrawal = {
  id: string;
  amount: number | string;
  status: string;
  createdAt: string;
  processedAt: string | null;
  student: {
    user: {
      name: string;
      email: string;
    };
  };
};

type PaymentData = {
  payments: Payment[];
  withdrawals: Withdrawal[];
};

function getAdminEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  const stored = localStorage.getItem("verovex_admin");

  if (!stored) {
    return "";
  }

  try {
    const parsed = JSON.parse(stored);

    if (typeof parsed === "string") {
      return parsed;
    }

    return parsed.email || "";
  } catch {
    return stored;
  }
}

function formatMoney(value: number | string) {
  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN");
}

export default function AdminPaymentsPage() {
  const [adminEmail, setAdminEmail] = useState("");
  const [data, setData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const email = getAdminEmail();

    if (!email) {
      window.location.href = "/admin/login";
      return;
    }

    setAdminEmail(email);

    async function loadPayments() {
      try {
        setLoading(true);

        const response = await fetch("/api/admin/payments", {
          headers: {
            "x-user-email": email,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Unable to load payments.");
        }

        setData(result);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load payments."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, []);

  const payments = data?.payments || [];
  const withdrawals = data?.withdrawals || [];

  const totalPayments = payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );

  const totalPlatformFee = payments.reduce(
    (sum, payment) => sum + Number(payment.platformFee),
    0
  );

  const totalStudentEarnings = payments.reduce(
    (sum, payment) => sum + Number(payment.studentAmount),
    0
  );

  const pendingWithdrawals = withdrawals.filter(
    (withdrawal) => withdrawal.status === "PENDING"
  );

  const pendingWithdrawalAmount = pendingWithdrawals.reduce(
    (sum, withdrawal) => sum + Number(withdrawal.amount),
    0
  );

  function logout() {
    localStorage.removeItem("verovex_admin");
    window.location.href = "/admin/login";
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-0 p-6">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-indigo-600">
                VeroVex
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Admin Panel
              </p>
            </div>

            <nav className="space-y-2">
              <a
                href="/admin/dashboard"
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                Dashboard
              </a>

              <a
                href="/admin/students"
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                Students
              </a>

              <a
                href="/admin/clients"
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                Clients
              </a>

              <a
                href="/admin/jobs"
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                Jobs
              </a>

              <a
                href="/admin/applications"
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                Applications
              </a>

              <a
                href="/admin/submissions"
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                Submissions
              </a>

              <a
                href="/admin/payments"
                className="block rounded-xl bg-indigo-50 px-4 py-3 text-sm font-bold text-indigo-700"
              >
                Payments
              </a>

              <a
                href="/admin/withdrawals"
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                Withdrawals
              </a>

              <a
                href="/admin/analytics"
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                Analytics
              </a>

              <a
                href="/admin/settings"
                className="block rounded-xl px-4 py-3 text-sm font-medium hover:bg-slate-100"
              >
                Settings
              </a>
            </nav>

            <button
              onClick={logout}
              className="mt-8 w-full rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <section className="flex-1">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-2xl font-black">
                  Payments
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage project payments and platform fees.
                </p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-xs text-slate-400">
                  Logged in as
                </p>
                <p className="text-sm font-semibold">
                  {adminEmail}
                </p>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl space-y-8 p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Project Payments
                </p>
                <p className="mt-2 text-2xl font-black">
                  {loading ? "..." : payments.length}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Total Project Value
                </p>
                <p className="mt-2 text-2xl font-black">
                  {loading ? "..." : formatMoney(totalPayments)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">
                  Platform Fees
                </p>
                <p className="mt-2 text-2xl font-black text-indigo-600">
                  {loading ? "..." : formatMoney(totalPlatformFee)}
                </p>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
                <p className="text-sm text-amber-700">
                  Pending Withdrawals
                </p>
                <p className="mt-2 text-2xl font-black text-amber-800">
                  {loading
                    ? "..."
                    : formatMoney(pendingWithdrawalAmount)}
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  {pendingWithdrawals.length} request(s)
                </p>
              </div>
            </div>

            {/* Project Payments */}
            <section>
              <div className="mb-4">
                <h3 className="text-xl font-black">
                  Project Payments
                </h3>
                <p className="text-sm text-slate-500">
                  Payments made by clients for completed projects.
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-[1000px] w-full">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-4">Project</th>
                        <th className="px-5 py-4">Client</th>
                        <th className="px-5 py-4">Student</th>
                        <th className="px-5 py-4">Total</th>
                        <th className="px-5 py-4">
                          Platform 40%
                        </th>
                        <th className="px-5 py-4">
                          Student 60%
                        </th>
                        <th className="px-5 py-4">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-10 text-center text-sm text-slate-500"
                          >
                            Loading payments...
                          </td>
                        </tr>
                      ) : payments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-5 py-10 text-center text-sm text-slate-500"
                          >
                            No project payments found.
                          </td>
                        </tr>
                      ) : (
                        payments.map((payment) => (
                          <tr key={payment.id}>
                            <td className="px-5 py-5">
                              <p className="font-bold">
                                {payment.project.title}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="font-medium">
                                {payment.client.user.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {payment.client.user.email}
                              </p>
                            </td>

                            <td className="px-5 py-5">
                              <p className="font-medium">
                                {payment.student.user.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {payment.student.user.email}
                              </p>
                            </td>

                            <td className="px-5 py-5 font-bold">
                              {formatMoney(payment.amount)}
                            </td>

                            <td className="px-5 py-5 text-indigo-600">
                              {formatMoney(payment.platformFee)}
                            </td>

                            <td className="px-5 py-5 text-emerald-600">
                              {formatMoney(payment.studentAmount)}
                            </td>

                            <td className="px-5 py-5">
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Student Withdrawals */}
            <section>
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black">
                    Student Withdrawal Requests
                  </h3>
                  <p className="text-sm text-slate-500">
                    Withdrawal requests made by students from their
                    earned balance.
                  </p>
                </div>

                <a
                  href="/admin/withdrawals"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                >
                  Manage Withdrawals →
                </a>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-[850px] w-full">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-5 py-4">Student</th>
                        <th className="px-5 py-4">Amount</th>
                        <th className="px-5 py-4">Requested</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-10 text-center text-sm text-slate-500"
                          >
                            Loading withdrawal requests...
                          </td>
                        </tr>
                      ) : withdrawals.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-5 py-10 text-center text-sm text-slate-500"
                          >
                            No withdrawal requests found.
                          </td>
                        </tr>
                      ) : (
                        withdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id}>
                            <td className="px-5 py-5">
                              <p className="font-bold">
                                {withdrawal.student.user.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {withdrawal.student.user.email}
                              </p>
                            </td>

                            <td className="px-5 py-5 font-bold">
                              {formatMoney(withdrawal.amount)}
                            </td>

                            <td className="px-5 py-5 text-sm text-slate-600">
                              {formatDate(withdrawal.createdAt)}
                            </td>

                            <td className="px-5 py-5">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold ${
                                  withdrawal.status === "PENDING"
                                    ? "bg-amber-100 text-amber-700"
                                    : withdrawal.status === "PAID"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : withdrawal.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {withdrawal.status}
                              </span>
                            </td>

                            <td className="px-5 py-5">
                              <a
                                href="/admin/withdrawals"
                                className="font-semibold text-indigo-600 hover:text-indigo-800"
                              >
                                Manage →
                              </a>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* Student earnings */}
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
              <h3 className="text-lg font-black text-emerald-900">
                Student Earnings
              </h3>

              <p className="mt-2 text-sm text-emerald-800">
                Total student earnings from project payments:
              </p>

              <p className="mt-2 text-3xl font-black text-emerald-700">
                {loading
                  ? "..."
                  : formatMoney(totalStudentEarnings)}
              </p>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}