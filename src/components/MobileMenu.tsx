"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "./Navbar";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className="md:hidden">
      <button
        onClick={toggleMenu}
        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        {isOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md shadow-lg border-b border-border p-4 animate-slide-in-down z-40 flex flex-col">
          <ul className="flex flex-col gap-2" role="menu">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href} role="none">
                <a
                  href={href}
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-base font-medium font-body text-text-body hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
