import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Archive, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      
      if (success) {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang di DINUS Archive Dashboard!",
        });
        navigate('/');
      }
      // Error handling is now done in the AuthContext login function
    } catch (error) {
      // This catch is for unexpected errors not related to authentication
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat login",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dinus-primary/5 via-dinus-secondary/10 to-dinus-gray p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23003d82' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm relative z-10">
          <CardHeader className="text-center space-y-6 pb-8">
            <div className="mx-auto w-24 h-24 p-2 bg-white rounded-full shadow-lg border-4 border-dinus-primary/10">
              <img 
                src="/lovable-uploads/850340bb-7cfb-4147-aaed-2c445764a543.png" 
                alt="UDINUS Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-dinus-primary via-dinus-primary-light to-dinus-secondary bg-clip-text text-transparent">
                DINUS Archive
              </CardTitle>
              <CardDescription className="text-lg mt-2 text-dinus-text/70 font-medium">
                Sistem Arsip Digital
              </CardDescription>
              <CardDescription className="text-sm text-dinus-text/60">
                Universitas Dian Nuswantoro
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-dinus-text">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-12 border-2 focus:border-dinus-primary transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-dinus-text">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-2 focus:border-dinus-primary transition-colors pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-dinus-text/50" />
                    ) : (
                      <Eye className="h-4 w-4 text-dinus-text/50" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-dinus-primary to-dinus-primary-light hover:from-dinus-primary-dark hover:to-dinus-primary text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-dinus-primary/10 text-center">
              <p className="text-sm text-dinus-text/60 mb-2">Apakah Anda seorang admin?</p>
              <Link to="/admin">
                <Button 
                  variant="outline" 
                  className="w-full border-dinus-primary/20 text-dinus-primary hover:bg-dinus-primary hover:text-white"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Login sebagai Admin
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;