'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, 
  BookOpen, 
  Users, 
  GraduationCap, 
  Star, 
  CheckCircle,
  Play,
  MessageSquare,
  Target,
  Award,
  Globe,
  Shield,
  Zap,
  Heart,
  Brain,
  Lightbulb,
  TrendingUp,
  Clock,
  UserCheck,
  BarChart3,
  Eye,
  Search,
  Filter,
  ChevronRight,
  Quote
} from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('learning')

  const handleGetStarted = () => {
    router.push('/login')
  }

  const handleLearnMore = () => {
    // Scroll to features section
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Appian</span>
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </a>
                <a href="#scenarios" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Scenarios
                </a>
                <a href="#testimonials" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Testimonials
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button onClick={handleGetStarted}>
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3 w-3 mr-1" />
              AI-Powered Learning Platform
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Master Social Work Skills with
              <span className="text-blue-600"> AI Simulations</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Practice real-world scenarios, develop critical thinking, and build confidence 
              through immersive AI-powered case studies designed for social work education.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
                Start Learning Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={handleLearnMore} className="text-lg px-8 py-3">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Experience Real-World Practice
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Interact with AI personas in realistic scenarios that mirror actual social work situations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Interactive Conversations</h3>
                    <p className="text-gray-600">Engage in meaningful dialogue with AI personas that respond authentically to your approach.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Competency-Based Learning</h3>
                    <p className="text-gray-600">Focus on specific social work competencies with targeted case studies and assessments.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Progress Tracking</h3>
                    <p className="text-gray-600">Monitor your development with detailed analytics and personalized feedback.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <Card className="p-6 shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">AI</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Sarah, 34</p>
                      <p className="text-sm text-gray-500">Client seeking help with family issues</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">
                      "I've been struggling with my teenage daughter. She's been acting out lately, 
                      and I don't know how to connect with her anymore. I feel like I'm failing as a parent."
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">Show empathy</Button>
                    <Button size="sm" variant="outline">Ask about specifics</Button>
                    <Button size="sm" variant="outline">Explore family dynamics</Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools and features designed specifically for social work education and practice.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">AI-Powered Personas</h3>
              <p className="text-gray-600">
                Interact with realistic AI personas that respond authentically to your communication style and approach.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Diverse Case Studies</h3>
              <p className="text-gray-600">
                Access a wide range of case studies covering different populations, issues, and practice settings.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Progress Analytics</h3>
              <p className="text-gray-600">
                Track your learning journey with detailed analytics and personalized insights.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Faculty Dashboard</h3>
              <p className="text-gray-600">
                Comprehensive tools for faculty to manage students, track progress, and create assignments.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safe Learning Environment</h3>
              <p className="text-gray-600">
                Practice in a risk-free environment where you can make mistakes and learn from them.
              </p>
            </Card>
            
            <Card className="p-6 text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Accessible Anywhere</h3>
              <p className="text-gray-600">
                Learn on your schedule with our responsive platform that works on any device.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Scenarios Section */}
      <section id="scenarios" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Practice Real Scenarios
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore diverse case studies that prepare you for real-world social work practice.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Heart className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Family Counseling</h3>
                <p className="text-gray-600 mb-4">
                  Work with families experiencing communication breakdowns and relationship challenges.
                </p>
                <Badge variant="secondary">Family Systems</Badge>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Users className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Crisis Intervention</h3>
                <p className="text-gray-600 mb-4">
                  Practice crisis intervention skills with clients in acute distress situations.
                </p>
                <Badge variant="secondary">Crisis Management</Badge>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Lightbulb className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mental Health Support</h3>
                <p className="text-gray-600 mb-4">
                  Support clients dealing with mental health challenges and develop treatment plans.
                </p>
                <Badge variant="secondary">Mental Health</Badge>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <TrendingUp className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Substance Abuse</h3>
                <p className="text-gray-600 mb-4">
                  Help clients navigate recovery and develop coping strategies for substance use.
                </p>
                <Badge variant="secondary">Addiction Recovery</Badge>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
                <Shield className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Child Welfare</h3>
                <p className="text-gray-600 mb-4">
                  Navigate complex child welfare cases and family reunification processes.
                </p>
                <Badge variant="secondary">Child Protection</Badge>
              </CardContent>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                <Globe className="h-16 w-16 text-white" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Outreach</h3>
                <p className="text-gray-600 mb-4">
                  Develop community programs and engage with diverse populations.
                </p>
                <Badge variant="secondary">Community Practice</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Students & Faculty Say
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from those who are already using Appian to enhance their social work education.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-blue-600 mb-4" />
              <p className="text-gray-600 mb-4">
                "Appian has transformed how I practice social work. The AI simulations feel so real, 
                and I've gained confidence in handling difficult conversations."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-medium">SM</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Sarah Martinez</p>
                  <p className="text-sm text-gray-500">MSW Student</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-blue-600 mb-4" />
              <p className="text-gray-600 mb-4">
                "As a faculty member, I love how Appian allows me to track student progress and 
                provide targeted feedback. It's revolutionized my teaching approach."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-medium">DJ</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dr. Jennifer Davis</p>
                  <p className="text-sm text-gray-500">Social Work Professor</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-blue-600 mb-4" />
              <p className="text-gray-600 mb-4">
                "The variety of scenarios and the realistic AI responses have prepared me better 
                for my field placement than any traditional case study could."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-purple-600 font-medium">MR</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Michael Rodriguez</p>
                  <p className="text-sm text-gray-500">BSW Student</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Social Work Education?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students and faculty who are already using Appian to enhance their learning and teaching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={handleGetStarted} className="text-lg px-8 py-3">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">Appian</span>
              </div>
              <p className="text-gray-400">
                Empowering social work education through AI-powered simulations and comprehensive learning tools.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Case Studies</a></li>
                <li><a href="#" className="hover:text-white">Analytics</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Appian. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
