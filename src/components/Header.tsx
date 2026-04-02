import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.css'

const navItems = [
  { label: 'Blog', to: '/#blog' },
  { label: 'About', to: '/#about' },
  { label: 'Resume', to: '/resume' },
  { label: 'Education', to: '/education' },
  { label: 'Contact', to: '/#contact' },
]

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef<HTMLElement | null>(null)
  const location = useLocation()
  const isNonHomePage = location.pathname !== '/'

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement

    const updateHeaderHeight = () => {
      if (!headerRef.current) return
      const measuredHeight = Math.ceil(headerRef.current.getBoundingClientRect().height)
      root.style.setProperty('--header-height', `${measuredHeight}px`)
    }

    updateHeaderHeight()
    window.addEventListener('resize', updateHeaderHeight, { passive: true })

    let observer: ResizeObserver | null = null
    if (typeof ResizeObserver !== 'undefined' && headerRef.current) {
      observer = new ResizeObserver(() => {
        updateHeaderHeight()
      })
      observer.observe(headerRef.current)
    }

    return () => {
      window.removeEventListener('resize', updateHeaderHeight)
      if (observer) {
        observer.disconnect()
      }
    }
  }, [location.pathname])

  return (
    <header
      ref={headerRef}
      className={`header${isScrolled || isNonHomePage ? ' header--scrolled' : ''}`}
    >
      <div className="header__inner">
        <Link to="/" className="header__logo">
          Eric Dyke
        </Link>
        <nav className="header__nav" aria-label="Primary navigation">
          <ul className="header__nav-list">
            {navItems.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="header__nav-link">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
