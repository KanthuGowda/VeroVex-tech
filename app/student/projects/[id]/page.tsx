"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Project = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  paymentAmount: string | number;
  skills: string | null;
  status: string;
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

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepted, setAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!projectId) return;

    async function loadProject() {
      try {
        setLoading(true);
        setError("");

        const storedStudent =
          localStorage.getItem("verovex_student");

        if (!storedStudent) {
          router.push("/student/login");
          return;
        }

        const student: StudentLogin =
          JSON.parse(storedStudent);

        const response = await fetch(
          `/api/student/projects/${projectId}`,
          {
            headers: {
              "x-user-email": student.email,
            },
          }
        );

        const data = await response.json();

        console.log("PROJECT API RESPONSE:", data);

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load project."
          );
        }

        setProject(data.project);
        setAccepted(data.accepted === true);
        setSubmitted(data.submitted === true);
      } catch (error) {
        console.error("PROJECT LOAD ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load project."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [projectId, router]);

  async function acceptTask() {
    try {
      setError("");
      setAccepting(true);

      const storedStudent =
        localStorage.getItem("verovex_student");

      if (!storedStudent) {
        router.push("/student/login");
        return;
      }

      const student: StudentLogin =
        JSON.parse(storedStudent);

      const response = await fetch(
        `/api/student/projects/${projectId}/accept`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-email": student.email,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to accept task."
        );
      }

      setAccepted(true);

      if (project) {
        setProject({
          ...project,
          status: "ASSIGNED",
        });
      }
    } catch (error) {
      console.error("ACCEPT TASK ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to accept task."
      );
    } finally {
      setAccepting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-lg">Loading project...</p>
      </main>
    );
  }

  if (error && !project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow">
          <h1 className="text-xl font-bold">
            Unable to load project
          </h1>

          <p className="mt-3 text-red-600">
            {error}
          </p>

          <button
            onClick={() =>
              router.push("/student/dashboard")
            }
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100">

      <header className="border-b bg-white px-8 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold">
              VeroVex
            </h1>

            <p className="text-sm text-gray-500">
              Project Details
            </p>
          </div>

          <button
            onClick={() =>
              router.push("/student/dashboard")
            }
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-100"
          >
            Back
          </button>

        </div>
      </header>

      <section className="mx-auto max-w-4xl p-8">

        <div className="rounded-xl bg-white p-8 shadow-sm">

          <div className="flex items-start justify-between border-b pb-6">

            <div>
              <h2 className="text-3xl font-bold">
                {project.title}
              </h2>

              <p className="mt-2 text-gray-500">
                Posted by {project.client.companyName}
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                submitted
                  ? "bg-blue-100 text-blue-700"
                  : accepted
                    ? "bg-green-100 text-green-700"
                    : project.status === "OPEN"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100 text-gray-700"
              }`}
            >
              {submitted
                ? "SUBMITTED"
                : accepted
                  ? "ASSIGNED"
                  : project.status}
            </span>

          </div>

          <div className="mt-8">

            <h3 className="text-lg font-bold">
              Task Description
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-gray-700">
              {project.description}
            </p>

          </div>

          <div className="mt-8 grid gap-6 rounded-lg bg-gray-50 p-6 sm:grid-cols-2">

            <div>
              <p className="text-sm text-gray-500">
                Company
              </p>

              <p className="mt-1 font-semibold">
                {project.client.companyName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Payment
              </p>

              <p className="mt-1 font-semibold">
                ₹{project.paymentAmount.toString()}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Location
              </p>

              <p className="mt-1 font-semibold">
                {project.location || "Remote"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Skills
              </p>

              <p className="mt-1 font-semibold">
                {project.skills || "Not specified"}
              </p>
            </div>

          </div>

          {error && (
            <div className="mt-6 rounded-lg bg-red-50 p-4 text-center text-red-700">
              {error}
            </div>
          )}

          {/* WORK ALREADY SUBMITTED */}
          {submitted ? (

            <div className="mt-8 rounded-lg bg-blue-50 p-6 text-center">

              <p className="text-lg font-bold text-blue-700">
                ✓ Work Submitted
              </p>

              <p className="mt-2 text-sm text-blue-600">
                Your work has been submitted successfully.
              </p>

              <p className="mt-3 text-sm text-gray-600">
                The client can now review your submission.
              </p>

            </div>

          ) : accepted ? (

            /* ACCEPTED BUT NOT SUBMITTED */
            <div className="mt-8 rounded-lg bg-green-50 p-6 text-center">

              <p className="text-lg font-bold text-green-700">
                ✓ Task Accepted
              </p>

              <p className="mt-1 text-sm text-green-600">
                This task has been assigned to you.
              </p>

              <button
                onClick={() =>
                  router.push(
                    `/student/projects/${project.id}/submit`
                  )
                }
                className="mt-5 w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-bold text-white hover:bg-blue-700"
              >
                Submit Task
              </button>

            </div>

          ) : project.status === "OPEN" ? (

            /* ACCEPT TASK */
            <button
              onClick={acceptTask}
              disabled={accepting}
              className="mt-8 w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {accepting
                ? "Accepting Task..."
                : "Accept Task"}
            </button>

          ) : (

            <div className="mt-8 rounded-lg bg-gray-100 p-5 text-center">

              <p className="font-semibold text-gray-700">
                This task is no longer available.
              </p>

            </div>

          )}

        </div>

      </section>

    </main>
  );
}