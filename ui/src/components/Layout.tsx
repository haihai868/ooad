import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, Home, Trophy, BookOpen, Users, Settings } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isStudent, isTeacher, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-light">
      <nav className="border-b-4 border-dark bg-white shadow-brutal-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8" />
              <span className="text-2xl font-black">FLASHCARD LEARN</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <span className="badge-brutal bg-accent">
                {user?.username?.toUpperCase()}
              </span>
              <span className="badge-brutal bg-secondary text-white">
                {user?.role}
              </span>
              <button onClick={handleLogout} className="btn-brutal bg-primary text-white">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <div className="card-brutal sticky top-8">
              <nav className="space-y-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                >
                  <Home className="w-5 h-5" />
                  Dashboard
                </Link>
                
                {isStudent && (
                  <>
                    <Link
                      to="/dashboard/decks"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                      My Decks
                    </Link>
                    <Link
                      to="/dashboard/study"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                      Study
                    </Link>
                    <Link
                      to="/dashboard/classes"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      Classes
                    </Link>
                    <Link
                      to="/dashboard/exams"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                      Exams
                    </Link>
                    <Link
                      to="/dashboard/badges"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <Trophy className="w-5 h-5" />
                      Badges
                    </Link>
                    <Link
                      to="/dashboard/leaderboard"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <Trophy className="w-5 h-5" />
                      Leaderboard
                    </Link>
                  </>
                )}
                
                {isTeacher && (
                  <>
                    <Link
                      to="/dashboard/classes"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      Classes
                    </Link>
                    <Link
                      to="/dashboard/exams"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <BookOpen className="w-5 h-5" />
                      Exams
                    </Link>
                  </>
                )}
                
                {isAdmin && (
                  <>
                    <Link
                      to="/dashboard/users"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      Users
                    </Link>
                    <Link
                      to="/dashboard/badges/manage"
                      className="flex items-center gap-3 px-4 py-3 font-bold hover:bg-accent transition-colors"
                    >
                      <Trophy className="w-5 h-5" />
                      Badges
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </aside>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}

