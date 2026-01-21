'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from 'next-themes';
import { Button } from '../ui/Button';
import { Search, User, LogOut, Menu, X, Laptop } from 'lucide-react';
import { WipeToggler } from '../ui/WipeToggler';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search)}`);
    }
  };

  const navLinks = [
    { href: '/', label: 'Browse' },
    ...(user ? [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/chat', label: 'Messages', hasBadge: true },
    ] : []),
    ...(user && (user.role === 'admin' || user.role === 'super_admin') ? [
      { href: '/admin', label: 'Admin', className: 'text-red-600 dark:text-red-400' }
    ] : [])
  ];

  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (user) {
      const checkUnread = async () => {
        try {
          const { data } = await api.get('/chats/unread');
          setHasUnread(data.hasUnread);
        } catch (err) {
          console.error(err);
        }
      };

      checkUnread();
      // Poll every 10 seconds
      const interval = setInterval(checkUnread, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400 mr-8">
          <img src="/logo.png" alt="Reclaim Logo" className="h-8 w-8" />
          <span>Reclaim</span>
        </Link>

        <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-sm relative mr-4">
          <input
            type="text"
            placeholder="Search for items..."
            className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </form>

        <div className="flex items-center gap-2">

          {/* Navigation Links */}
          <div className="hidden md:flex items-center bg-gray-100 dark:bg-gray-900 rounded-full p-1 mr-4 relative">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors z-10 ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  } ${link.className || ''}`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white dark:bg-gray-800 rounded-full shadow-sm z-[-1]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  {link.label}
                  {/* @ts-ignore */}
                  {link.hasBadge && hasUnread && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full border border-white dark:border-black" />
                  )}
                </Link>
              );
            })}
          </div>

          {user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-3 pr-2 rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                <span className="text-sm font-medium hidden sm:block">{user.name}</span>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
                  {user.profilePicture ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
              </button>

              {isProfileOpen && (
                <>
                  {/* Backdrop to close */}
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-950 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="p-1">
                      <Link href="/settings" onClick={() => setIsProfileOpen(false)}>
                        <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-md cursor-pointer">
                          Settings
                        </div>
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-800 p-1">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">Register</Button>
              </Link>
            </div>
          )}


          {/* Theme Toggle */}
          <div className="mr-2 flex items-center">
            {mounted && <WipeToggler />}
          </div>
        </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black p-4 space-y-4 shadow-lg absolute w-full left-0 top-16 z-40">

          {/* Profile Section (Top & Centered) */}
          {user ? (
            <div className="flex flex-col items-center space-y-3 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden ring-4 ring-gray-50 dark:ring-gray-900">
                {user.profilePicture ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div className="text-center">
                <p className="font-bold text-lg">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>

              <div className="flex gap-2 w-full max-w-xs pt-2">
                <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    Settings
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="flex-1"
                >
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pb-4 border-b border-gray-100 dark:border-gray-800">
              <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full">Login</Button>
              </Link>
              <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full">Register</Button>
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors text-center ${pathname === link.href
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
