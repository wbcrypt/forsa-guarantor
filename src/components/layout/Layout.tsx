import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CreditCard, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import clsx from 'clsx'

const NAV = [
  { label: 'Dashboard', label_fr: 'Tableau de bord', label_ar: 'لوحة التحكم', icon: LayoutDashboard, path: '/' },
  { label: 'Payments', label_fr: 'Paiements', label_ar: 'المدفوعات', icon: CreditCard, path: '/payments' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside className="w-52 flex flex-col bg-navy-900 flex-shrink-0">
        <div className="flex items-center gap-3 h-16 px-4 border-b border-white/5">
          <img src="/logo.png" alt="FORSA" className="w-8 h-8 flex-shrink-0 object-contain" />
          <div><p className="text-white font-semibold text-sm leading-none">FORSA</p><p className="text-teal-400 text-xs mt-0.5">Portail Garant</p></div>
        </div>
        <div className="px-4 pt-4 pb-1"><p className="text-xs font-semibold text-navy-400 uppercase tracking-widest">Garant</p></div>
        <nav className="flex-1 py-2 px-2 space-y-0.5">
          {NAV.map(({ label, label_fr, icon: Icon, path }) => (
            <NavLink key={path} to={path} end={path === '/'}
              className={({ isActive }) => clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                isActive ? 'bg-teal-500/15 text-teal-400' : 'text-navy-300 hover:bg-white/5 hover:text-white')}>
              <Icon size={17} className="flex-shrink-0" />
              <span className="font-medium">{label_fr}</span>
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/5 p-3">
          <p className="text-white text-xs font-medium truncate mb-1">{user?.fullName || user?.email}</p>
          <p className="text-navy-400 text-xs mb-2">Garant</p>
          <button onClick={() => { logout(); navigate('/login') }} className="flex items-center gap-2 text-navy-400 hover:text-white text-xs transition-colors">
            <LogOut size={14} />Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 flex-shrink-0">
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="text-right"><p className="text-xs font-medium text-gray-700">{user?.fullName}</p><p className="text-xs text-gray-400">Garant · Lecture seule</p></div>
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center"><span className="text-white text-xs font-semibold">{user?.fullName?.[0] || 'G'}</span></div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6"><div className="max-w-4xl mx-auto"><Outlet /></div></main>
      </div>
    </div>
  )
}
