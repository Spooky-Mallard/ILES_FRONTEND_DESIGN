import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { StudentDashboard } from "./components/StudentDashboard";
import { WorkplaceSupervisorDashboard } from "./components/WorkplaceSupervisorDashboard";
import { AcademicSupervisorDashboard } from "./components/AcademicSupervisorDashboard";
import { AdminDashboard } from "./components/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: HomePage },
      { path: "login", Component: LoginPage },
      { path: "register", Component: RegisterPage },
      { path: "student/dashboard", Component: StudentDashboard },
      { path: "supervisor/workplace", Component: WorkplaceSupervisorDashboard },
      { path: "supervisor/academic", Component: AcademicSupervisorDashboard },
      { path: "admin", Component: AdminDashboard },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
