// FILE: src/pages/Path2College.jsx
// PURPOSE: College preparation page matching screenshot layout

import { Link } from 'react-router-dom';
import { 
  BookOpen, GraduationCap, ExternalLink, Info, MoveLeftIcon, ArrowRight
} from 'lucide-react';
import Logo from '../../assets/Logo.png';
import Asyv from '../../assets/resources/asyv.png';
import Edukik from '../../assets/resources/edukik.png';
import Code from '../../assets/resources/code.png';
import ED from '../../assets/resources/ea&ed.jpg';
import Financial from '../../assets/resources/fs.jpg';
import Sat from '../../assets/resources/sat.jpeg';
import Personal from '../../assets/resources/personal.png';

const Path2College = () => {
  const resources = [
    {
      id: 1,
      title: 'Code University Undergraduate Application',
      description: 'Code University in Germany',
      category: 'Application',
      link: 'https://apply.code.berlin/?_gl=1*11mu09s*_gcl_au*NjcxNjkxMDE1LjE3NjMzMjM0NTY.*_ga*Nzg3NjM4MzYxLjE3NjMzMjM0NTc.*_ga_9XF23QCQR8*czE3NjMzMjM0NTYkbzEkZzAkdDE3NjMzMjM0NTYkajYwJGwwJGg2Mzg0MTQwMTc.',
      icon: Code
    },
    {
      id: 2,
      title: 'Universities with significant financial aid for international students',
      description: 'By Yale Young African Scholars Program',
      category: 'Financial Aid',
      link: 'https://docs.google.com/document/d/1osrS4y6VCQcveyCkNVFWu095YVV1Zf38a8ztOYkKoqM/edit?tab=t.0',
      icon: Financial
    },
    {
      id: 3,
      title: 'Early Action and Early Decision Timeline',
      description: 'By Big J Education',
      category: 'Timeline',
      link: 'https://www.bigjeducationalconsulting.com/resources',
      icon: ED
    },
    {
      id: 4,
      title: 'Edukik English Learning Platform (TOEFL, IELTS + SAT)',
      description: 'By Edukik',
      category: 'Test Prep',
      link: 'https://app.edukik.com/dashboard',
      icon: Edukik
    },
    {
      id: 5,
      title: 'CRC Website',
      description: 'by CRC ASYV',
      category: 'Resources',
      link: 'https://sites.google.com/asyv.org/asyv-crc/home',
      icon: Asyv
    },
    {
      id: 6,
      title: 'SAT College Board Workbooks', 
      description: 'by College Board',
      category: 'Resources',
      link: 'https://bluebook.collegeboard.org/students',
      icon: Sat
    },
    {
      id: 7,
      title: 'College Readiness Guide Book', 
      description: 'by Izere Emile',
      category: 'Resources',
      link: 'https://careerconnecthub.kesug.com/CRP%20GuideBook%20(1).pdf',
      icon: Personal
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3">
              <div className="bg-brand-600 p-2 rounded-xl">
                <img src={Logo} alt="CRH Logo" className="h-8 w-8 filter brightness-0 invert" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">CRH</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-slate-600 hover:text-brand-600 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
                <MoveLeftIcon className="inline-block h-4 w-4 ml-1" />
                Back to Home
              </Link>
              
              <Link to="/login" className="text-slate-600 hover:text-brand-600 text-sm font-bold transition-colors">
                Login
              </Link>
              <Link to="/signup" className="bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors shadow-md">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Header Area */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-bold mb-4">
                College Prep
              </div>
              <h1 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-6 leading-tight">
                Your pathway to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">higher education</span>
              </h1>
            </div>

            {/* Video Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden group">
              <div className="aspect-video bg-slate-900 relative">
                <div className="absolute inset-0 bg-brand-500/20 mix-blend-multiply group-hover:opacity-0 transition-opacity pointer-events-none z-10"></div>
                <iframe
                  className="w-full h-full relative z-20"
                  src="https://www.youtube.com/embed/158aX-gyHU4"
                  title="How to Prepare for College | How to College | Crash Course"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6 bg-slate-50">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-2 rounded-full shrink-0">
                    <Info className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      Informative video on college preparedness
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">By Crash Course</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Introduction Text */}
            <div className="prose prose-lg prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed font-medium">
                Embarking on the journey to college is an exciting and transformative experience, but proper preparation is the key to a successful transition. Whether you're a high school junior eagerly planning your future or a senior ready to take the next step, our comprehensive college preparedness resources are here to guide you every step of the way.
              </p>
            </div>

            {/* Navigating Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-brand-100 text-brand-600 p-2 rounded-xl"><BookOpen className="w-6 h-6" /></span>
                Navigating Admissions
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium mb-6">
                The first step in your college journey is understanding the admissions process. Dive into our admissions information section for valuable tips on crafting a compelling personal statement, securing strong recommendation letters, and navigating application deadlines. Uncover the mysteries of the college application process and set yourself up for success from the start.
              </p>
              <a href="https://ingeniusprep.com/college-admissions/" className="inline-flex items-center text-brand-600 font-bold hover:text-brand-700">
                Learn more at Ingenious Prep <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>

            {/* Exploration Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <span className="bg-purple-100 text-purple-600 p-2 rounded-xl"><GraduationCap className="w-6 h-6" /></span>
                College Exploration Adventure
              </h2>
              <p className="text-slate-600 leading-relaxed font-medium mb-6">
                Choosing the right college is a pivotal decision. Our college exploration resources offer guidance on researching and selecting the perfect institution for your academic and personal growth. Take virtual campus tours, consider factors that align with your goals, and make informed choices about your college destination.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 inline-block">
                <p className="text-sm font-bold text-slate-700">Can't visit in-person? Check out the virtual platforms in our resources list.</p>
              </div>
            </div>

            {/* Closing Section */}
            <div className="bg-gradient-to-r from-brand-600 to-purple-600 p-8 rounded-3xl text-white shadow-xl shadow-brand-500/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                <GraduationCap className="w-48 h-48" />
              </div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-4">
                  Your Journey Starts Here
                </h3>
                <p className="text-brand-50 leading-relaxed font-medium mb-6">
                  Navigating the path to college can be overwhelming, but with the right resources and guidance, you can approach it with confidence. Our college preparedness resources are here to support you at every turn. Whether you're just starting to explore colleges or finalizing your applications, we're here to empower you on your journey to higher education.
                </p>
                <p className="text-white leading-relaxed font-bold">
                  Start exploring, stay informed, and embark on your college adventure with the knowledge and tools you need for success. Your future begins now!
                </p>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Resources */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-brand-500 rounded-full"></span>
                  Useful Resources
                </h2>
                
                <div className="space-y-4">
                  {resources.map((resource) => (
                    <div key={resource.id} className="glass-dark rounded-2xl p-4 border border-white/10 hover:border-brand-500/50 transition-colors group">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center p-1">
                          <img src={resource.icon} alt={resource.title} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm mb-1 line-clamp-2">
                            <a 
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-brand-400 transition-colors"
                            >
                              {resource.title}
                            </a>
                          </h3>
                          <p className="text-xs text-slate-400 font-medium mb-3">
                            {resource.description}
                          </p>
                          <a
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-brand-400 hover:text-brand-300 font-bold group-hover:translate-x-1 transition-transform"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Visit Resource
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA in Sidebar */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-center">
                <div className="bg-brand-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="h-8 w-8 text-brand-600" />
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  Ready to Start?
                </h3>
                <p className="text-sm text-slate-500 font-medium mb-6">
                  Join our community and get personalized guidance for your college journey.
                </p>
                <Link
                  to="/signup"
                  className="block w-full bg-brand-600 hover:bg-brand-700 text-white text-center py-3 rounded-xl font-bold transition-colors shadow-md"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16 mt-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white p-2 rounded-xl">
                  <img src={Logo} alt="CRH" className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Career Reach Hub</h3>
              </div>
              <p className="text-slate-400 font-medium max-w-sm leading-relaxed">
                Empowering students to achieve their college dreams through comprehensive resources and expert guidance.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3 font-medium">
                <li><Link to="/" className="hover:text-brand-400 transition-colors">Home</Link></li>
                <li><Link to="/user/course/" className="hover:text-brand-400 transition-colors">Courses</Link></li>
                <li><Link to="/user/resource" className="hover:text-brand-400 transition-colors">Resources</Link></li>
                <li><Link to="/path2college" className="hover:text-brand-400 transition-colors">Path to College</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold text-white mb-6">Support</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#" className="hover:text-brand-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium">© {new Date().getFullYear()} Career Reach Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Path2College;