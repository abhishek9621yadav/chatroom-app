'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Loader2, MessageSquare, Users, Lock, Globe, Rocket } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useUser();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChatrooms: 0,
    activeChats: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (response.ok) {
          setStats(data);
        }
      } catch (error) {
        toast.error('Failed to load statistics');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleGetStarted = () => {
    if (user?.email) {
      router.push('/chatrooms');
    } else {
      router.push('/auth/login');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Connect with your community
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
            Join public discussions or create private chatrooms with friends and colleagues.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" onClick={handleGetStarted}>
              Get Started
              <Rocket className="ml-2 h-4 w-4" />
            </Button>
            {user?.email && (
              <Button variant="outline" size="lg" onClick={() => router.push('/chatrooms')}>
                Your Chatrooms
                <MessageSquare className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            Our Growing Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard
              icon={<Users className="w-8 h-8" />}
              title="Total Users"
              value={loadingStats ? '...' : stats.totalUsers.toLocaleString()}
              description="Join our vibrant community"
            />
            <StatCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="Chatrooms"
              value={loadingStats ? '...' : stats.totalChatrooms.toLocaleString()}
              description="Active conversations"
            />
            <StatCard
              icon={<Globe className="w-8 h-8" />}
              title="Active Chats"
              value={loadingStats ? '...' : stats.activeChats.toLocaleString()}
              description="Happening right now"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Real-time Messaging"
              description="Chat with others in real-time with our lightning-fast messaging system."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Group Chats"
              description="Create or join chatrooms with up to 1025 members for your community."
            />
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Private Rooms"
              description="Secure private chatrooms with password protection for sensitive conversations."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800 text-white">
        <div className="container mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start chatting?</h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Join thousands of users already enjoying our platform.
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-200"
            onClick={handleGetStarted}
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}

function StatCard({ icon, title, value, description }: StatCardProps) {
  return (
    <Card className="text-center p-6 hover:shadow-lg transition-shadow">
      <CardHeader className="items-center">
        <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
          {icon}
        </div>
        <CardTitle className="text-4xl font-bold text-gray-900 dark:text-white">
          {value}
        </CardTitle>
        <CardDescription className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500 dark:text-gray-400">{description}</p>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </Card>
  );
}