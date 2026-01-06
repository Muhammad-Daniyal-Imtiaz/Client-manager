'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  Lock,
  User,
  Building,
  Phone,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

// Role information
const roleInfo = {
  client: {
    title: 'Client',
    description: 'Sign up as a client to manage your projects',
    color: 'bg-blue-500',
    requiredFields: ['company_name']
  },
  project_manager: {
    title: 'Project Manager',
    description: 'Sign up as a project manager to oversee projects',
    color: 'bg-purple-500',
    requiredFields: ['department']
  },
  full_stack_developer: {
    title: 'Full Stack Developer',
    description: 'Sign up as a developer to work on projects',
    color: 'bg-green-500',
    requiredFields: ['tech_stack']
  },
  lead_full_stack_developer: {
    title: 'Lead Developer',
    description: 'Sign up as a lead developer to manage technical teams',
    color: 'bg-orange-500',
    requiredFields: ['team_size']
  },
  admin: {
    title: 'Administrator',
    description: 'Sign up as an admin to manage the platform',
    color: 'bg-red-500',
    requiredFields: ['admin_level']
  },
  seo_developer: {
    title: 'SEO Developer',
    description: 'Sign up as an SEO specialist to optimize projects',
    color: 'bg-indigo-500',
    requiredFields: ['seo_specialization']
  }
};

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'client';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rolePassword: '',
    company_name: '',
    department: '',
    tech_stack: '',
    team_size: '',
    admin_level: '',
    seo_specialization: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showRolePassword, setShowRolePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!role || !roleInfo[role as keyof typeof roleInfo]) {
      router.push('/role-selection');
    }
  }, [role, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Signup successful!');
        // Redirect to login after successful signup
        setTimeout(() => {
          router.push('/login?success=signup_complete');
        }, 2000);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `/api/auth/google?role=${role}`;
  };

  if (!role || !roleInfo[role as keyof typeof roleInfo]) {
    return null;
  }

  const currentRole = roleInfo[role as keyof typeof roleInfo];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => router.push('/role-selection')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Role Selection
        </Button>

        <Card className="border-0 shadow-2xl bg-gradient-to-br from-white/90 to-blue-50/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className={`p-3 ${currentRole.color} rounded-xl shadow-lg`}>
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Sign Up as {currentRole.title}
                </CardTitle>
                <CardDescription className="text-lg">
                  {currentRole.description}
                </CardDescription>
              </div>
            </div>
            
            <Badge className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2">
              <Lock className="h-3 w-3" />
              Role-specific authentication required
            </Badge>
          </CardHeader>

          <CardContent className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  {success}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700">
                    <User className="inline h-4 w-4 mr-2" />
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700">
                    <Lock className="inline h-4 w-4 mr-2" />
                    Password *
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="At least 6 characters"
                      className="border-2 border-gray-200 focus:border-blue-500 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700">
                    Confirm Password *
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Re-enter your password"
                    className="border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Role-Specific Password */}
              <div className="space-y-2">
                <Label htmlFor="rolePassword" className="text-gray-700">
                  <Shield className="inline h-4 w-4 mr-2" />
                  {currentRole.title} Password *
                  <span className="text-sm text-muted-foreground ml-2">
                    (Provided by your organization)
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    id="rolePassword"
                    name="rolePassword"
                    type={showRolePassword ? 'text' : 'password'}
                    value={formData.rolePassword}
                    onChange={handleChange}
                    required
                    placeholder={`Enter ${currentRole.title} password`}
                    className="border-2 border-gray-200 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowRolePassword(!showRolePassword)}
                  >
                    {showRolePassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role-Specific Fields */}
              {role === 'client' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company_name" className="text-gray-700">
                      <Building className="inline h-4 w-4 mr-2" />
                      Company Name *
                    </Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleChange}
                      required
                      placeholder="Your company name"
                      className="border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700">
                      <Phone className="inline h-4 w-4 mr-2" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                      className="border-2 border-gray-200 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Add other role-specific fields here... */}

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    `Create ${currentRole.title} Account`
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or continue with</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleGoogleSignup}
                  disabled={loading}
                  className="w-full py-3 border-2"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43-.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in here
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security Note */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Your role password is required for security and is provided by your organization</span>
          </div>
        </div>
      </div>
    </div>
  );
}