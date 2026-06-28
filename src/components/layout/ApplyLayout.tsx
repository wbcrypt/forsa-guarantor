// Minimal layout for apply flow — shows FORSA branding + back link but no full nav
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useLocale } from '../../hooks/useLocale'

interface Props {
  children: React.ReactNode
  showBack?: boolean
  backTo?: string
}

export default function ApplyLayout({ children, showBack = true, backTo = '/' }: Props) {
  const { locale } = useLocale()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Minimal header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {showBack ? (
            <button onClick={() => navigate(backTo)}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft size={16} />
              {locale === 'ar' ? 'رجوع' : locale === 'fr' ? 'Retour' : 'Back'}
            </button>
          ) : <div />}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-gray-900 text-sm">FORSA</span>
          </Link>
          <div className="w-16" /> {/* spacer */}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-12">
        {children}
      </main>
    </div>
  )
}
