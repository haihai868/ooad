import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import StudentDashboard from '../pages/student/StudentDashboard'
import StudyPage from '../pages/student/StudyPage'
import DecksPage from '../pages/student/DecksPage'
import DeckDetailPage from '../pages/student/DeckDetailPage'
import DeckStudyPage from '../pages/student/DeckStudyPage'
import BrowseDecksPage from '../pages/student/BrowseDecksPage'
import CreateDeckPage from '../pages/student/CreateDeckPage'
import CreateFlashcardPage from '../pages/student/CreateFlashcardPage'
import EditDeckPage from '../pages/student/EditDeckPage'
import EditFlashcardPage from '../pages/student/EditFlashcardPage'
import BadgesPage from '../pages/student/BadgesPage'
import ClassesPage from '../pages/student/ClassesPage'
import ClassDetailPage from '../pages/student/ClassDetailPage'
import ExamsPage from '../pages/student/ExamsPage'
import LeaderboardPage from '../pages/student/LeaderboardPage'
import TeacherDashboard from '../pages/teacher/TeacherDashboard'
import TeacherClassesPage from '../pages/teacher/TeacherClassesPage'
import TeacherClassDetailPage from '../pages/teacher/TeacherClassDetailPage'
import TeacherExamsPage from '../pages/teacher/TeacherExamsPage'
import CreateExamPage from '../pages/teacher/CreateExamPage'
import ExamDetailPage from '../pages/teacher/ExamDetailPage'
import EditExamPage from '../pages/teacher/EditExamPage'
import CreateQuestionPage from '../pages/teacher/CreateQuestionPage'
import TakeExamPage from '../pages/student/TakeExamPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import EditUserPage from '../pages/admin/EditUserPage'
import AdminBadgesPage from '../pages/admin/AdminBadgesPage'
import EditBadgePage from '../pages/admin/EditBadgePage'
import ProtectedRoute from './ProtectedRoute'

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light">
        <div className="card-brutal">
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            {user?.role === 'STUDENT' || user?.role === 'PAID_STUDENT' ? (
              <StudentDashboard />
            ) : user?.role === 'TEACHER' ? (
              <TeacherDashboard />
            ) : user?.role === 'ADMIN' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" replace />
            )}
          </ProtectedRoute>
        }
      />
      {/* Student Routes */}
      {(user?.role === 'STUDENT' || user?.role === 'PAID_STUDENT') && (
        <>
          <Route
            path="/dashboard/study"
            element={
              <ProtectedRoute>
                <StudyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks"
            element={
              <ProtectedRoute>
                <DecksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/browse"
            element={
              <ProtectedRoute>
                <BrowseDecksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id"
            element={
              <ProtectedRoute>
                <DeckDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/study"
            element={
              <ProtectedRoute>
                <DeckStudyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/new"
            element={
              <ProtectedRoute>
                <CreateDeckPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/flashcards/new"
            element={
              <ProtectedRoute>
                <CreateFlashcardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/edit"
            element={
              <ProtectedRoute>
                <EditDeckPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/flashcards/:flashcardId/edit"
            element={
              <ProtectedRoute>
                <EditFlashcardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/badges"
            element={
              <ProtectedRoute>
                <BadgesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/classes"
            element={
              <ProtectedRoute>
                <ClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/classes/:id"
            element={
              <ProtectedRoute>
                <ClassDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/exams"
            element={
              <ProtectedRoute>
                <ExamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/exams/:id/take"
            element={
              <ProtectedRoute>
                <TakeExamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />
        </>
      )}
      {/* Teacher Routes */}
      {user?.role === 'TEACHER' && (
        <>
          <Route
            path="/dashboard/decks"
            element={
              <ProtectedRoute>
                <DecksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/browse"
            element={
              <ProtectedRoute>
                <BrowseDecksPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id"
            element={
              <ProtectedRoute>
                <DeckDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/study"
            element={
              <ProtectedRoute>
                <DeckStudyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/new"
            element={
              <ProtectedRoute>
                <CreateDeckPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/flashcards/new"
            element={
              <ProtectedRoute>
                <CreateFlashcardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/edit"
            element={
              <ProtectedRoute>
                <EditDeckPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/flashcards/:flashcardId/edit"
            element={
              <ProtectedRoute>
                <EditFlashcardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/classes"
            element={
              <ProtectedRoute>
                <TeacherClassesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/classes/:id"
            element={
              <ProtectedRoute>
                <TeacherClassDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/exams"
            element={
              <ProtectedRoute>
                <TeacherExamsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/exams/new"
            element={
              <ProtectedRoute>
                <CreateExamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/exams/:id"
            element={
              <ProtectedRoute>
                <ExamDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/exams/:id/edit"
            element={
              <ProtectedRoute>
                <EditExamPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/exams/:id/questions/new"
            element={
              <ProtectedRoute>
                <CreateQuestionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/new"
            element={
              <ProtectedRoute>
                <CreateDeckPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id"
            element={
              <ProtectedRoute>
                <DeckDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/edit"
            element={
              <ProtectedRoute>
                <EditDeckPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/flashcards/new"
            element={
              <ProtectedRoute>
                <CreateFlashcardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/decks/:id/flashcards/:flashcardId/edit"
            element={
              <ProtectedRoute>
                <EditFlashcardPage />
              </ProtectedRoute>
            }
          />
        </>
      )}
      {/* Admin Routes */}
      {user?.role === 'ADMIN' && (
        <>
          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/badges/manage"
            element={
              <ProtectedRoute>
                <AdminBadgesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/users/:id/edit"
            element={
              <ProtectedRoute>
                <EditUserPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/badges/:id/edit"
            element={
              <ProtectedRoute>
                <EditBadgePage />
              </ProtectedRoute>
            }
          />
        </>
      )}
      <Route path="/" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes

