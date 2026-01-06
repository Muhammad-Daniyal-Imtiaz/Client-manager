'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Briefcase, 
  Code, 
  Shield, 
  Search, 
  Settings,
  CheckCircle,
  Building,
  Workflow,
  Terminal,
  UserCog,
  TrendingUp
} from 'lucide-react';

const roles = [
  {
    id: 'client',
    title: 'Client',
    description: 'Manage your projects, track progress, and communicate with your team',
    icon: Building,
    color: 'bg-blue-500',
    features: ['Project Management', 'Progress Tracking', 'Team Communication', 'Budget Management']
  },
  {
    id: 'project_manager',
    title: 'Project Manager',
    description: 'Oversee projects, assign tasks, and ensure timely delivery',
    icon: Briefcase,
    color: 'bg-purple-500',
    features: ['Team Management', 'Task Assignment', 'Timeline Tracking', 'Resource Allocation']
  },
  {
    id: 'full_stack_developer',
    title: 'Full Stack Developer',
    description: 'Build and maintain web applications with modern technologies',
    icon: Code,
    color: 'bg-green-500',
    features: ['Frontend Development', 'Backend Development', 'Database Management', 'API Integration']
  },
  {
    id: 'lead_full_stack_developer',
    title: 'Lead Developer',
    description: 'Lead technical teams and make architectural decisions',
    icon: Terminal,
    color: 'bg-orange-500',
    features: ['Team Leadership', 'Architecture Design', 'Code Review', 'Technical Decisions']
  },
  {
    id: 'admin',
    title: 'Administrator',
    description: 'Manage system users, roles, and overall platform configuration',
    icon: Shield,
    color: 'bg-red-500',
    features: ['User Management', 'Role Configuration', 'System Settings', 'Access Control']
  },
  {
    id: 'seo_developer',
    title: 'SEO Developer',
    description: 'Optimize websites for search engines and track performance',
    icon: Search,
    color: 'bg-indigo-500',
    features: ['SEO Optimization', 'Keyword Research', 'Analytics', 'Performance Tracking']
  }
];

export default function RoleSelectionPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setError(null);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }

    setLoading(true);
    // Navigate to signup page with selected role
    router.push(`/signup?role=${selectedRole}`);
  };

  const handleGoogleSignin = (role: string) => {
    setLoading(true);
    window.location.href = `/api/auth/google?role=${role}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
              <UserCog className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Choose Your Role
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Select your role to get started. Each role has specific permissions and features.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-3xl mx-auto">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          </div>
        )}

        {/* Role Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;

            return (
              <Card
                key={role.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl border-2 ${
                  isSelected
                    ? 'border-blue-500 bg-gradient-to-br from-blue-50/50 to-blue-100/30'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleRoleSelect(role.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${role.color} rounded-xl shadow-sm`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    {isSelected && (
                      <Badge className="bg-green-500 hover:bg-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl text-gray-900 mb-2">{role.title}</CardTitle>
                  <CardDescription className="text-base">{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <TrendingUp className="h-3 w-3 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoogleSignin(role.id);
                      }}
                      disabled={loading}
                    >
                      Continue with Google
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole || loading}
            size="lg"
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Continuing...
              </>
            ) : (
              <>
                <Settings className="h-5 w-5 mr-2" />
                Continue with Email & Password
              </>
            )}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Button
              variant="link"
              className="p-0 text-blue-600 hover:text-blue-800"
              onClick={() => router.push('/login')}
            >
              Sign in here
            </Button>
          </p>
        </div>

        {/* Role Info */}
        <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-r from-blue-50/50 to-purple-50/50 p-6 rounded-2xl border border-blue-200">
          <div className="flex items-center gap-3 mb-4">
            <Workflow className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">How Roles Work</h3>
          </div>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <span>Each role requires a specific password for registration</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <span>Your role determines your permissions and access levels</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <span>You can sign up with Google or Email/Password</span>
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
              <span>Role-specific passwords are provided by your organization</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}