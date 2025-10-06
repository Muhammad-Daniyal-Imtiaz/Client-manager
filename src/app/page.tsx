'use client';

import { useState, useEffect } from 'react';
import { Rocket, BarChart3, Target, Users, ArrowRight, Shield, Zap, Star, ChevronDown, Play, Award, TrendingUp, CheckCircle, Sparkles, Menu, X, Database, Clock, Calendar, PieChart, Eye, Download, MessageCircle, Bell, Search, Filter, Settings, Cloud, Lock, Smartphone, Globe, Zap as Lightning, Crown, BadgeCheck, Heart, ThumbsUp, ArrowUpRight, Target as Goal, BarChart, Users as Team, FileText, CheckSquare, Timer, Award as Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeadsFlowHeader() {
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLoadProjects = () => {
    router.push('/Comp');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleVClient = () => {
    router.push('/vclient');
  };

  const features = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Real-Time Progress Tracking",
      description: "Watch your projects evolve with live updates and dynamic progress indicators",
      stats: "95% faster decision making"
    },
    {
      icon: <Goal className="w-8 h-8" />,
      title: "Smart Milestone Management",
      description: "Automated milestone tracking with intelligent deadline predictions",
      stats: "99% on-time delivery"
    },
    {
      icon: <Team className="w-8 h-8" />,
      title: "Team Performance Analytics",
      description: "Deep insights into team productivity and individual contributions",
      stats: "47% productivity boost"
    }
  ];

  const stats = [
    { number: "500+", label: "Projects Successfully Tracked", icon: <Trophy className="w-6 h-6" /> },
    { number: "98%", label: "Client Satisfaction Rate", icon: <Heart className="w-6 h-6" /> },
    { number: "24/7", label: "Real-Time Monitoring", icon: <Clock className="w-6 h-6" /> },
    { number: "120+", label: "Active Teams", icon: <Users className="w-6 h-6" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 overflow-hidden">
      {/* Enhanced Header with Glass Morphism */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 backdrop-blur-xl shadow-2xl shadow-blue-500/10' : 'bg-transparent'}`}>
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                  LeadsFlow 180
                </h1>
                <p className="text-xs text-gray-500 font-medium">Project Intelligence Platform</p>
              </div>
            </div>
            
            {/* Enhanced Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1 bg-white/80 rounded-2xl px-4 py-2 shadow-lg shadow-blue-500/10 border border-white/50">
              <a href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-all duration-300 font-semibold rounded-xl hover:bg-blue-50 flex items-center space-x-2">
                <BarChart className="w-4 h-4" />
                <span>Dashboard</span>
              </a>
              <button 
                onClick={handleVClient}
                className="px-4 py-2 text-gray-700 hover:text-emerald-600 transition-all duration-300 font-semibold rounded-xl hover:bg-emerald-50 flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Project Progress</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </button>
            </nav>
            
            {!projectsLoaded && (
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleSignIn}
                  className="hidden md:block px-6 py-2.5 text-gray-700 hover:text-blue-600 transition-all duration-300 font-semibold rounded-xl hover:bg-white/80 backdrop-blur-sm"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleVClient}
                  className="relative bg-gradient-to-r from-blue-600 to-emerald-500 px-6 py-3 rounded-xl font-semibold text-white hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 flex items-center gap-3 group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <TrendingUp className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">View Progress</span>
                  <ArrowRight className="w-4 h-4 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                
                {/* Enhanced Mobile Menu Button */}
                <button 
                  className="lg:hidden p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg border border-white/50"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
          
          {/* Enhanced Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 py-6 bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50">
              <nav className="flex flex-col space-y-3 px-4">
                <a href="/dash" className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 transition-all duration-300 font-semibold rounded-xl hover:bg-blue-50">
                  <BarChart className="w-5 h-5" />
                  <span>Dashboard</span>
                </a>
                <button 
                  onClick={handleVClient}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-emerald-600 transition-all duration-300 font-semibold rounded-xl hover:bg-emerald-50 text-left"
                >
                  <Eye className="w-5 h-5" />
                  <span>Project Progress</span>
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </button>
                <button 
                  onClick={handleSignIn}
                  className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-blue-600 transition-all duration-300 font-semibold rounded-xl hover:bg-blue-50 text-left"
                >
                  <Lock className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main className="pt-16">
        {projectsLoaded ? (
          <div className="container mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-[#305759] mb-8">Project Dashboard</h2>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <p className="text-lg text-[#192524]">Your projects will appear here once loaded.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Ultra-Modern Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
              {/* Advanced Background with Multiple Layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-emerald-500/20"></div>
              <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl"></div>
              
              {/* Main Background Image with Enhanced Overlay */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
                style={{
                  backgroundImage: "url('https://media.istockphoto.com/id/1411195926/photo/project-manager-working-on-laptop-and-updating-tasks-and-milestones-progress-planning-with.webp?a=1&b=1&s=612x612&w=0&k=20&c=DEYYzHlSuCwIV3mkyRykDgunwcjOlxEve4MaFFDKl-Y=')"
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-emerald-900/80 backdrop-blur-[1px]"></div>
              </div>
              
              <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 min-h-screen py-20">
                  {/* Left Content - Enhanced */}
                  <div className="flex-1 text-white space-y-8">
                    {/* Trust Badge */}
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/20">
                      <BadgeCheck className="w-5 h-5 text-green-400" />
                      <span className="text-sm font-semibold">Trusted by 500+ Marketing Teams</span>
                    </div>

                    {/* Main Headline */}
                    <div className="space-y-6">
                      <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                        Project Progress
                        <span className="block bg-gradient-to-r from-blue-200 to-emerald-200 bg-clip-text text-transparent">
                          Reimagined
                        </span>
                      </h1>
                      <p className="text-xl lg:text-2xl text-blue-100 leading-relaxed max-w-2xl">
                        Experience the future of project tracking with AI-powered insights, real-time collaboration, and stunning visual progress dashboards.
                      </p>
                    </div>

                    {/* Interactive Feature Showcase */}
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 max-w-2xl">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                          {features[activeFeature].icon}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{features[activeFeature].title}</h3>
                          <p className="text-blue-100">{features[activeFeature].description}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-green-400 font-bold">{features[activeFeature].stats}</div>
                        <div className="flex space-x-2">
                          {[0, 1, 2].map((index) => (
                            <button
                              key={index}
                              onClick={() => setActiveFeature(index)}
                              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                activeFeature === index ? 'bg-white' : 'bg-white/30'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button 
                        onClick={handleVClient}
                        className="group relative bg-gradient-to-r from-blue-500 to-emerald-500 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-500 flex items-center gap-4 overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Eye className="w-6 h-6 relative z-10" />
                        <span className="relative z-10">View Live Progress</span>
                        <ArrowRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                      
                      <button 
                        onClick={handleLoadProjects}
                        className="group bg-white/10 backdrop-blur-md border-2 border-white/30 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-900 transition-all duration-500 flex items-center gap-4"
                      >
                        <Play className="w-5 h-5" />
                        <span>Watch Demo</span>
                      </button>
                    </div>

                    {/* Social Proof */}
                    <div className="flex items-center space-x-6 pt-8">
                      <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className="w-10 h-10 bg-gradient-to-br from-blue-400 to-emerald-400 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-sm">
                            {i}
                          </div>
                        ))}
                      </div>
                      <div className="text-blue-100">
                        <div className="font-bold">Join 120+ Teams</div>
                        <div className="text-sm">Already tracking progress</div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Interactive Dashboard Preview */}
                  <div className="flex-1 relative">
                    <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                      {/* Dashboard Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-white font-semibold">Live Dashboard</span>
                        </div>
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                          <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* Progress Bars */}
                      <div className="space-y-4">
                        {[
                          { label: "Design Sprint", progress: 85, color: "bg-emerald-400" },
                          { label: "Development", progress: 60, color: "bg-blue-400" },
                          { label: "QA Testing", progress: 30, color: "bg-amber-400" },
                          { label: "Deployment", progress: 10, color: "bg-purple-400" }
                        ].map((item, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-white text-sm">
                              <span>{item.label}</span>
                              <span>{item.progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div 
                                className={`${item.color} h-2 rounded-full transition-all duration-1000 ease-out`}
                                style={{ width: `${item.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">12</div>
                          <div className="text-blue-100 text-sm">Active Tasks</div>
                        </div>
                        <div className="bg-white/10 rounded-2xl p-4 text-center">
                          <div className="text-2xl font-bold text-white">3</div>
                          <div className="text-blue-100 text-sm">Due Today</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Scroll Indicator */}
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="flex flex-col items-center space-y-2 animate-bounce">
                  <span className="text-white/80 text-sm font-semibold">Explore Features</span>
                  <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
                    <div className="w-1 h-3 bg-white/80 rounded-full mt-2"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Advanced Stats Section */}
            <section className="py-20 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
              {/* Background Elements */}
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
              
              <div className="container mx-auto px-6 relative z-10">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {stats.map((stat, index) => (
                    <div 
                      key={index}
                      className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 border border-blue-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl text-white group-hover:scale-110 transition-transform duration-300">
                          {stat.icon}
                        </div>
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                          {stat.number}
                        </div>
                      </div>
                      <div className="text-gray-600 font-semibold">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Enhanced Footer */}
      {!projectsLoaded && (
        <footer className="bg-gradient-to-br from-gray-900 to-blue-900 text-white py-16 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-400 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-3xl font-bold">LeadsFlow 180</h3>
              </div>
              <p className="text-blue-200 max-w-2xl mx-auto mb-8 text-lg">
                The most advanced project progress tracking platform with AI-powered insights and real-time collaboration.
              </p>
              <div className="flex justify-center space-x-6">
                <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300">
                  <ThumbsUp className="w-6 h-6" />
                </button>
                <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300">
                  <MessageCircle className="w-6 h-6" />
                </button>
                <button className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300">
                  <Share className="w-6 h-6" />
                </button>
              </div>
              <p className="text-blue-300/60 text-sm mt-8">
                © {new Date().getFullYear()} LeadsFlow 180. The future of project tracking is here.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
