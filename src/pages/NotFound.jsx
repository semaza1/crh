import { Link, useNavigate } from 'react-router-dom';
import { Home, Compass, ArrowLeft, BookOpen, Search } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between relative overflow-hidden font-sans selection:bg-brand-500 selection:text-white">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Navbar Minimal */}
      <header className="relative z-10 px-6 sm:px-10 py-8 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-playfair text-xl font-bold text-white tracking-tight">
            Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Reach Hub</span>
          </span>
        </Link>

        <button 
          onClick={() => navigate(-1)} 
          className="text-xs sm:text-sm font-bold text-slate-400 hover:text-white flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go Back</span>
        </button>
      </header>

      {/* Main 404 Hero */}
      <main className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-6 animate-pulse">
          <Compass className="w-3.5 h-3.5" />
          Error 404: Page Lost in Orbit
        </div>

        <h1 className="text-8xl sm:text-9xl font-extrabold font-playfair tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 mb-4 select-none drop-shadow-2xl">
          404
        </h1>

        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
          We can't seem to find the page you're looking for
        </h2>

        <p className="text-slate-400 text-sm sm:text-base font-medium max-w-lg mx-auto mb-10 leading-relaxed">
          The link you followed may be broken, expired, or the page may have been relocated to a new address.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-600/30 hover:shadow-brand-500/40 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>

          <Link
            to="/user/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/10 hover:border-white/20 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <BookOpen className="w-4 h-4" />
            <span>Student Dashboard</span>
          </Link>
        </div>

        {/* Quick Help Links */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
          <Link to="/user/course" className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors group">
            <p className="text-xs font-bold text-white group-hover:text-brand-300">Browse Catalog</p>
            <p className="text-[11px] text-slate-400">Find new courses</p>
          </Link>
          <Link to="/user/resources" className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors group">
            <p className="text-xs font-bold text-white group-hover:text-brand-300">Toolkits & Guides</p>
            <p className="text-[11px] text-slate-400">Career resources</p>
          </Link>
          <Link to="/path2college" className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors group col-span-2 sm:col-span-1">
            <p className="text-xs font-bold text-white group-hover:text-brand-300">Path2College</p>
            <p className="text-[11px] text-slate-400">Admissions prep</p>
          </Link>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="relative z-10 px-6 py-6 text-center text-xs text-slate-500 border-t border-white/5">
        © {new Date().getFullYear()} Career Reach Hub. All rights reserved.
      </footer>
    </div>
  );
};

export default NotFound;