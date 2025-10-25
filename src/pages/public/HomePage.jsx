import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { 
  BookOpen, Users, Award, ArrowRight, Play, Clock, Star,
  Download, FileText, Video, Quote, Mail, Phone, MapPin, Instagram,
  Linkedin, Twitter, Facebook, TrendingUp, Target, Heart, CheckCircle, Youtube
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
import Emmanuel from '../../assets/team_members/emmanuel.png';
import Image from '../../assets/place_of_work.jpg';
import Logo from '../../assets/Logo.png';

import Hero_video from '../../assets/Career Reach Hub.mp4';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

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
      phone: '+250 781 882 027',
      linkedin: 'https://linkedin.com/in/habiyaremye'
    },
    {
      name: 'Muheto Jackson',
      role: 'Founder & CEO',
      image: Jackson,
      email: 'shyakamuhetojackson@gmail.com',
      phone: '+250 794 395 653',
      linkedin: 'https://www.linkedin.com/in/jackson-muheto-00220923b'
    },
    {
      name: 'Nkurunziza Hodali',
      role: 'Social Media & Communication officer',
      image: Hodali,
      email: 'nkurunzizahodar@gmail.com',
      phone: '+1 (613) 617-4504',
      linkedin: 'https://linkedin.com/in/nkurunzizahodali'
    },
    {
      name: 'John Kelly',
      role: 'Co-Founder & Chief Operating Officer',
      image: JohnKelly,
      email: 'john@careerreachhub.com',
      phone: '+1 (555) 456-7890',
      linkedin: 'https://linkedin.com/in/johnkelly'
    },
    {
      name: 'Natasha Agarwal',
      role: 'Finance & Planning Officer',
      image: Natasha,
      email: 'natashaa2099@gmail.com',
      phone: '+1 (239) 564-8488',
      linkedin: 'https://linkedin.com/in/natashaaragarwal'
    },
    {
      name: 'Elisha Steven',
      role: 'Marketing Operations Officer',
      image: Steven,
      email: 'elishatumusiime@gmail.com',
      phone: '+250 791 892 784',
      linkedin: 'https://linkedin.com/in/elishasteven'
    },
    {
      name: 'Ishimwe Denis Pacifique',
      role: 'Partnerships Manager',
      image: Pacific,
      email: 'ishimwe@brandeis.edu',
      phone: '+1 (857) 961-6777',
      linkedin: 'https://linkedin.com/in/ishimwepacific'
    },
    {
      name: 'Eddy Mutoniwase',
      role: 'Chief Operating & Marketing officer',
      image: Eddy,
      email: 'eddymutoniwase@gmail.com',
      phone: '+250 785 938 080',
      linkedin: 'https://linkedin.com/in/eddymutoniwase'
    },
    {
      name: 'Esther Mukakamanzi',
      role: 'Resources & Finance Manager',
      image: Esther,
      email: 'esthermukakamanzi6@gmail.com',
      phone: '+250789 115 408',
      linkedin: 'https://linkedin.com/in/esthermukakamanzi'
    },
    {
      name: 'Emmanuel Semaza',
      role: 'Software Engineer',
      image: Emmanuel,
      email: 'semaza@asyv.org',
      phone: '+250 798 721 418',
      linkedin: 'https://linkedin.com/in/emmanuelsemaza'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              {/* <BookOpen className="h-8 w-8 text-blue-600" /> */}
              <img src={Logo} alt="CRH Logo" className="h-10 w-10" />
              <span className="ml-2 text-xl font-bold text-gray-900">Career Reach Hub</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#about" className="text-gray-700 hover:text-blue-600 text-sm font-medium">About</a>
              <a href="#courses" className="text-gray-700 hover:text-blue-600 text-sm font-medium">Courses</a>
              <a href="#resources" className="text-gray-700 hover:text-blue-600 text-sm font-medium">Resources</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 text-sm font-medium">Testimonials</a>
              <a href="#team" className="text-gray-700 hover:text-blue-600 text-sm font-medium">Team</a>
              {user ? (
                <Link to="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 text-sm font-medium">
                    Login
                  </Link>
                  <Link to="/signup" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Video */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0">
          <video
            className="w-full h-full object-cover"
            src={Hero_video}
            autoPlay = "true"
            loop = "true"
            ></video>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in">
            Welcome to <span className="text-blue-400">Career Reach Hub</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-200">
            Your gateway to quality education, career resources, and professional guidance. Transform your career today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <a
              href="#courses"
              className="flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition-all"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </a>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-blue-400">500+</div>
              <div className="text-sm text-gray-300 mt-1">Active Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400">50+</div>
              <div className="text-sm text-gray-300 mt-1">Expert Courses</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400">95%</div>
              <div className="text-sm text-gray-300 mt-1">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 font-inter">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            {/* Text Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-800 mb-6">
                About Career Reach Hub
              </h2>
              
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Founded in 2022, <span className="text-blue-600 font-semibold">Career Reach Hub</span> has been
                dedicated to connecting ambitious individuals with life-changing opportunities. 
                We believe that everyone deserves access to quality mentorship, meaningful internships,
                and transformative career experiences.
              </p>

              <p className="text-lg text-gray-700 mb-10 leading-relaxed">
                Our platform bridges the gap between <span className="text-blue-600 font-medium">talent and opportunity</span>,
                creating a collaborative ecosystem where students, professionals, and industry experts unite
                to build successful careers. Through our innovative programs, we’ve empowered thousands to 
                achieve their dreams and reach their full potential.
              </p>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-gray-600">Opportunities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">10k+</div>
                  <div className="text-gray-600">Success Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
                  <div className="text-gray-600">Partner Companies</div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="inline-flex items-center bg-blue-600 text-white hover:bg-blue-800 px-6 py-3 rounded-xl transition-colors font-semibold shadow-md">
                Learn More About Us
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
            
            {/* Image & Card */}
            <div className="relative">
              <img
                src={Image}
                alt="Team collaboration"
                className="rounded-2xl shadow-lg w-full border border-gray-100 h-96 object-cover"
              />
              
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-lg max-w-xs border border-gray-100">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm font-semibold text-gray-900">Proven Results</span>
                </div>
                <p className="text-sm text-gray-600 leading-snug">
                  <span className="text-orange-600 font-medium">95%</span> of our users find their ideal career opportunity within six months.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* Courses Preview Section */}
      <section id="courses" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <p className="text-xl text-gray-600">
              Explore our most popular courses designed by industry experts
            </p>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-6 rounded-full"></div>
            <div className="text-right mt-12 ">
            <button
              onClick={() => handleLearnMore('/courses')}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Courses
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 items-center md:grid-cols-3 gap-8 justify-end text-center">
              {courses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail_url}
                      className="w-full h-full object-cover"
                      alt={course.title}
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        course.is_premium ? 'bg-yellow-500 text-white' : 'bg-green-500 text-white'
                      }`}>
                        {course.is_premium ? `$${course.price}` : 'Free'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {course.duration}
                      </span>
                      <span className="capitalize">{course.level}</span>
                    </div>
                    <button
                      onClick={() => handleLearnMore(`/courses/${course.id}`)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                    >
                      Learn More
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Resources Preview Section */}
      <section id="resources" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Career Resources</h2>
            <p className="text-xl text-gray-600">
              Access valuable resources to boost your career success
            </p>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-6 rounded-full"></div>
            <div className="text-right mt-12">
            <button
              onClick={() => handleLearnMore('/resources')}
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Resources
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {resources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all">
                  <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{resource.description}</p>
                  <button
                    onClick={() => handleLearnMore(`/resources/${resource.id}`)}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read More
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>


      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hear from the people who’ve experienced the power of Career Reach Hub — growing, connecting, and succeeding together.
            </p>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-300 group"
              >
                <div className="flex items-start mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-4 border-blue-100 group-hover:border-blue-400 transition-colors duration-300"
                  />
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-blue-600 font-medium">{testimonial.role}</p>
                    <div className="flex mt-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-blue-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>

                <blockquote className="text-gray-700 italic leading-relaxed text-lg border-l-4 border-blue-400 pl-4 rounded-[20px]">
                  “{testimonial.content}”
                </blockquote>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-10">
            <p className="text-gray-700 text-lg mb-4">
              Be part of a growing community shaping their futures with{" "}
              <span className="text-blue-600 font-semibold">Career Reach Hub</span>
            </p>
            <button className="bg-blue-500 text-white hover:bg-blue-600 px-6 py-3 rounded-lg transition-colors font-medium">
              Share Your Story
            </button>
          </div>
        </div>
      </section>



      {/* Meet Our Team Section */}
      <section className="py-24 bg-gradient-to-b from-white to-gray-50 font-inter">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-800 mb-4">
              Meet Our Team
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              The dedicated professionals shaping your career journey
            </p>
            <div className="w-24 h-1 bg-blue-500 mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Team Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 justify-items-center">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-72 text-center p-8 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 group snap-center border border-gray-100"
              >
                {/* Image */}
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-blue-200 group-hover:border-blue-400 transition-colors duration-300"
                  />
                </div>

                {/* Name & Role */}
                <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-5">{member.role}</p>

                {/* Contact Info */}
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex items-center justify-center">
                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                    <a
                      href={`mailto:${member.email}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {member.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-center">
                    <Phone className="w-4 h-4 mr-2 text-blue-500" />
                    <a
                      href={`tel:${member.phone}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {member.phone}
                    </a>
                  </div>
                </div>

                {/* LinkedIn */}
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-blue-500 text-white rounded-full hover:bg-blue-500 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            ))}
          </div>
        </div>
    </section>

    {/* Footer */}
    <footer className="bg-white text-gray-900">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-blue-600">Career Reach Hub</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Connecting ambitious professionals with life-changing opportunities. Your gateway to career success.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-blue-500 hover:text-blue-600 transition-colors">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-600">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Career Opportunities</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Internships</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Courses</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Mentorship</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-600">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Career Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Resume Templates</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Interview Prep</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Salary Guide</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Success Stories</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-500 transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-blue-600">Contact Us</h4>
            <div className="space-y-4">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 mt-1 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-gray-600">2nd Floor</p>
                  <p className="text-gray-600">Gilugali House, KG 11 Ave</p>
                  <p className="text-gray-600">Kicukiro District</p>
                  <p className="text-gray-600">Kigali, Rwanda</p>
                </div>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                <a href="tel:+250788123456" className="text-gray-600 hover:text-blue-500 transition-colors">
                  +250 788 123 456
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-blue-600 flex-shrink-0" />
                <a href="mailto:info@careerreachhub.com" className="text-gray-600 hover:text-orange-500 transition-colors">
                  info@careerreachhub.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-gray-200 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 Career Reach Hub. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-500 hover:text-blue-500 text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-500 hover:text-blue-500 text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-500 hover:text-blue-500 text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>

    </div>
  );
} 

export default HomePage;