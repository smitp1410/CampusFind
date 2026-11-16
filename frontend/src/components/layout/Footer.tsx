import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, Phone, Mail, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-campus-charcoal text-campus-ivory border-t-4 border-campus-lime mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-campus-lime text-campus-charcoal font-mono font-black text-xl flex items-center justify-center border-2 border-campus-lime">
                CF
              </div>
              <span className="font-serif font-black text-2xl tracking-tight text-campus-ivory">
                CampusFind
              </span>
            </div>
            <p className="text-sm text-campus-ivory/70 leading-relaxed max-w-sm">
              The university digital lost and found ecosystem. Designed to bring lost belongings back to students, faculty, and campus staff through 6-factor smart matching and secure verified handovers.
            </p>
            <div className="pt-2 flex items-center space-x-3 text-xs font-mono text-campus-lime">
              <ShieldCheck className="w-4 h-4" />
              <span>Campus Safety Department Endorsed</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-campus-lime">
              Platform
            </h4>
            <ul className="space-y-2 text-xs font-mono text-campus-ivory/80">
              <li>
                <Link to="/items?type=LOST" className="hover:text-campus-lime transition-colors">
                  Lost Items
                </Link>
              </li>
              <li>
                <Link to="/items?type=FOUND" className="hover:text-campus-lime transition-colors">
                  Found Items
                </Link>
              </li>
              <li>
                <Link to="/report/lost" className="hover:text-campus-lime transition-colors">
                  Submit Report
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-campus-lime transition-colors">
                  Smart Matches
                </Link>
              </li>
              <li>
                <Link to="/claims" className="hover:text-campus-lime transition-colors">
                  Claims Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Directory */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-campus-lime">
              Collection Points
            </h4>
            <ul className="space-y-2 text-xs text-campus-ivory/80 font-mono">
              <li>Central Library Desk 1</li>
              <li>Student Union Rm 104</li>
              <li>Science Atrium Post</li>
              <li>Athletic Complex Desk</li>
              <li>Main Security Station</li>
            </ul>
          </div>

          {/* Contact & Dispatch */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-campus-lime">
              Security Dispatch
            </h4>
            <div className="space-y-2 text-xs font-mono text-campus-ivory/80">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-campus-lime shrink-0" />
                <span>Central Security Bldg, Room 102</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-campus-lime shrink-0" />
                <span>(555) 019-SAFE [7233]</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-campus-lime shrink-0" />
                <span>lostandfound@campus.edu</span>
              </div>
            </div>
            <div className="pt-2">
              <span className="inline-block border border-campus-ivory/20 px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-campus-ivory/60">
                Operating 24/7 Dispatch
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-campus-ivory/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-campus-ivory/50 space-y-2 sm:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} CampusFind — University Lost & Found Protocol. All rights reserved.
          </div>
          <div className="flex items-center space-x-4">
            <span>Privacy Policy</span>
            <span>&bull;</span>
            <span>Verification Guidelines</span>
            <span>&bull;</span>
            <span>Admin Gateway</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
