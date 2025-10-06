'use client';

import { useState } from 'react';
import { Rocket, BarChart3, Target, Users, ArrowRight, Shield, Zap, Star, ChevronDown, Play, Award, TrendingUp, CheckCircle, Sparkles, Menu, X, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeadsFlowHeader() {
  const [projectsLoaded, setProjectsLoaded] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleLoadProjects = () => {
    router.push('/Comp');
  };

  const handleSignIn = () => {
    router.push('/login');
  };

  const handleVClient = () => {
    router.push('/vclient');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e7f3ef] to-[#d1ebdb]/30">
      {/* Header with professional color scheme */}
      <header className="bg-[#305759] text-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">LeadsFlow 180</h1>
              <span className="ml-4 px-3 py-1 bg-white text-[#305759] rounded-full text-sm font-medium">
                Project Tracker
              </span>
            </div>
            
            {/* Desktop Navigation - Updated */}
            <nav className="hidden md:flex space-x-6">
              <a href="/dashboard" className="hover:text-[#d1ebdb] transition-colors font-medium">Dashboard</a>
              <button 
                onClick={handleVClient}
                className="hover:text-[#d1ebdb] transition-colors font-medium"
              >
                View Project Progress
              </button>
            </nav>
            
            {!projectsLoaded && (
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSignIn}
                  className="hidden md:block text-white/80 hover:text-white transition-colors font-medium"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleVClient}
                  className="bg-white text-[#305759] px-5 py-2.5 rounded-lg font-medium hover:bg-[#e7f3ef] transition-all duration-300 flex items-center gap-2 shadow-sm"
                >
                  <Rocket className="w-4 h-4" />
                  View Project Progress
                </button>
                
                {/* Mobile Menu Button */}
                <button 
                  className="md:hidden p-2 rounded-lg bg-white/10"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
          
          {/* Mobile Navigation - Updated */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 py-4 border-t border-white/20">
              <nav className="flex flex-col space-y-3">
                <a href="/dash" className="py-2 px-4 hover:bg-white/10 rounded-lg transition-colors font-medium">Dashboard</a>
                <button 
                  onClick={handleVClient}
                  className="py-2 px-4 text-left hover:bg-white/10 rounded-lg transition-colors font-medium"
                >
                  View Project Progress
                </button>
                <button 
                  onClick={handleSignIn}
                  className="py-2 px-4 text-left hover:bg-white/10 rounded-lg transition-colors font-medium"
                >
                  Sign In
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        {projectsLoaded ? (
          <div className="container mx-auto px-6 py-12">
            <h2 className="text-3xl font-bold text-[#305759] mb-8">Project Dashboard</h2>
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <p className="text-lg text-[#192524]">Your projects will appear here once loaded.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Hero Section with Updated Background Image */}
            <section 
              className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80')"
              }}
            >
              {/* Reduced opacity overlay to make background more visible */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#305759]/70 to-[#192524]/60"></div>
              
              <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col items-center justify-center text-center min-h-screen py-12 text-white">
                  {/* Main heading */}
                  <div className="mb-10 max-w-4xl">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight mb-6">
                      Track Project Progress
                    </h1>
                    <h2 className="text-4xl md:text-5xl font-bold mb-8">
                      In Real-Time
                    </h2>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-10">
                      Monitor your project milestones, track team progress, and stay updated with real-time project status updates and analytics.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="w-24 h-1 bg-[#d1ebdb] mb-10"></div>

                  {/* CTA Buttons */}
                  <div className="flex flex-col sm:flex-row gap-6 mb-16">
                    <button 
                      onClick={handleVClient}
                      className="bg-[#d1ebdb] text-[#305759] px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white transition-all duration-300 flex items-center gap-3 shadow-md"
                    >
                      <span>View Project Progress</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={handleLoadProjects}
                      className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-[#305759] transition-all duration-300 flex items-center gap-3"
                    >
                      <Play className="w-5 h-5" />
                      <span>Launch Dashboard</span>
                    </button>
                  </div>

                  {/* Project Progress Preview */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 max-w-2xl">
                    <h3 className="text-2xl font-bold mb-2">Real-time Progress Tracking</h3>
                    <p className="text-lg">Monitor milestones, deadlines, and team performance in one centralized dashboard</p>
                  </div>
                </div>
                
                {/* Scroll indicator */}
                <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
                  <div className="flex flex-col items-center text-white animate-bounce">
                    <span className="text-sm mb-2">Scroll to explore</span>
                    <ChevronDown className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-gradient-to-b from-[#e7f3ef] to-[#d1ebdb]/50 relative">
              <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold text-[#192524] mb-6">
                    Track Your Project <span className="text-[#305759]">Progress</span>
                  </h2>
                  <p className="text-xl text-[#192524]">
                    Get real-time insights into your project milestones, team performance, and completion status.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white/90 p-8 rounded-2xl border border-[#959D90]/30 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 bg-[#305759] rounded-2xl flex items-center justify-center mb-6">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#192524] mb-4">Progress Analytics</h3>
                    <p className="text-[#192524] mb-4">
                      Track project completion rates and team performance with real-time progress analytics.
                    </p>
                    <ul className="space-y-2">
                      {['Milestone tracking', 'Completion metrics', 'Progress reports', 'Timeline updates'].map((item) => (
                        <li key={item} className="flex items-center text-[#192524]">
                          <CheckCircle className="w-5 h-5 text-[#305759] mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/90 p-8 rounded-2xl border border-[#959D90]/30 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 bg-[#305759] rounded-2xl flex items-center justify-center mb-6">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#192524] mb-4">Milestone Tracking</h3>
                    <p className="text-[#192524] mb-4">
                      Monitor all your project milestones and deadlines with intuitive progress indicators.
                    </p>
                    <ul className="space-y-2">
                      {['Timeline view', 'Deadline alerts', 'Progress indicators', 'Status updates'].map((item) => (
                        <li key={item} className="flex items-center text-[#192524]">
                          <CheckCircle className="w-5 h-5 text-[#305759] mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white/90 p-8 rounded-2xl border border-[#959D90]/30 hover:shadow-lg transition-all duration-300">
                    <div className="w-16 h-16 bg-[#305759] rounded-2xl flex items-center justify-center mb-6">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#192524] mb-4">Team Progress</h3>
                    <p className="text-[#192524] mb-4">
                      Track individual and team contributions with detailed progress monitoring and reporting.
                    </p>
                    <ul className="space-y-2">
                      {['Team performance', 'Task completion', 'Progress metrics', 'Contribution tracking'].map((item) => (
                        <li key={item} className="flex items-center text-[#192524]">
                          <CheckCircle className="w-5 h-5 text-[#305759] mr-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 bg-[#305759] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full filter blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-[#d1ebdb] rounded-full filter blur-3xl"></div>
              </div>
              
              <div className="container mx-auto px-6 relative z-10">
                <div className="text-center text-white mb-16">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Real-Time Project Insights</h2>
                  <p className="text-xl text-white/90 max-w-3xl mx-auto">
                    Get instant visibility into your project status and team performance with our advanced progress tracking.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">95%</div>
                    <div className="text-white/90">Projects On Track</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
                    <div className="text-white/90">Progress Updates</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">99%</div>
                    <div className="text-white/90">Deadline Accuracy</div>
                  </div>
                  <div className="text-center bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                    <div className="text-4xl md:text-5xl font-bold text-white mb-2">500+</div>
                    <div className="text-white/90">Milestones Tracked</div>
                  </div>
                </div>
                
                <div className="mt-16 bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold text-white mb-4">Ready to track your progress?</h3>
                      <p className="text-white/90">Get real-time insights into your project milestones and team performance.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={handleVClient}
                        className="bg-white text-[#305759] px-8 py-4 rounded-xl font-semibold hover:bg-[#e7f3ef] transition-all duration-300 flex items-center gap-3 whitespace-nowrap shrink-0 shadow-md"
                      >
                        <TrendingUp className="w-5 h-5" />
                        View Project Progress
                      </button>
                      <button 
                        onClick={handleLoadProjects}
                        className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-[#305759] transition-all duration-300 flex items-center gap-3"
                      >
                        Launch Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      {!projectsLoaded && (
        <footer className="bg-[#192524] text-white py-12">
          <div className="container mx-auto px-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-6 h-6 text-[#d1ebdb]" />
              <h3 className="text-2xl font-bold">LeadsFlow 180</h3>
            </div>
            <p className="text-white/80 max-w-2xl mx-auto mb-6">
              Advanced project progress tracking and milestone management for teams that need real-time visibility.
            </p>
            <p className="text-white/60 text-sm">
              © {new Date().getFullYear()} LeadsFlow 180. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
