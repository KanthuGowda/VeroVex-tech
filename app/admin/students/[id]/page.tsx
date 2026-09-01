
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Application = {
  id: string;
  status: string;
  appliedAt: string;
  project?: {
    id: string;
    title: string;
    location: string | null;
    paymentAmount: number;
    skills: string | null;
  };
  job?: {
    id: string;
    title: string;
    location: string | null;
    salary: string | null;
  };
};

type Student = {
  id: string;
  phone: string | null;
  college: string | null;
  course: string | null;
  graduationYear: number | null;
  resumeUrl: string | null;

  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  };

  applications?: Application[];
};

export default function StudentProfilePage() {
  const params = useParams();
  const id = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudent() {
      try {
        const response = await fetch(
          `/api/admin/students/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load student."
          );
        }

        setStudent({
          ...data.student,
          applications: data.student?.applications ?? [],
        });
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load student profile."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadStudent();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p>Loading student profile...</p>
      </main>
    );
  }

  if (error || !student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-xl font-bold">
            Student Not Found
          </h1>

          <p className="mt-2 text-red-600">
            {error || "Student profile could not be loaded."}
          </p>

          <a
            href="/admin/students"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2 text-white"
          >
            ← Back to Students
          </a>
        </div>
      </main>
    );
  }

  const applications = student.applications ?? [];

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">
            VeroVex Admin
          </h1>

          <p className="text-sm text-gray-500">
            Student Profile
          </p>
        </div>

        <a
          href="/admin/students"
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-100"
        >
          ← Students
        </a>
      </header>

      <section className="mx-auto max-w-5xl p-8">

        {/* Profile */}
        <div className="rounded-xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-3xl font-bold">
                {student.user.name}
              </h2>

              <p className="mt-1 text-gray-500">
                {student.user.email}
              </p>
            </div>

            <span className="w-fit rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
              {student.user.role}
            </span>

          </div>
        </div>

        {/* Personal Information */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">

          <h3 className="text-xl font-bold">
            Personal Information
          </h3>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <Info
              label="Name"
              value={student.user.name}
            />

            <Info
              label="Email"
              value={student.user.email}
            />

            <Info
              label="Phone"
              value={student.phone}
            />

            <Info
              label="College"
              value={student.college}
            />

            <Info
              label="Course"
              value={student.course}
            />

            <Info
              label="Graduation Year"
              value={
                student.graduationYear !== null
                  ? String(student.graduationYear)
                  : null
              }
            />

          </div>
        </div>

        {/* Account Information */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">

          <h3 className="text-xl font-bold">
            Account Information
          </h3>

          <div className="mt-6 grid gap-6 md:grid-cols-2">

            <Info
              label="User ID"
              value={student.user.id}
            />

            <Info
              label="Student ID"
              value={student.id}
            />

            <Info
              label="Role"
              value={student.user.role}
            />

            <Info
              label="Joined"
              value={new Date(
                student.user.createdAt
              ).toLocaleDateString()}
            />

          </div>
        </div>

        {/* Resume */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">

          <h3 className="text-xl font-bold">
            Resume
          </h3>

          {student.resumeUrl ? (
            <a
              href={student.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-semibold text-blue-600 hover:underline"
            >
              View Resume
            </a>
          ) : (
            <p className="mt-3 text-gray-500">
              Resume has not been uploaded.
            </p>
          )}

        </div>

        {/* Applications */}
        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <h3 className="text-xl font-bold">
              Applications
            </h3>

            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              {applications.length}
            </span>

          </div>

          {applications.length === 0 ? (

            <p className="mt-4 text-gray-500">
              This student has not applied to any projects yet.
            </p>

          ) : (

            <div className="mt-5 space-y-4">

              {applications.map((application) => (

                <div
                  key={application.id}
                  className="rounded-lg border p-5"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="font-semibold">
                        {application.project?.title ||
                          application.job?.title ||
                          "Application"}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {application.project?.location ||
                          application.job?.location ||
                          "Location not specified"}
                      </p>

                      {application.project && (
                        <p className="mt-1 text-sm text-gray-500">
                          Payment: ₹
                          {Number(
                            application.project.paymentAmount
                          ).toFixed(2)}
                        </p>
                      )}

                      {application.job?.salary && (
                        <p className="mt-1 text-sm text-gray-500">
                          Salary: {application.job.salary}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-gray-400">
                        Applied:{" "}
                        {new Date(
                          application.appliedAt
                        ).toLocaleDateString()}
                      </p>

                    </div>

                    <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium">
                      {application.status}
                    </span>

                  </div>

                  {application.project?.skills && (
                    <div className="mt-4">

                      <p className="text-xs font-semibold text-gray-500">
                        Skills
                      </p>

                      <p className="mt-1 text-sm text-gray-700">
                        {application.project.skills}
                      </p>

                    </div>
                  )}

                </div>

              ))}

            </div>

          )}

        </div>

      </section>

    </main>
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

