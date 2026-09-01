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

type StudentLogin = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function StudentDashboardPage() {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const storedStudent = localStorage.getItem("verovex_student");

        if (!storedStudent) {
          router.push("/student/login");
          return;
        }

        const student: StudentLogin = JSON.parse(storedStudent);

        const response = await fetch("/api/student/projects", {
          headers: {
            "x-user-email": student.email,
          },
        });

        const text = await response.text();

        let result;

        try {
          result = JSON.parse(text);
        } catch {
          throw new Error(
            "Server returned an invalid response. Check the terminal for errors."
          );
        }

        if (!response.ok) {
          throw new Error(
            result.message || "Unable to load projects."
          );
        }

        setProjects(result.projects || []);
      } catch (error) {
        console.error("PROJECT LOAD ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load projects."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("verovex_student");
    router.push("/student/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg">Loading projects...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">

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

        <div className="rounded-xl bg-white p-8 shadow-sm">

          <h2 className="text-3xl font-bold">
            Welcome to VeroVex
          </h2>

          <p className="mt-2 text-gray-600">
            Find projects and opportunities from companies.
          </p>

        </div>

        <div className="mt-8">

          <h2 className="text-2xl font-bold">
            Available Projects
          </h2>

          <p className="mt-1 text-gray-500">
            Projects currently open for students.
          </p>

        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

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
                    ₹{project.paymentAmount.toString()}
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
                    router.push(`/student/projects/${project.id}`)
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