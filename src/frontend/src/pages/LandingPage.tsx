import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageCircle, Image, Heart } from 'lucide-react';
import { useEffect } from 'react';

export default function LandingPage() {
  const { login, loginStatus, identity } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/feed' });
    }
  }, [identity, navigate]);

  return (
    <div className="space-y-16 py-8">
      <section className="text-center space-y-6">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Connect with Friends
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Share moments, build connections, and stay in touch with the people who matter most
        </p>
        <Button
          onClick={login}
          disabled={loginStatus === 'logging-in'}
          size="lg"
          className="text-lg px-8 py-6"
        >
          {loginStatus === 'logging-in' ? 'Signing in...' : 'Get Started'}
        </Button>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Build Your Network</h3>
            <p className="text-sm text-muted-foreground">
              Connect with friends and expand your social circle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <MessageCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Share Updates</h3>
            <p className="text-sm text-muted-foreground">
              Post your thoughts and stay updated with your friends
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Share Photos</h3>
            <p className="text-sm text-muted-foreground">
              Capture and share your favorite moments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Stay Connected</h3>
            <p className="text-sm text-muted-foreground">
              Keep up with what matters to you most
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
