"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Payment = {
  id: string;
  amount: string | number;
  platformFee: string | number;
  studentAmount: string | number;
  status: string;
  paidAt: string | null;
  releasedAt: string | null;
};

type Project = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  paymentAmount: string | number;
  skills: string | null;
  status: string;
  createdAt: string;

  applications: {
    id: string;
    status: string;
  }[];

  payment: Payment | null;
};

type DashboardData = {
  client: {
    id: string;
    companyName: string;
    phone: string | null;
    website: string | null;
    address: string | null;
  };

  user: {
    name: string;
    email: string;
  };

  statistics: {
    totalProjects: number;
    totalApplications: number;
  };

  projects: Project[];
};

export default function ClientDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [payingProjectId, setPayingProjectId] = useState<string | null>(
    null
  );

  const [paymentMethod, setPaymentMethod] = useState<
    "DEBIT_CARD" | "CREDIT_CARD"
  >("DEBIT_CARD");

  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const savedClient = localStorage.getItem("verovex_client");

      if (!savedClient) {
        router.replace("/client/login");
        return;
      }

      let client: {
        id?: string;
        name?: string;
        email?: string;
        role?: string;
      };

      try {
        client = JSON.parse(savedClient);
      } catch {
        localStorage.removeItem("verovex_client");
        router.replace("/client/login");
        return;
      }

      if (!client.email) {
        localStorage.removeItem("verovex_client");
        router.replace("/client/login");
        return;
      }

      const response = await fetch("/api/client/dashboard", {
        method: "GET",
        headers: {
          "x-user-email": client.email,
        },
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to load dashboard."
        );
      }

      setData(result);
    } catch (error) {
      console.error("CLIENT DASHBOARD ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load client dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handlePayment(projectId: string) {
    try {
      setPayingProjectId(projectId);
      setPaymentMessage("");

      const savedClient = localStorage.getItem("verovex_client");

      if (!savedClient) {
        router.replace("/client/login");
        return;
      }

      const client = JSON.parse(savedClient);

      if (!client.email) {
        throw new Error("Client email not found.");
      }

      const response = await fetch("/api/client/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": client.email,
        },
        body: JSON.stringify({
          projectId,
          paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Payment could not be completed."
        );
      }

      setPaymentMessage(
        `Payment successful using ${
          paymentMethod === "DEBIT_CARD"
            ? "Debit Card"
            : "Credit Card"
        }.`
      );

      await loadDashboard();
    } catch (error) {
      console.error("PAYMENT ERROR:", error);

      setPaymentMessage(
        error instanceof Error
          ? error.message
          : "Payment failed."
      );
    } finally {
      setPayingProjectId(null);
    }
  }

  function logout() {
    localStorage.removeItem("verovex_client");
    router.replace("/client/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 shadow">
          <p className="text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-6">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-xl font-bold">
            Unable to load dashboard
          </h1>

          <p className="mt-3 text-red-600">
            {error || "No dashboard data found."}
          </p>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={loadDashboard}
              className="rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
            >
              Try Again
            </button>

            <button
              onClick={logout}
              className="rounded-lg border px-5 py-2 font-semibold hover:bg-gray-100"
            >
              Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <header className="border-b bg-white px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              VeroVex
            </h1>

            <p className="text-sm text-gray-500">
              Client Dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            Logout
          </button>

        </div>
      </header>

      {/* MAIN */}
      <section className="mx-auto max-w-6xl px-6 py-8">

        {/* WELCOME */}
        <div className="rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-3xl font-bold text-gray-900">
            Welcome, {data.user.name} 👋
          </h2>

          <p className="mt-2 text-gray-600">
            Manage your company and projects on VeroVex.
          </p>

        </div>

        {/* PAYMENT MESSAGE */}
        {paymentMessage && (
          <div
            className={`mt-6 rounded-xl p-4 font-semibold ${
              paymentMessage.toLowerCase().includes("successful")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {paymentMessage}
          </div>
        )}

        {/* STATISTICS */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">

          <StatCard
            title="Total Projects"
            value={data.statistics.totalProjects}
          />

          <StatCard
            title="Applications"
            value={data.statistics.totalApplications}
          />

        </div>

        {/* COMPANY PROFILE */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">

          <h3 className="text-xl font-bold">
            Company Profile
          </h3>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <Info
              label="Company"
              value={data.client.companyName}
            />

            <Info
              label="Contact Person"
              value={data.user.name}
            />

            <Info
              label="Email"
              value={data.user.email}
            />

            <Info
              label="Phone"
              value={data.client.phone}
            />

            <Info
              label="Website"
              value={data.client.website}
            />

            <Info
              label="Address"
              value={data.client.address}
            />

          </div>
        </div>

        {/* PROJECTS */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-xl font-bold">
                My Projects
              </h3>

              <p className="mt-1 text-gray-500">
                Projects posted by your company.
              </p>
            </div>

            <a
              href="/client/projects/new"
              className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold text-white hover:bg-blue-700"
            >
              + Create Project
            </a>

          </div>

          {data.projects.length === 0 ? (
            <div className="mt-8 rounded-lg border border-dashed p-8 text-center">

              <p className="font-semibold">
                No projects posted yet.
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Create your first project for students.
              </p>

            </div>
          ) : (
            <div className="mt-6 space-y-4">

              {data.projects.map((project) => {

                const amount = Number(project.paymentAmount);
                const platformFee = amount * 0.40;
                const studentAmount = amount * 0.60;

                const canPay =
                  project.status === "SUBMITTED" &&
                  !project.payment;

                return (
                  <div
                    key={project.id}
                    className="rounded-xl border p-5"
                  >

                    {/* PROJECT HEADER */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <h4 className="text-lg font-bold">
                          {project.title}
                        </h4>

                        <p className="mt-1 text-sm text-gray-500">
                          📍{" "}
                          {project.location ||
                            "Location not specified"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
                          {project.applications.length}{" "}
                          {project.applications.length === 1
                            ? "application"
                            : "applications"}
                        </span>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                          {project.status}
                        </span>

                      </div>

                    </div>

                    {/* DESCRIPTION */}
                    <p className="mt-4 text-gray-600">
                      {project.description}
                    </p>

                    {/* PROJECT INFO */}
                    <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">

                      <div>
                        <p className="text-sm text-gray-500">
                          Project Payment
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          ₹{amount.toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Skills
                        </p>

                        <p className="mt-1 font-semibold">
                          {project.skills ||
                            "Not specified"}
                        </p>
                      </div>

                    </div>

                    {/* PAYMENT SECTION */}
                    {project.payment ? (
                      <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                          <div>
                            <p className="font-bold text-green-700">
                              Payment {project.payment.status}
                            </p>

                            <p className="mt-1 text-sm text-green-600">
                              ₹
                              {Number(
                                project.payment.amount
                              ).toFixed(2)}{" "}
                              payment recorded successfully.
                            </p>
                          </div>

                          <span className="rounded-full bg-green-200 px-4 py-2 text-sm font-semibold text-green-800">
                            Paid
                          </span>

                        </div>

                      </div>
                    ) : canPay ? (
                      <div className="mt-5 rounded-xl border bg-gray-50 p-5">

                        <h5 className="text-lg font-bold">
                          Make Payment
                        </h5>

                        <p className="mt-1 text-sm text-gray-500">
                          The student has submitted the work.
                          You can now make the project payment.
                        </p>

                        {/* PAYMENT BREAKDOWN */}
                        <div className="mt-4 grid gap-3 sm:grid-cols-3">

                          <div className="rounded-lg bg-white p-4">
                            <p className="text-sm text-gray-500">
                              Total
                            </p>

                            <p className="mt-1 font-bold">
                              ₹{amount.toFixed(2)}
                            </p>
                          </div>

                          <div className="rounded-lg bg-white p-4">
                            <p className="text-sm text-gray-500">
                              VeroVex Fee (40%)
                            </p>

                            <p className="mt-1 font-bold">
                              ₹{platformFee.toFixed(2)}
                            </p>
                          </div>

                          <div className="rounded-lg bg-white p-4">
                            <p className="text-sm text-gray-500">
                              Student (60%)
                            </p>

                            <p className="mt-1 font-bold">
                              ₹{studentAmount.toFixed(2)}
                            </p>
                          </div>

                        </div>

                        {/* CARD OPTIONS */}
                        <div className="mt-5">

                          <p className="mb-3 font-semibold">
                            Select Payment Method
                          </p>

                          <div className="grid gap-3 sm:grid-cols-2">

                            <button
                              type="button"
                              onClick={() =>
                                setPaymentMethod("DEBIT_CARD")
                              }
                              className={`rounded-xl border-2 p-4 text-left transition ${
                                paymentMethod === "DEBIT_CARD"
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 bg-white hover:border-blue-300"
                              }`}
                            >
                              <p className="font-bold">
                                💳 Debit Card
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                Pay using a debit card
                              </p>

                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setPaymentMethod("CREDIT_CARD")
                              }
                              className={`rounded-xl border-2 p-4 text-left transition ${
                                paymentMethod === "CREDIT_CARD"
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 bg-white hover:border-blue-300"
                              }`}
                            >
                              <p className="font-bold">
                                💳 Credit Card
                              </p>

                              <p className="mt-1 text-sm text-gray-500">
                                Pay using a credit card
                              </p>

                            </button>

                          </div>

                        </div>

                        {/* PAY BUTTON */}
                        <button
                          onClick={() =>
                            handlePayment(project.id)
                          }
                          disabled={
                            payingProjectId === project.id
                          }
                          className="mt-5 w-full rounded-xl bg-green-600 px-6 py-4 font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                        >
                          {payingProjectId === project.id
                            ? "Processing Payment..."
                            : `Pay ₹${amount.toFixed(2)} with ${
                                paymentMethod === "DEBIT_CARD"
                                  ? "Debit Card"
                                  : "Credit Card"
                              }`}
                        </button>

                        <p className="mt-3 text-center text-xs text-gray-500">
                          Demo payment only. No card details are
                          stored by VeroVex.
                        </p>

                      </div>
                    ) : (
                      <div className="mt-5 rounded-lg bg-gray-50 p-4">

                        <p className="text-sm font-semibold text-gray-600">
                          Payment will become available after
                          the student submits the completed work.
                        </p>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>
          )}

        </div>

        {/* APPLICATIONS */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-xl font-bold">
                Applications
              </h3>

              <p className="mt-1 text-gray-500">
                Review students who applied to your projects.
              </p>
            </div>

            <a
              href="/client/applications"
              className="rounded-lg border px-4 py-2 text-center text-sm font-semibold hover:bg-gray-100"
            >
              View Applications
            </a>

          </div>

          <div className="mt-6 rounded-lg bg-gray-50 p-6">

            <p className="text-3xl font-bold">
              {data.statistics.totalApplications}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Total student applications
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">

      <p className="text-sm text-gray-500">
        {title}
      </p>

      <p className="mt-2 text-4xl font-bold">
        {value}
      </p>

    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div>

      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-all font-medium">
        {value || "Not provided"}
      </p>

    </div>
  );
}