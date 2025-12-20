import { Link, useLocation } from "react-router-dom"

export const NavBar = () => {
  const location = useLocation();
  const isActive = (path: string) =>
    location.pathname === path ? 'text-cyan-400' : 'text-slate-300';
  return (
    <header>
      <nav>
        <div className="flex items-center text-sm">
          <Link to="/me" className={isActive('/me')}>My Profile</Link>
        </div>
      </nav>
    </header>
  )
}