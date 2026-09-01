"use client";

import { useEffect, useState } from "react";

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
    createdAt: string;
  };
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      try {
        const response = await fetch("/api/admin/students");

        if (!response.ok) {
          throw new Error("Failed to load students");
        }

        const data = await response.json();

        setStudents(data.students);
      } catch (error) {
        console.error(error);
        setError("Unable to load students.");
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <header className="flex items-center justify-between border-b bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-bold">
            VeroVex Admin
          </h1>

          <p className="text-sm text-gray-500">
            Student Management
          </p>
        </div>

        <a
          href="/admin/dashboard"
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-100"
        >
          ← Dashboard
        </a>
      </header>

      {/* Content */}
      <section className="p-8">

        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Students
          </h2>

          <p className="mt-2 text-gray-500">
            Manage students registered on VeroVex.
          </p>
        </div>

        {/* Student count */}
        <div className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Students
          </p>

          <p className="mt-1 text-3xl font-bold">
            {students.length}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm">
            Loading students...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl bg-white p-8 text-center text-red-600 shadow-sm">
            {error}
          </div>
        )}

        {/* Students table */}
        {!loading && !error && (
          <div className="overflow-hidden rounded-xl bg-white shadow-sm">

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold">
                      Student
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Contact
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      College
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Course
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Graduation
                    </th>

                    <th className="px-6 py-4 text-sm font-semibold">
                      Joined
                    </th>
                    <th className="px-6 py-4 text-sm font-semibold">
  Action
</th>
                  </tr>
                </thead>

                <tbody>

                  {students.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >

                      {/* Student */}
                      <td className="px-6 py-5">

                        <div className="font-semibold">
                          {student.user.name}
                        </div>

                        <div className="text-sm text-gray-500">
                          {student.user.email}
                        </div>

                      </td>

                      {/* Contact */}
                      <td className="px-6 py-5 text-sm">
                        {student.phone || "Not provided"}
                      </td>

                      {/* College */}
                      <td className="px-6 py-5 text-sm">
                        {student.college || "Not provided"}
                      </td>

                      {/* Course */}
                      <td className="px-6 py-5 text-sm">
                        {student.course || "Not provided"}
                      </td>

                      {/* Graduation */}
                      <td className="px-6 py-5 text-sm">
                        {student.graduationYear || "Not provided"}
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {new Date(
                          student.user.createdAt
                        ).toLocaleDateString()}
                      </td>
<td className="px-6 py-5">
  <a
    href={`/admin/students/${student.id}`}
    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
  >
    View
  </a>
</td>
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>
        )}

      </section>

    </main>
  );
}