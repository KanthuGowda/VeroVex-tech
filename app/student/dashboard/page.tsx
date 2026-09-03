"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  paymentAmount: string | number;
  skills: string | null;
  status: string;
  createdAt: string;
  client: {
    companyName: string;
  };
};

type Payment = {
  id: string;
  amount: string | number;
  platformFee: string | number;
  studentAmount: string | number;
  status: string;
  paidAt: string | null;
  createdAt: string;
  project: {
    title: string;
  };
};

type Withdrawal = {
  id: string;
  amount: string | number;
  status: string;
  createdAt: string;
  processedAt: string | null;
};

type StudentLogin = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function StudentDashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const [totalEarnings, setTotalEarnings] = useState(0);
  const [withdrawnAmount, setWithdrawnAmount] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState("");
  const [withdrawError, setWithdrawError] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadWithdrawals(studentEmail: string) {
    const response = await fetch("/api/student/withdrawals", {
      headers: {
        "x-user-email": studentEmail,
      },
    });

    const text = await response.text();

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      throw new Error(
        "Server returned an invalid withdrawals response."
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message || "Unable to load withdrawal information."
      );
    }

    setWithdrawals(result.withdrawals || []);
    setWithdrawnAmount(Number(result.withdrawnAmount || 0));
    setAvailableBalance(Number(result.availableBalance || 0));
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const storedStudent = localStorage.getItem("verovex_student");

        if (!storedStudent) {
          router.push("/student/login");
          return;
        }

        const student: StudentLogin = JSON.parse(storedStudent);

        // Load projects
        const projectsResponse = await fetch("/api/student/projects", {
          headers: {
            "x-user-email": student.email,
          },
        });

        const projectsText = await projectsResponse.text();

        let projectsResult;

        try {
          projectsResult = JSON.parse(projectsText);
        } catch {
          throw new Error(
            "Server returned an invalid projects response."
          );
        }

        if (!projectsResponse.ok) {
          throw new Error(
            projectsResult.message || "Unable to load projects."
          );
        }

        setProjects(projectsResult.projects || []);

        // Load payments / earnings
        const paymentsResponse = await fetch("/api/student/payments", {
          headers: {
            "x-user-email": student.email,
          },
        });

        const paymentsText = await paymentsResponse.text();

        let paymentsResult;

        try {
          paymentsResult = JSON.parse(paymentsText);
        } catch {
          throw new Error(
            "Server returned an invalid payments response."
          );
        }

        if (!paymentsResponse.ok) {
          throw new Error(
            paymentsResult.message || "Unable to load earnings."
          );
        }

        setPayments(paymentsResult.payments || []);
        setTotalEarnings(
          Number(paymentsResult.totalEarnings || 0)
        );

        // Load withdrawal information
        await loadWithdrawals(student.email);
      } catch (error) {
        console.error("STUDENT DASHBOARD ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("verovex_student");
    router.push("/student/login");
  }

  function formatAmount(amount: string | number) {
    return Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  async function handleWithdraw() {
    setWithdrawMessage("");
    setWithdrawError("");

    const amount = Number(withdrawAmount);

    if (!withdrawAmount || !Number.isFinite(amount) || amount <= 0) {
      setWithdrawError(
        "Please enter a valid withdrawal amount."
      );
      return;
    }

    if (amount > availableBalance) {
      setWithdrawError(
        `You can withdraw up to ₹${formatAmount(
          availableBalance
        )}.`
      );
      return;
    }

    try {
      setWithdrawLoading(true);

      const storedStudent =
        localStorage.getItem("verovex_student");

      if (!storedStudent) {
        router.push("/student/login");
        return;
      }

      const student: StudentLogin = JSON.parse(storedStudent);

      const response = await fetch(
        "/api/student/withdrawals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": student.email,
          },
          body: JSON.stringify({
            amount,
          }),
        }
      );

      const text = await response.text();

      let result;

      try {
        result = JSON.parse(text);
      } catch {
        throw new Error(
          "Server returned an invalid withdrawal response."
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to submit withdrawal request."
        );
      }

      setWithdrawMessage(
        "Withdrawal request submitted successfully."
      );

      setWithdrawAmount("");

      // Refresh withdrawal balance/history
      await loadWithdrawals(student.email);
    } catch (error) {
      console.error("WITHDRAWAL ERROR:", error);

      setWithdrawError(
        error instanceof Error
          ? error.message
          : "Unable to submit withdrawal request."
      );
    } finally {
      setWithdrawLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              VeroVex
            </h1>

            <p className="text-sm text-gray-500">
              Student Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            Logout
          </button>

        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* Welcome */}
        <div className="rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-3xl font-bold">
            Welcome to VeroVex
          </h2>

          <p className="mt-2 text-gray-600">
            Find projects and opportunities from companies.
          </p>

        </div>

        {/* Earnings */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Total Earnings
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              ₹{formatAmount(totalEarnings)}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Your 60% share from completed payments
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Paid Projects
            </p>

            <p className="mt-2 text-3xl font-bold">
              {payments.length}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Successfully paid projects
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-gray-500">
              Platform Fee
            </p>

            <p className="mt-2 text-3xl font-bold">
              40%
            </p>

            <p className="mt-1 text-sm text-gray-500">
              VeroVex platform fee
            </p>
          </div>

        </div>

        {/* Withdrawal */}
        <div className="mt-10 rounded-xl bg-white p-8 shadow-sm">

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">

            <div>
              <h2 className="text-2xl font-bold">
                Withdraw Money
              </h2>

              <p className="mt-1 text-gray-500">
                Withdraw your available student earnings.
              </p>
            </div>

            <div className="rounded-xl bg-green-50 px-6 py-4">

              <p className="text-sm font-semibold text-gray-600">
                Available Balance
              </p>

              <p className="mt-1 text-3xl font-bold text-green-600">
                ₹{formatAmount(availableBalance)}
              </p>

            </div>

          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div>
              <p className="text-sm text-gray-500">
                Total Earnings
              </p>

              <p className="mt-1 text-lg font-bold">
                ₹{formatAmount(totalEarnings)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Already Withdrawn
              </p>

              <p className="mt-1 text-lg font-bold">
                ₹{formatAmount(withdrawnAmount)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Available to Withdraw
              </p>

              <p className="mt-1 text-lg font-bold text-green-600">
                ₹{formatAmount(availableBalance)}
              </p>
            </div>

          </div>

          <div className="mt-8 border-t pt-6">

            <label className="block text-sm font-semibold">
              Withdrawal Amount
            </label>

            <div className="mt-2 flex flex-col gap-3 md:flex-row">

              <input
                type="number"
                min="1"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) =>
                  setWithdrawAmount(e.target.value)
                }
                placeholder="Enter amount"
                className="w-full rounded-lg border px-4 py-3 outline-none focus:border-blue-500 md:max-w-sm"
              />

              <button
                onClick={handleWithdraw}
                disabled={
                  withdrawLoading ||
                  availableBalance <= 0
                }
                className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {withdrawLoading
                  ? "Submitting..."
                  : "Request Withdrawal"}
              </button>

            </div>

            <p className="mt-2 text-sm text-gray-500">
              Maximum available: ₹
              {formatAmount(availableBalance)}
            </p>

          </div>

          {withdrawMessage && (
            <div className="mt-5 rounded-lg bg-green-50 p-4 text-green-700">
              {withdrawMessage}
            </div>
          )}

          {withdrawError && (
            <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">
              {withdrawError}
            </div>
          )}

        </div>

        {/* Withdrawal History */}
        <div className="mt-10">

          <h2 className="text-2xl font-bold">
            Withdrawal History
          </h2>

          <p className="mt-1 text-gray-500">
            Track your withdrawal requests.
          </p>

        </div>

        {withdrawals.length === 0 ? (

          <div className="mt-6 rounded-xl bg-white p-10 text-center shadow-sm">

            <h3 className="text-xl font-bold">
              No withdrawals yet
            </h3>

            <p className="mt-2 text-gray-500">
              Your withdrawal requests will appear here.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-4">

            {withdrawals.map((withdrawal) => (

              <div
                key={withdrawal.id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                  <div>
                    <p className="text-sm text-gray-500">
                      Withdrawal Amount
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      ₹{formatAmount(withdrawal.amount)}
                    </p>

                    <p className="mt-2 text-sm text-gray-500">
                      Requested on:{" "}
                      {new Date(
                        withdrawal.createdAt
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${
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

                </div>

                {withdrawal.processedAt && (
                  <p className="mt-4 text-sm text-gray-500">
                    Processed on:{" "}
                    {new Date(
                      withdrawal.processedAt
                    ).toLocaleString("en-IN")}
                  </p>
                )}

              </div>

            ))}

          </div>

        )}

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Payment History */}
        <div className="mt-12">

          <h2 className="text-2xl font-bold">
            Payment History
          </h2>

          <p className="mt-1 text-gray-500">
            Payments received for your completed projects.
          </p>

        </div>

        {payments.length === 0 ? (

          <div className="mt-6 rounded-xl bg-white p-10 text-center shadow-sm">

            <h3 className="text-xl font-bold">
              No payments yet
            </h3>

            <p className="mt-2 text-gray-500">
              Your earnings will appear here after a client completes payment.
            </p>

          </div>

        ) : (

          <div className="mt-6 space-y-4">

            {payments.map((payment) => (

              <div
                key={payment.id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >

                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

                  <div>
                    <h3 className="text-lg font-bold">
                      {payment.project.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      Payment received
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    {payment.status}
                  </span>

                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">

                  <div>
                    <p className="text-sm text-gray-500">
                      Project Amount
                    </p>

                    <p className="mt-1 font-semibold">
                      ₹{formatAmount(payment.amount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Platform Fee (40%)
                    </p>

                    <p className="mt-1 font-semibold">
                      ₹{formatAmount(payment.platformFee)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Your Earnings (60%)
                    </p>

                    <p className="mt-1 font-bold text-green-600">
                      ₹{formatAmount(payment.studentAmount)}
                    </p>
                  </div>

                </div>

                {payment.paidAt && (
                  <p className="mt-5 text-sm text-gray-500">
                    Paid on:{" "}
                    {new Date(
                      payment.paidAt
                    ).toLocaleString("en-IN")}
                  </p>
                )}

              </div>

            ))}

          </div>

        )}

        {/* Available Projects */}
        <div className="mt-12">

          <h2 className="text-2xl font-bold">
            Available Projects
          </h2>

          <p className="mt-1 text-gray-500">
            Projects currently open for students.
          </p>

        </div>

        {projects.length === 0 && !error ? (

          <div className="mt-6 rounded-xl bg-white p-10 text-center shadow-sm">

            <h3 className="text-xl font-bold">
              No projects available
            </h3>

            <p className="mt-2 text-gray-500">
              Check back later for new opportunities.
            </p>

          </div>

        ) : (

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            {projects.map((project) => (

              <div
                key={project.id}
                className="rounded-xl bg-white p-6 shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>
                    <h3 className="text-xl font-bold">
                      {project.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {project.client.companyName}
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      project.status === "OPEN"
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {project.status}
                  </span>

                </div>

                <p className="mt-4 text-gray-600">
                  {project.description}
                </p>

                <div className="mt-5 space-y-2 text-sm">

                  <p>
                    <span className="font-semibold">
                      Location:
                    </span>{" "}
                    {project.location || "Remote"}
                  </p>

                  <p>
                    <span className="font-semibold">
                      Payment:
                    </span>{" "}
                    ₹{formatAmount(project.paymentAmount)}
                  </p>

                  {project.skills && (
                    <p>
                      <span className="font-semibold">
                        Skills:
                      </span>{" "}
                      {project.skills}
                    </p>
                  )}

                </div>

                <button
                  onClick={() =>
                    router.push(
                      `/student/projects/${project.id}`
                    )
                  }
                  className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  View Project
                </button>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}