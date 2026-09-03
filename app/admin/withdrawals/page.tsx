"use client";

import { useEffect, useState } from "react";

type Withdrawal = {
  id: string;
  amount: number | string;
  status: string;
  createdAt: string;
  processedAt?: string | null;
  student: {
    user: {
      name: string;
      email: string;
    };
    college?: string | null;
    course?: string | null;
  };
};

export default function AdminWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadWithdrawals() {
    try {
      setLoading(true);
      setError("");

      const adminEmail = localStorage.getItem("verovex_admin");

      let email = "";

      if (adminEmail) {
        try {
          const parsed = JSON.parse(adminEmail);
          email = parsed.email || "";
        } catch {
          email = adminEmail;
        }
      }

      const response = await fetch("/api/admin/withdrawals", {
        headers: {
          "x-user-email": email,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load withdrawals.");
      }

      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load withdrawal requests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWithdrawals();
  }, []);

  async function updateStatus(withdrawalId: string, status: string) {
    try {
      setMessage("");
      setError("");

      const adminEmail = localStorage.getItem("verovex_admin");

      let email = "";

      if (adminEmail) {
        try {
          const parsed = JSON.parse(adminEmail);
          email = parsed.email || "";
        } catch {
          email = adminEmail;
        }
      }

      const response = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": email,
        },
        body: JSON.stringify({
          withdrawalId,
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update withdrawal.");
      }

      setMessage(data.message || "Withdrawal updated successfully.");

      await loadWithdrawals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update withdrawal."
      );
    }
  }

  const totalPending = withdrawals
    .filter((w) => w.status === "PENDING")
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const totalApproved = withdrawals
    .filter((w) => w.status === "APPROVED")
    .reduce((sum, w) => sum + Number(w.amount), 0);

  const totalPaid = withdrawals
    .filter((w) => w.status === "PAID")
    .reduce((sum, w) => sum + Number(w.amount), 0);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Withdrawal Management
            </h1>

            <p className="mt-2 text-slate-600">
              Review and process student withdrawal requests.
            </p>
          </div>

          <button
            onClick={loadWithdrawals}
            className="rounded-lg bg-slate-900 px-5 py-2.5 font-semibold text-white hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        {message && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Pending Withdrawals
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              ₹
              {totalPending.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Approved Withdrawals
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              ₹
              {totalApproved.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Paid Withdrawals
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              ₹
              {totalPaid.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-bold text-slate-900">
              Withdrawal Requests
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500">
              Loading withdrawals...
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No withdrawal requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Student
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Requested
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-600">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr
                      key={withdrawal.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-5 py-5">
                        <p className="font-semibold text-slate-900">
                          {withdrawal.student.user.name}
                        </p>

                        <p className="text-sm text-slate-500">
                          {withdrawal.student.user.email}
                        </p>

                        {withdrawal.student.college && (
                          <p className="mt-1 text-xs text-slate-400">
                            {withdrawal.student.college}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <p className="font-bold text-slate-900">
                          ₹
                          {Number(withdrawal.amount).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {new Date(withdrawal.createdAt).toLocaleString(
                          "en-IN"
                        )}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            withdrawal.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-700"
                              : withdrawal.status === "APPROVED"
                                ? "bg-blue-100 text-blue-700"
                                : withdrawal.status === "PAID"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        {withdrawal.status === "PENDING" && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                updateStatus(
                                  withdrawal.id,
                                  "APPROVED"
                                )
                              }
                              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                updateStatus(
                                  withdrawal.id,
                                  "REJECTED"
                                )
                              }
                              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {withdrawal.status === "APPROVED" && (
                          <button
                            onClick={() =>
                              updateStatus(withdrawal.id, "PAID")
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white hover:bg-green-700"
                          >
                            Mark as Paid
                          </button>
                        )}

                        {withdrawal.status === "PAID" && (
                          <span className="text-sm font-semibold text-green-600">
                            Payment Completed
                          </span>
                        )}

                        {withdrawal.status === "REJECTED" && (
                          <span className="text-sm font-semibold text-red-600">
                            Request Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}