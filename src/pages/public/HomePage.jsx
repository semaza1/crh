import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight, Play, Clock, Star, X, Menu,
  FileText, Mail, Phone, MapPin, Instagram,
  Linkedin, Twitter, Facebook, CheckCircle, Youtube
} from 'lucide-react';

import Kayitare from '../../assets/team_members/kayitare.jpg';
import Jackson from '../../assets/team_members/jackson.jpg';
import Hodali from '../../assets/team_members/Hodali.jpg';
import JohnKelly from '../../assets/team_members/johnKelly.jpg';
import Natasha from '../../assets/team_members/natasha.jpg';
import Steven from '../../assets/team_members/steven.jpg';
import Pacific from '../../assets/team_members/pacific.jpg';
import Eddy from '../../assets/team_members/eddy.jpg';
import Esther from '../../assets/team_members/esther.jpg';
import Image from '../../assets/place_of_work.jpg';
import Logo from '../../assets/Logo.png';
import Emmanuel from '../../assets/team_members/Professional.png';

import Hero_video from '../../assets/Career Reach Hub.mp4';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchPreviewData();
  }, []);

  const fetchPreviewData = async () => {
    try {
      // Fetch top 3 courses
      const { data: coursesData } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3);

      setCourses(coursesData || []);

      // Fetch top 3 resources
      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      setResources(resourcesData || []);
    } catch (error) {
      console.error('Error fetching preview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLearnMore = (path) => {
    if (!user) {
      navigate('/login', { state: { from: path } });
    } else {
      navigate(path);
    }
  };

  const testimonials = [
    {
      name: 'Fred Rugamba',
      role: 'Academic Brige',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      content: 'Career Reach Hub helped me land my dream internship at Google. The mentorship program was incredible and the guidance I received was invaluable for my career growth.',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Data Scientist at Microsoft',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      content: 'The courses here prepared me perfectly for my current role. The hands-on projects and expert mentorship made all the difference in my career transition.',
      rating: 5
    },
    {
      name: 'Emily Davis',
      role: 'Product Manager at Amazon',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      content: 'Found my mentor through CRH who guided me through my career transition. The networking opportunities and professional development resources are exceptional.',
      rating: 5
    },
    {
      name: 'Nshuti Elie',
      role: 'Graduate Student',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      content: 'The design courses and portfolio feedback sessions helped me pivot from marketing to UX design. Now I am working at my dream company!',
      rating: 5
    }
  ];

  const teamMembers = [
    {
      name: 'Habiyaremye Kayitare',
      role: 'Resources & Finance Manager',
      image: Kayitare,
      email: 'habiyaremye.kayitare@gmail.com',
      // phone: '+250 781 882 027',
      linkedin: 'https://linkedin.com/in/habiyaremye'
    },
    {
      name: 'Muheto Jackson',
      role: 'Founder & CEO',
      image: Jackson,
      email: 'shyakamuhetojackson@gmail.com',
      // phone: '+250 794 395 653',
      linkedin: 'https://www.linkedin.com/in/jackson-muheto-00220923b'
    },
    {
      name: 'Nkurunziza Hodali',
      role: 'Social Media & Communication officer',
      image: Hodali,
      email: 'nkurunzizahodar@gmail.com',
      // phone: '+1 (613) 617-4504',
      linkedin: 'https://linkedin.com/in/nkurunzizahodali'
    },
    {
      name: 'John Kelly',
      role: 'Co-Founder & Chief Operating Officer',
      image: JohnKelly,
      email: 'john@careerreachhub.com',
      // phone: '+1 (555) 456-7890',
      linkedin: 'https://linkedin.com/in/johnkelly'
    },
    {
      name: 'Natasha Agarwal',
      role: 'Finance & Planning Officer',
      image: Natasha,
      email: 'natashaa2099@gmail.com',
      // phone: '+1 (239) 564-8488',
      linkedin: 'https://linkedin.com/in/natashaaragarwal'
    },
    {
      name: 'TUMUSIIME Elisha Steven',
      role: 'Marketing Operations Officer',
      image: Steven,
      email: 'elishatumusiime@gmail.com',
      // phone: '+250 791 892 784',
      linkedin: 'https://linkedin.com/in/elishasteven'
    },
    {
      name: 'Ishimwe Denis Pacifique',
      role: 'Partnerships Manager',
      image: Pacific,
      email: 'ishimwe@brandeis.edu',
      // phone: '+1 (857) 961-6777',
      linkedin: 'https://linkedin.com/in/ishimwepacific'
    },
    {
      name: 'Eddy Mutoniwase',
      role: 'Chief Operating & Marketing officer',
      image: Eddy,
      email: 'eddymutoniwase@gmail.com',
      // phone: '+250 785 938 080',
      linkedin: 'https://linkedin.com/in/eddymutoniwase'
    },
    {
      name: 'Esther Mukakamanzi',
      role: 'Resources & Finance Manager',
      image: Esther,
      email: 'esthermukakamanzi6@gmail.com',
      // phone: '+250789 115 408',
      linkedin: 'https://linkedin.com/in/esthermukakamanzi'
    },
    {
      name: 'Emmanuel Semaza',
      role: 'Software Engineer',
      image: Emmanuel,
      email: 'semaza@asyv.org',
      // phone: '+250 798 721 418',
      linkedin: 'https://linkedin.com/in/emmanuelsemaza'
    }
  ];

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 glass border-b-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <img src={Logo} alt="CRH Logo" className="h-10 w-10 rounded-full" />
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Career Reach Hub
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#about" className="text-gray-600 hover:text-brand-600 text-sm font-semibold transition-colors">About</a>
              <a href="#courses" className="text-gray-600 hover:text-brand-600 text-sm font-semibold transition-colors">Courses</a>
              <a href="#resources" className="text-gray-600 hover:text-brand-600 text-sm font-semibold transition-colors">Resources</a>
              <a href="#testimonials" className="text-gray-600 hover:text-brand-600 text-sm font-semibold transition-colors">Testimonials</a>
              {user ? (
                <Link
                  to={user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}
                  className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-600 transition-all shadow-md hover:shadow-brand-500/30 transform hover:-translate-y-0.5"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="text-gray-600 hover:text-brand-600 text-sm font-semibold transition-colors">
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-600 transition-all shadow-md hover:shadow-brand-500/30 transform hover:-translate-y-0.5"
                  >
                    Start Free Trial
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-brand-600 focus:outline-none p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden glass absolute top-full left-0 w-full shadow-2xl border-t border-gray-100/50 animate-fade-in-up">
            <div className="px-6 py-8 flex flex-col gap-6">
              <a href="#about" className="text-gray-700 hover:text-brand-600 text-lg font-medium">About</a>
              <a href="#courses" className="text-gray-700 hover:text-brand-600 text-lg font-medium">Courses</a>
              <a href="#resources" className="text-gray-700 hover:text-brand-600 text-lg font-medium">Resources</a>
              <a href="#testimonials" className="text-gray-700 hover:text-brand-600 text-lg font-medium">Testimonials</a>
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl text-center font-semibold hover:bg-brand-600 shadow-lg"
                >
                  Dashboard
                </Link>
              ) : (
                <div className="flex flex-col gap-4 mt-4 pt-4 border-t border-gray-200">
                  <Link to="/login" className="text-gray-700 hover:text-brand-600 text-center font-medium py-2">
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gray-900 text-white px-6 py-3 rounded-xl text-center font-semibold hover:bg-brand-600 shadow-lg"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-brand-400/20 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-purple-400/20 blur-[120px]" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[60%] rounded-full bg-blue-300/20 blur-[150px]" />
        </div>

        {/* Background Video with Glassmorphism Overlay */}
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover opacity-30"
            src={Hero_video}
            muted
            loop
            autoPlay
          ></video>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/80 via-slate-50/95 to-slate-50"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mt-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-gray-200 mb-8 animate-fade-in text-sm font-medium text-brand-700">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
            </span>
            Accelerate your career journey
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight text-gray-900 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            Learn. Grow. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
              Succeed Together.
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-gray-600 animate-fade-in-up leading-relaxed" style={{ animationDelay: '200ms' }}>
            Access world-class education, expert mentorship, and career-defining resources tailored to launch you to the next level.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-5 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
            <Link
              to="/signup"
              className="flex items-center justify-center px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-brand-600 transition-all shadow-xl shadow-gray-900/20 transform hover:-translate-y-1"
            >
              Start Learning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center justify-center px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1"
            >
              <Play className="mr-2 h-5 w-5 text-brand-600" />
              Watch Demo
            </button>
          </div>

          {/* Stats Box */}
          <div className="mt-20 grid grid-cols-3 gap-6 max-w-3xl mx-auto bg-white/60 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white animate-fade-in-up" style={{ animationDelay: '400ms' }}>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">500<span className="text-brand-500">+</span></div>
              <div className="text-sm font-medium text-gray-500 mt-2">Active Students</div>
            </div>
            <div className="border-x border-gray-200/50">
              <div className="text-3xl md:text-4xl font-bold text-gray-900">50<span className="text-brand-500">+</span></div>
              <div className="text-sm font-medium text-gray-500 mt-2">Expert Courses</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">95<span className="text-brand-500">%</span></div>
              <div className="text-sm font-medium text-gray-500 mt-2">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Video Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-md">
            <div className="relative w-11/12 md:w-3/4 lg:w-1/2 rounded-3xl overflow-hidden shadow-2xl bg-black animate-fade-in-up">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-sm transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              <video
                src={Hero_video}
                controls
                autoPlay
                className="w-full h-auto aspect-video"
              ></video>
            </div>
          </div>
        )}
      </section>      {/* About Us Section */}
      <section id="about" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Text Content */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-bold mb-6">
                Our Story
              </div>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-6 leading-tight">
                Empowering the next generation of <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">leaders</span>
              </h2>

              <p className="text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                Founded in 2022, <span className="text-brand-600 font-bold">Career Reach Hub</span> is
                dedicated to connecting ambitious individuals with life-changing opportunities.
                We believe everyone deserves access to quality mentorship and transformative career experiences.
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-6 mb-10 mt-12">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="text-4xl font-black text-brand-600 mb-2">10k+</div>
                  <div className="text-slate-500 font-medium">Success Stories</div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <div className="text-4xl font-black text-brand-600 mb-2">50+</div>
                  <div className="text-slate-500 font-medium">Partner Companies</div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="inline-flex items-center bg-gray-900 text-white hover:bg-brand-600 px-8 py-4 rounded-xl transition-all font-semibold shadow-lg hover:shadow-brand-500/30 transform hover:-translate-y-1">
                Learn More About Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>

            {/* Image & Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-500 to-purple-500 rounded-3xl transform rotate-3 scale-105 opacity-20 blur-lg"></div>
              <img
                src={Image}
                alt="Team collaboration"
                className="relative rounded-3xl shadow-2xl border-4 border-white h-[500px] w-full object-cover"
              />

              <div className="absolute -bottom-8 -left-8 glass p-6 rounded-2xl shadow-xl max-w-xs border border-white/40">
                <div className="flex items-center mb-3">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-base font-bold text-slate-800">Proven Results</span>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                  <span className="text-brand-600 font-bold">95%</span> of our users find their ideal career opportunity within six months.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Courses Preview Section */}
      <section id="courses" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-bold mb-4">
                Popular Courses
              </div>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-4">Master new skills</h2>
              <p className="text-xl text-slate-600 font-medium">
                Explore our most popular courses designed by industry experts.
              </p>
            </div>
            <button
              onClick={() => handleLearnMore('/courses')}
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-200 text-slate-900 rounded-xl font-bold hover:border-brand-600 hover:text-brand-600 transition-colors shrink-0"
            >
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div key={course.id} className="group bg-white rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 overflow-hidden transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={course.thumbnail_url}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      alt={course.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black shadow-sm ${course.is_premium ? 'bg-yellow-400 text-yellow-900' : 'bg-green-400 text-green-900'
                        }`}>
                        {course.is_premium ? `$${course.price}` : 'FREE'}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider">
                      <span className="flex items-center bg-slate-100 px-2 py-1 rounded-md">
                        <Clock className="h-4 w-4 mr-1.5 text-brand-500" />
                        {course.duration}
                      </span>
                      <span className="bg-slate-100 px-2 py-1 rounded-md">{course.level}</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 group-hover:text-brand-600 transition-colors">{course.title}</h3>
                    <p className="text-slate-600 mb-8 line-clamp-2 font-medium flex-1">{course.description}</p>
                    <button
                      onClick={() => handleLearnMore(`/courses/${course.id}`)}
                      className="w-full px-4 py-3.5 bg-slate-50 text-slate-900 rounded-xl hover:bg-brand-600 hover:text-white font-bold transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Resources Preview Section */}
      <section id="resources" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-400 via-slate-900 to-slate-900 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-playfair font-bold mb-4">Career Resources</h2>
              <p className="text-xl text-slate-400 font-medium">
                Exclusive templates, guides, and tools to boost your success.
              </p>
            </div>
            <button
              onClick={() => handleLearnMore('/resources')}
              className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl font-bold hover:bg-white hover:text-slate-900 transition-all shrink-0"
            >
              View All Resources
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-400"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {resources.map((resource) => (
                <div key={resource.id} className="glass-dark rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                  <div className="bg-gradient-to-br from-brand-500 to-purple-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-500/30">
                    <FileText className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{resource.title}</h3>
                  <p className="text-slate-400 font-medium mb-6 line-clamp-3">{resource.description}</p>
                  <button
                    onClick={() => handleLearnMore(`/resources/${resource.id}`)}
                    className="flex items-center text-brand-400 hover:text-brand-300 font-bold group"
                  >
                    Read More
                    <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-bold mb-4">
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-4">
              Don't just take our word for it
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex mt-2 mb-6 gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-slate-700 font-medium leading-relaxed mb-8">
                  "{testimonial.content}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                    <p className="text-xs font-semibold text-brand-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section id="team" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-slate-900 mb-4">
              Meet the Team
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-medium">
              The dedicated professionals shaping your career journey.
            </p>
          </div>

          <div className="flex overflow-x-auto pb-12 gap-8 snap-x snap-mandatory hide-scrollbar">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="shrink-0 w-72 bg-slate-50 rounded-3xl p-6 text-center snap-center hover:shadow-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all duration-300 group"
              >
                <div className="relative mb-6 mx-auto w-32 h-32">
                  <div className="absolute inset-0 bg-brand-500 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="relative w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-brand-600 text-sm font-bold mb-4">{member.role}</p>
                <div className="flex justify-center gap-3">
                  <a href={`mailto:${member.email}`} className="p-2 bg-white rounded-full text-slate-400 hover:text-brand-600 hover:shadow-md transition-all">
                    <Mail className="w-5 h-5" />
                  </a>
                  <a href={member.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-white rounded-full text-slate-400 hover:text-brand-600 hover:shadow-md transition-all">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white p-2 rounded-xl">
                  <img src={Logo} alt="CRH" className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-white">Career Reach Hub</h3>
              </div>
              <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                Connecting ambitious professionals with life-changing opportunities.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-600 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-600 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-600 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="p-2 bg-white/10 rounded-full hover:bg-brand-600 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#" className="hover:text-brand-400 transition-colors">Career Opportunities</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Internships</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Mentorship</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-6">Resources</h4>
              <ul className="space-y-3 font-medium">
                <li><a href="#" className="hover:text-brand-400 transition-colors">Career Blog</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Resume Templates</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Interview Prep</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-6">Contact Us</h4>
              <ul className="space-y-4 font-medium">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-500 shrink-0 mt-1" />
                  <span>2nd Floor, Gilugali House<br />Kigali, Rwanda</span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand-500 shrink-0" />
                  <span>+250 788 123 456</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand-500 shrink-0" />
                  <span>info@careerreachhub.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium">© {new Date().getFullYear()} Career Reach Hub. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-medium">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;