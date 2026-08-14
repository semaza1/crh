import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { 
  ShieldCheck, ShieldAlert, Award, Search, Calendar, 
  CheckCircle, ArrowLeft, Download, ExternalLink, BookOpen, 
  User, Check, Printer
} from 'lucide-react';

const VerifyCertificatePage = () => {
  const { verificationCode: urlCode } = useParams();
  const [searchCode, setSearchCode] = useState(urlCode || '');
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (urlCode) {
      handleVerify(urlCode);
    }
  }, [urlCode]);

  const handleVerify = async (codeToVerify) => {
    const code = (codeToVerify || searchCode).trim();
    if (!code) {
      setErrorMsg('Please enter a verification code or certificate number.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setHasSearched(true);

    try {
      // Query certificates table by verification_code or certificate_number
      const { data, error } = await supabase
        .from('certificates')
        .select(`
          *,
          courses (
            id,
            title,
            description,
            level,
            thumbnail_url
          ),
          users:user_id (
            id,
            name,
            email
          )
        `)
        .or(`verification_code.eq.${code},certificate_number.eq.${code}`)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCertificate(data);
      } else {
        setCertificate(null);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMsg('An error occurred while verifying the credential. Please try again.');
      setCertificate(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-brand-500 selection:text-white flex flex-col justify-between">
      {/* Background Decorative Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-600/10 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-md print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-600/30 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-playfair text-xl font-bold text-white tracking-tight">
              Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">Reach Hub</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/user/course"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/25 transition-all"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        {/* Header Hero */}
        <div className="text-center max-w-2xl mx-auto mb-10 print:hidden">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            Official Credential Verification
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair font-bold text-white tracking-tight mb-3">
            Verify a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-brand-400 to-purple-400">Certificate</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base font-medium">
            Enter the unique verification code or certificate number below to validate authenticity and review achievement records.
          </p>

          {/* Search Box */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(searchCode);
            }} 
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. CRH-2026-00123 or ABC123XYZ"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-slate-900/80 border border-white/15 rounded-2xl text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-sm rounded-2xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Credential</span>
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <p className="mt-3 text-xs font-semibold text-red-400 animate-fade-in">{errorMsg}</p>
          )}
        </div>

        {/* Verification Results Display */}
        {loading ? (
          <div className="py-16 text-center print:hidden">
            <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400 font-semibold text-sm">Querying secure registry...</p>
          </div>
        ) : hasSearched && !certificate ? (
          /* Not Found State */
          <div className="bg-slate-900/70 border border-red-500/30 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto shadow-2xl backdrop-blur-md print:hidden animate-fade-in">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-400 mx-auto mb-4 border border-red-500/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Matching Certificate Found</h3>
            <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">
              We couldn't find a record matching code <span className="font-mono text-white font-bold bg-white/10 px-2 py-0.5 rounded">{searchCode}</span>. Please verify that the code was typed correctly.
            </p>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-400 text-left space-y-1.5">
              <p className="font-bold text-white mb-1">Tips for verification:</p>
              <p>• Check for typos in the verification code or ID.</p>
              <p>• Verification codes are case-insensitive alphanumeric strings.</p>
              <p>• Only officially completed courses generate verified credentials.</p>
            </div>
          </div>
        ) : certificate ? (
          /* Verified Certificate Card & Preview */
          <div className="space-y-8 animate-fade-in">
            {/* Status Pill Badge */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-3xl mx-auto print:hidden shadow-lg shadow-emerald-950/40">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Authentic & Verified Credential</h4>
                  <p className="text-xs text-emerald-400 font-medium">This certificate was officially issued by Career Reach Hub.</p>
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>
            </div>

            {/* Official Certificate Visual Canvas */}
            <div className="bg-white text-slate-900 rounded-3xl p-8 sm:p-14 shadow-2xl border border-slate-200 max-w-4xl mx-auto relative overflow-hidden" id="certificate-print-area">
              <div className="border-8 border-double border-slate-900 p-8 sm:p-12 relative text-center">
                {/* Crest */}
                <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-brand-200">
                  <Award className="h-10 w-10" />
                </div>

                <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Career Reach Hub Credential Registry</div>
                <h2 className="text-3xl sm:text-5xl font-playfair font-bold text-slate-950 mb-3 tracking-tight">
                  Certificate of Completion
                </h2>
                <p className="text-slate-500 font-medium text-sm mb-8">This certifies that</p>

                {/* Recipient */}
                <div className="text-2xl sm:text-4xl font-playfair font-bold text-brand-600 mb-6 border-b-2 border-slate-200 pb-3 inline-block px-8">
                  {certificate.users?.name || 'Verified Graduate'}
                </div>

                {/* Course Details */}
                <p className="text-slate-600 text-sm font-medium mb-2">has successfully completed all required modules of</p>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-4 max-w-2xl mx-auto">
                  {certificate.courses?.title}
                </h3>
                <p className="text-xs text-slate-400 font-semibold mb-10">
                  Awarded on {formatDate(certificate.completion_date || certificate.issued_at)}
                </p>

                {/* Bottom Signature & Verification Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end pt-8 border-t border-slate-200 text-left">
                  <div>
                    <div className="font-serif italic text-lg text-slate-800 border-b border-slate-300 pb-1 mb-1">
                      {certificate.instructor_name || 'Academic Director'}
                    </div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authorized Signature</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right">
                    <p className="text-xs font-bold text-slate-400">CERTIFICATE NO.</p>
                    <p className="font-mono text-xs font-bold text-slate-900">{certificate.certificate_number}</p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Verification Code: {certificate.verification_code}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metadata Box */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto print:hidden">
              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Recipient</p>
                <p className="text-sm font-bold text-white truncate">{certificate.users?.name || 'Verified Student'}</p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Issued Date</p>
                <p className="text-sm font-bold text-white">{formatDate(certificate.issued_at)}</p>
              </div>

              <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Registry Code</p>
                <p className="text-sm font-mono font-bold text-brand-400 truncate">{certificate.verification_code}</p>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Initial State */
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto backdrop-blur-md print:hidden">
            <Award className="w-16 h-16 text-brand-400/50 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Instant Credential Verification</h3>
            <p className="text-slate-400 text-xs sm:text-sm font-medium max-w-sm mx-auto">
              Verify credentials issued to students across all programs, courses, and certifications.
            </p>
          </div>
        )}
      </main>

      {/* Footer Minimal */}
      <footer className="relative z-10 px-6 py-6 text-center text-xs text-slate-500 border-t border-white/5 print:hidden">
        © {new Date().getFullYear()} Career Reach Hub Verification System. All certificates cryptographically registered.
      </footer>
    </div>
  );
};

export default VerifyCertificatePage;