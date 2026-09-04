import java.util.*;

public class VeroVexProjectManagement {

    // Project class
    static class Project {
        int id;
        String title;
        double payment;
        double platformFee;
        double studentAmount;
        String status;
        int assignedStudentId;

        Project(int id, String title, double payment) {
            this.id = id;
            this.title = title;
            this.payment = payment;

            // VeroVex payment distribution
            this.platformFee = payment * 0.40;
            this.studentAmount = payment * 0.60;

            this.status = "OPEN";
            this.assignedStudentId = -1;
        }
    }

    // Student class
    static class Student {
        int id;
        String name;
        String skill;

        Student(int id, String name, String skill) {
            this.id = id;
            this.name = name;
            this.skill = skill;
        }
    }

    // Application class
    static class Application {
        int projectId;
        int studentId;
        String status;

        Application(int projectId, int studentId) {
            this.projectId = projectId;
            this.studentId = studentId;
            this.status = "PENDING";
        }
    }

    // ArrayList for storing projects
    static ArrayList<Project> projects = new ArrayList<>();

    // ArrayList for storing students
    static ArrayList<Student> students = new ArrayList<>();

    // Queue for processing applications
    static Queue<Application> applications = new LinkedList<>();

    // HashMap for fast student searching
    static HashMap<Integer, Student> studentMap = new HashMap<>();

    static Scanner sc = new Scanner(System.in);

    // Add a new project
    static void addProject() {

        System.out.print("Enter Project ID: ");
        int id = sc.nextInt();
        sc.nextLine();

        System.out.print("Enter Project Title: ");
        String title = sc.nextLine();

        System.out.print("Enter Project Payment Amount: ");
        double payment = sc.nextDouble();

        Project project = new Project(id, title, payment);
        projects.add(project);

        System.out.println("\nProject added successfully!");
        System.out.println("Platform Fee (40%): Rs. " + project.platformFee);
        System.out.println("Student Amount (60%): Rs. " + project.studentAmount);
    }

    // Display all projects
    static void viewProjects() {

        if (projects.isEmpty()) {
            System.out.println("\nNo projects available.");
            return;
        }

        System.out.println("\n========== PROJECTS ==========");

        for (Project p : projects) {

            System.out.println("Project ID       : " + p.id);
            System.out.println("Title            : " + p.title);
            System.out.println("Payment          : Rs. " + p.payment);
            System.out.println("Platform Fee 40% : Rs. " + p.platformFee);
            System.out.println("Student Amount 60%: Rs. " + p.studentAmount);
            System.out.println("Status           : " + p.status);

            if (p.assignedStudentId != -1) {
                System.out.println("Assigned Student : " + p.assignedStudentId);
            }

            System.out.println("-------------------------------");
        }
    }

    // Add a student
    static void addStudent() {

        System.out.print("Enter Student ID: ");
        int id = sc.nextInt();
        sc.nextLine();

        System.out.print("Enter Student Name: ");
        String name = sc.nextLine();

        System.out.print("Enter Student Skill: ");
        String skill = sc.nextLine();

        Student student = new Student(id, name, skill);

        students.add(student);
        studentMap.put(id, student);

        System.out.println("\nStudent added successfully!");
    }

    // Display all students
    static void viewStudents() {

        if (students.isEmpty()) {
            System.out.println("\nNo students available.");
            return;
        }

        System.out.println("\n========== STUDENTS ==========");

        for (Student s : students) {
            System.out.println("Student ID : " + s.id);
            System.out.println("Name       : " + s.name);
            System.out.println("Skill      : " + s.skill);
            System.out.println("-------------------------------");
        }
    }

    // Student applies for a project
    static void applyForProject() {

        System.out.print("Enter Project ID: ");
        int projectId = sc.nextInt();

        System.out.print("Enter Student ID: ");
        int studentId = sc.nextInt();

        Project selectedProject = null;

        for (Project p : projects) {
            if (p.id == projectId) {
                selectedProject = p;
                break;
            }
        }

        if (selectedProject == null) {
            System.out.println("Project not found.");
            return;
        }

        if (!studentMap.containsKey(studentId)) {
            System.out.println("Student not found.");
            return;
        }

        if (!selectedProject.status.equals("OPEN")) {
            System.out.println("This project is not open for applications.");
            return;
        }

        Application application =
                new Application(projectId, studentId);

        applications.offer(application);

        System.out.println("\nApplication submitted successfully!");
    }

