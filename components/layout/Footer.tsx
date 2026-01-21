'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-blue-600 dark:text-blue-400">
              <img src="/logo.png" alt="Reclaim Logo" className="h-8 w-8" />
              <span>Reclaim</span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Your trusted platform for reuniting lost items with their owners. 
              Simple, secure, and community-driven.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Browse Items
                </Link>
              </li>
              <li>
                <Link href="/post" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Report Item
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal/Support */}


          {/* Contact */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>support.reclaim@gmail.com</span>
              </li>
              {/* <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>+91 1234567890</span>
              </li> */}
              <li className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Mumbai, Maharashtra</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-8 flex justify-center items-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {currentYear} Reclaim. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
