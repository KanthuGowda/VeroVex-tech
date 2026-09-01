"use client";

import { useEffect, useState } from "react";

type Application = {
  id: string;
  status: string;
  appliedAt: string;

  project: {
    id: string;
    title: string;
    description: string;
    location: string | null;
    paymentAmount: string | number;
    skills: string | null;
    createdAt: string;

    client: {
      companyName: string;
    };
  };
};

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadApplications() {
      try {
        const storedStudent = localStorage.getItem("verovex_student");

        if (!storedStudent) {
          setError("Please login as a student first.");
          setLoading(false);
          return;
        }

        const student = JSON.parse(storedStudent);

        if (!student.email) {
          setError("Student login information is missing.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          "/api/student/applications/mine",
          {
            headers: {
              "x-user-email": student.email,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message ||
              "Unable to load applications."
          );
          return;
        }

        setApplications(data.applications || []);
      } catch (error) {
        console.error(error);

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

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
              My Applications
            </p>
          </div>

          <a
            href="/student/dashboard"
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            ← Dashboard
          </a>

        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        <h2 className="text-3xl font-bold">
          My Applications
        </h2>

        <p className="mt-2 text-gray-600">
          Track the opportunities you have applied for.
        </p>

        {/* Loading */}
        {loading && (
          <div className="mt-8 rounded-xl bg-white p-8 text-center shadow-sm">
            Loading your applications...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mt-8 rounded-xl bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          applications.length === 0 && (
            <div className="mt-8 rounded-xl bg-white p-10 text-center shadow-sm">

              <h3 className="text-xl font-bold">
                No applications yet
              </h3>

              <p className="mt-2 text-gray-600">
                You have not applied to any
                opportunities yet.
              </p>

              <a
                href="/student/opportunities"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
              >
                Browse Opportunities
              </a>

            </div>
          )}

        {/* Applications */}
        {!loading &&
          !error &&
          applications.length > 0 && (
            <div className="mt-8 space-y-6">

              {applications.map((application) => (
                <article
                  key={application.id}
                  className="rounded-xl bg-white p-6 shadow-sm"
                >

                  <div className="flex flex-col justify-between gap-4 md:flex-row">

                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        {application.project.client.companyName}
                      </p>

                      <h3 className="mt-1 text-2xl font-bold">
                        {application.project.title}
                      </h3>
                    </div>

                    <div>
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-semibold ${
                          application.status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : application.status === "ACCEPTED"
                            ? "bg-green-100 text-green-800"
                            : application.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {application.status}
                      </span>
                    </div>

                  </div>

                  <p className="mt-4 text-gray-600">
                    {application.project.description}
                  </p>

                  <div className="mt-6 grid gap-4 border-t pt-6 md:grid-cols-3">

                    <div>
                      <p className="text-sm text-gray-500">
                        Location
                      </p>

                      <p className="font-medium">
                        {application.project.location ||
                          "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Payment
                      </p>

                      <p className="font-medium">
                        ₹{application.project.paymentAmount}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Applied
                      </p>

                      <p className="font-medium">
                        {new Date(
                          application.appliedAt
                        ).toLocaleDateString("en-IN")}
                      </p>
                    </div>

                  </div>

                  {application.project.skills && (
                    <div className="mt-6">

                      <p className="text-sm text-gray-500">
                        Skills
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">

                        {application.project.skills
                          .split(",")
                          .map((skill) => (
                            <span
                              key={skill}
                              className="rounded-full bg-gray-100 px-3 py-1 text-sm"
                            >
                              {skill.trim()}
                            </span>
                          ))}

                      </div>

                    </div>
                  )}

                </article>
              ))}

            </div>
          )}

      </section>

    </main>
  );
}