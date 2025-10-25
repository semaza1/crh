import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import TestPage from '../pages/TestPage';
import { ProtectedRoute } from './ProtectedRoute';

// Public Pages
import HomePage from '../pages/public/HomePage';
import LoginPage from '../pages/public/LoginPage';
import SignUpPage from '../pages/public/SignUpPage';

// User Pages
import DashboardPage from '../pages/user/DashboardPage';
import CoursePage from '../pages/user/CoursePage';
import CourseDetailPage from '../pages/user/CourseDetailPage';
import LessonPage from '../pages/user/LessonPage';
import PaymentPage from '../pages/user/PaymentPage';
import Resource from '../pages/user/Resources';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import CoursesPage from '../pages/admin/ManageCourses';
import ResourcesPage from '../pages/admin/ManageResources';
import UserPage from '../pages/admin/ManageUsers';
import LessonsPage from '../pages/admin/ManageLesson';
import EnrollmentsPage from '../pages/admin/ManageEnrollments';

// 404 Page
import NotFound from '../pages/NotFound';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          

          {/* User Protected Routes */}
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* User Course page */}
          <Route
            path="/user/course/"
            element={
              <ProtectedRoute>
              <CoursePage /> 
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/user/course/:courseId"
            element={
              <ProtectedRoute>
                <CourseDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/course/:courseId/lesson/:lessonId"
            element={
              <ProtectedRoute>
                <LessonPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/user/course/:courseId/payment/:lessonId"
            element={
              <ProtectedRoute>
                <PaymentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/resources/"
            element={
              <ProtectedRoute>
                <Resource />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Managing Resources */}
          <Route
            path="/admin/resources"
            element={
              <ProtectedRoute requireAdmin>
                <ResourcesPage />
              </ProtectedRoute>
            }
          />

          {/* Managing Courses */}
          <Route
            path="/admin/courses"
            element={
              <ProtectedRoute requireAdmin>
                <CoursesPage />
              </ProtectedRoute>
            }
          />

          {/* Manage Enrollments */}
          <Route
            path="/admin/enrollments"
            element={
              <ProtectedRoute requireAdmin>
                <EnrollmentsPage />
              </ProtectedRoute>
            }
          />
          {/* Manage Lesson */}
          <Route
            path="/admin/courses/:courseId/lessons"
            element={
              <ProtectedRoute requireAdmin>
                <LessonsPage />
              </ProtectedRoute>
            }
          />

          {/* Managing Users */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <UserPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="/test" element={<TestPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};