    // View applications
    static void viewApplications() {

        if (applications.isEmpty()) {
            System.out.println("\nNo applications available.");
            return;
        }

        System.out.println("\n========== APPLICATIONS ==========");

        for (Application a : applications) {

            Student student = studentMap.get(a.studentId);

            System.out.println("Project ID : " + a.projectId);
            System.out.println("Student ID : " + a.studentId);

            if (student != null) {
                System.out.println("Student    : " + student.name);
            }

            System.out.println("Status     : " + a.status);
            System.out.println("-----------------------------------");
        }
    }

    // Client assigns a student to a project
    static void assignStudent() {

        System.out.print("Enter Project ID: ");
        int projectId = sc.nextInt();

        System.out.print("Enter Student ID to assign: ");
        int studentId = sc.nextInt();

        Project selectedProject = null;

        for (Project p : projects) {
            if (p.id == projectId) {
                selectedProject = p;
                break;
            }
        }

        if (selectedProject == null) {
            System.out.println("Project not found.");
            return;
        }

        if (!studentMap.containsKey(studentId)) {
            System.out.println("Student not found.");
            return;
        }

        selectedProject.assignedStudentId = studentId;
        selectedProject.status = "ASSIGNED";

        // Update applications
        for (Application a : applications) {

            if (a.projectId == projectId) {

                if (a.studentId == studentId) {
                    a.status = "ACCEPTED";
                } else {
                    a.status = "REJECTED";
                }
            }
        }

        System.out.println("\nStudent assigned successfully!");
        System.out.println("Other applicants have been rejected.");
    }

    // Search project by ID
    static void searchProject() {

        System.out.print("Enter Project ID to search: ");
        int id = sc.nextInt();

        boolean found = false;

        for (Project p : projects) {

            if (p.id == id) {

                System.out.println("\n========== PROJECT FOUND ==========");
                System.out.println("Project ID        : " + p.id);
                System.out.println("Title             : " + p.title);
                System.out.println("Payment           : Rs. " + p.payment);
                System.out.println("Platform Fee 40%  : Rs. " + p.platformFee);
                System.out.println("Student Amount 60%: Rs. " + p.studentAmount);
                System.out.println("Status            : " + p.status);

                found = true;
                break;
            }
        }

        if (!found) {
            System.out.println("Project not found.");
        }
    }

    // Sort projects according to payment
    static void sortProjectsByPayment() {

        if (projects.isEmpty()) {
            System.out.println("\nNo projects available.");
            return;
        }

        projects.sort(
            Comparator.comparingDouble((Project p) -> p.payment)
                      .reversed()
        );

        System.out.println("\nProjects sorted by payment (highest first):");

        for (Project p : projects) {
            System.out.println(
                p.id + " - " +
                p.title + " - Rs. " +
                p.payment
            );
        }
    }

    // Main method
    public static void main(String[] args) {

        while (true) {

            System.out.println("\n======================================");
            System.out.println("     VeroVex Project Management");
            System.out.println("======================================");

            System.out.println("1. Add Project");
            System.out.println("2. View Projects");
            System.out.println("3. Add Student");
            System.out.println("4. View Students");
            System.out.println("5. Apply for Project");
            System.out.println("6. View Applications");
            System.out.println("7. Assign Student");
            System.out.println("8. Search Project");
            System.out.println("9. Sort Projects by Payment");
            System.out.println("10. Exit");

            System.out.print("\nEnter your choice: ");
            int choice = sc.nextInt();

            switch (choice) {

                case 1:
                    addProject();
                    break;

                case 2:
                    viewProjects();
                    break;

                case 3:
                    addStudent();
                    break;

                case 4:
                    viewStudents();
                    break;

                case 5:
                    applyForProject();
                    break;

                case 6:
                    viewApplications();
                    break;

                case 7:
                    assignStudent();
                    break;

                case 8:
                    searchProject();
                    break;

                case 9:
                    sortProjectsByPayment();
                    break;

                case 10:
                    System.out.println("\nThank you for using VeroVex!");
                    sc.close();
                    return;

                default:
                    System.out.println("Invalid choice. Please try again.");
            }
        }
    }
}