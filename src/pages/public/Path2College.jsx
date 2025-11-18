// FILE: src/pages/Path2College.jsx
// PURPOSE: College preparation page matching screenshot layout

import { Link } from 'react-router-dom';
import { 
  BookOpen, GraduationCap, ExternalLink, Info, MoveLeftIcon,
} from 'lucide-react';
import Logo from '../../assets/Logo.png';

const Path2College = () => {
  const resources = [
    {
      id: 1,
      title: 'Code University Undergraduate Application',
      description: 'Code University in Germany',
      category: 'Application',
      link: 'https://apply.code.berlin/?_gl=1*11mu09s*_gcl_au*NjcxNjkxMDE1LjE3NjMzMjM0NTY.*_ga*Nzg3NjM4MzYxLjE3NjMzMjM0NTc.*_ga_9XF23QCQR8*czE3NjMzMjM0NTYkbzEkZzAkdDE3NjMzMjM0NTYkajYwJGwwJGg2Mzg0MTQwMTc.',
      icon: '🎓'
    },
    {
      id: 2,
      title: 'Universities with significant financial aid for international students',
      description: 'By Yale Young African Scholars Program',
      category: 'Financial Aid',
      link: 'https://docs.google.com/document/d/1osrS4y6VCQcveyCkNVFWu095YVV1Zf38a8ztOYkKoqM/edit?tab=t.0',
      icon: '💰'
    },
    {
      id: 3,
      title: 'Early Action and Early Decision Timeline',
      description: 'By Big J Education',
      category: 'Timeline',
      link: 'https://www.bigjeducationalconsulting.com/resources',
      icon: '📅'
    },
    {
      id: 4,
      title: 'Edukik English Learning Platform (TOEFL, IELTS + SAT)',
      description: 'By Edukik',
      category: 'Test Prep',
      link: 'https://app.edukik.com/dashboard',
      icon: '📚'
    },
    {
      id: 5,
      title: 'CRC Website',
      description: 'by CRC ASYV',
      category: 'Resources',
      link: 'https://sites.google.com/asyv.org/asyv-crc/home',
      icon: '🌍'
    },
    {
      id: 6,
      title: 'SAT College Board Workbooks', 
      description: 'by College Board',
      category: 'Resources',
      link: 'https://bluebook.collegeboard.org/students',
      icon: '🌍'
    },
    {
      id: 7,
      title: 'College Readiness Guide Book', 
      description: 'by Izere Emile',
      category: 'Resources',
      link: 'https://careerconnecthub.kesug.com/CRP%20GuideBook%20(1).pdf',
      icon: '🌍'
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={Logo} alt="CRH Logo" className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold text-gray-900">CRH</span>
            </div>
            <div className="flex items-center space-x-6">
              <Link to="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium flex items-center justify-center gap-2">
                <MoveLeftIcon className="inline-block h-4 w-4 ml-1" />
                Home
              </Link>
              
              <Link to="/login" className="text-gray-600 hover:text-blue-600 text-sm font-medium">
                Login
              </Link>
              <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2">
            {/* Video Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
              <div className="aspect-video bg-black">
                <iframe
                  className="w-full h-full"
                  src="https://youtu.be/158aX-gyHU4?si=ibAvL60cN6T3z9bW"
                  title="How to Prepare for College | How to College | Crash Course"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">
                      Informative video on college preparedness by Crash Course.
                    </h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Introduction Text */}
            <div className="mb-8">
              <p className="text-gray-700 leading-relaxed text-base">
                Embarking on the journey to college is an exciting and transformative experience, but proper preparation is the key to a successful transition. Whether you're a high school junior eagerly planning your future or a senior ready to take the next step, our comprehensive college preparedness resources are here to guide you every step of the way.
              </p>
            </div>

            {/* Navigating Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">
                Navigating the College Admissions Maze
              </h2>
              <p className="text-gray-700 leading-relaxed text-base mb-6">
                The first step in your college journey is understanding the admissions process. Dive into our admissions information section for valuable tips on crafting a compelling personal statement, securing strong recommendation letters, and navigating application deadlines. Uncover the mysteries of the college application process and set yourself up for success from the start.
                <br />
                You can learn more at <a href="https://ingeniusprep.com/college-admissions/" className="text-blue-600">Ingenious Prep</a>.
              </p>
            </div>

            {/* Financial Aid Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-blue-600 mb-4">
                Embark on a College Exploration Adventure
              </h2>
              <p className="text-gray-700 leading-relaxed text-base mb-6">
                Choosing the right college is a pivotal decision. Our college exploration resources offer guidance on researching and selecting the perfect institution for your academic and personal growth. Take virtual campus tours, consider factors that align with your goals, and make informed choices about your college destination.
                <br />
                You cannot be able to visit the University in-person? It's okay! Here are the platforms to use while visiting. <br />Explore!
              </p>
            </div>

            

            {/* Closing Section */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Your Journey Starts Here
              </h3>
              <p className="text-gray-700 leading-relaxed text-base mb-4">
                Navigating the path to college can be overwhelming, but with the right resources and guidance, you can approach it with confidence. Our college preparedness resources are here to support you at every turn. Whether you're just starting to explore colleges or finalizing your applications, we're here to empower you on your journey to higher education.
              </p>
              <p className="text-gray-700 leading-relaxed text-base font-medium">
                Start exploring, stay informed, and embark on your college adventure with the knowledge and tools you need for success. Your future begins now!
              </p>
            </div>
          </div>

          {/* Right Sidebar - Resources */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                USEFUL RESOURCES
              </h2>
              
              <div className="space-y-6">
                {resources.map((resource) => (
                  <div key={resource.id} className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-3xl">
                        {resource.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight">
                          <a 
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600 transition-colors"
                          >
                            {resource.title}
                          </a>
                        </h3>
                        <p className="text-xs text-gray-600 italic mb-2">
                          {resource.description}
                        </p>
                        <a
                          href={resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit Resource
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA in Sidebar */}
              <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                <GraduationCap className="h-10 w-10 mb-3" />
                <h3 className="font-bold text-lg mb-2">
                  Ready to Start?
                </h3>
                <p className="text-sm text-blue-100 mb-4">
                  Join our community and get personalized guidance for your college journey.
                </p>
                <Link
                  to="/signup"
                  className="block w-full bg-white text-blue-600 text-center py-2 px-4 rounded font-semibold hover:bg-gray-100 transition-colors"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <img src={Logo} alt="CRH Logo" className="h-8 w-8" />
                <span className="ml-2 text-xl font-bold">Career Connect Hub</span>
              </div>
              <p className="text-gray-400">
                Empowering students to achieve their college dreams through comprehensive resources and expert guidance.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/user/course/" className="text-gray-400 hover:text-white transition-colors">Courses</Link></li>
                <li><Link to="/user/resource" className="text-gray-400 hover:text-white transition-colors">Resources</Link></li>
                <li><Link to="/path2college" className="text-gray-400 hover:text-white transition-colors">Path to College</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>© {new Date().getFullYear()} Career Connect Hub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Path2College;