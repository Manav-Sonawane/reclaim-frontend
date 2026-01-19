'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState('');

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
      { href: '/chat', label: 'Messages' },
    ] : []),
    ...(user && user.role === 'admin' ? [
        { href: '/admin', label: 'Admin', className: 'text-red-600 dark:text-red-400' }
    ] : [])
  ];

  return (
    <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400 mr-8">
          <span>Lost&Found</span>
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
            
          {/* Navigation Links with Active State */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-900 rounded-full p-1 mr-4">
            {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                    <Link 
                        key={link.href} 
                        href={link.href}
                        className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors z-10 ${
                            isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-gray-800/50'
                        } ${link.className || ''}`}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="navbar-active-pill"
                                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-full shadow-sm z-[-1]"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        {link.label}
                    </Link>
                );
            })}
          </div>
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/post">
                <Button size="sm">Post Item</Button>
              </Link>
               <Button variant="ghost" size="sm" onClick={logout}>Logout</Button>
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
        </div>
      </div>
    </nav>
  );
}
