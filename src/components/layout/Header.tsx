import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  BarChart3, 
  MessageCircle, 
  Rocket, 
  Download,
  User,
  Shield,
  LogOut,
  LogIn
} from 'lucide-react';
import ministryLogo from '@/assets/ministry-logo.png';

const navItems = [
  { label: 'דף בית', route: '/', icon: Home },
  { label: 'קליטת נתונים', route: '/onboarding', icon: FileText },
  { label: 'ניתוח פדגוגי', route: '/dashboard', icon: BarChart3 },
  { label: 'שיחה רפלקטיבית', route: '/reflection', icon: MessageCircle },
  { label: 'חזון וקפיצה', route: '/vision', icon: Rocket },
  { label: 'תוצרים', route: '/output', icon: Download },
];

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: appUser } = useApp();
  const { user: authUser, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Ministry of Education Logo - Right Side */}
        <div className="flex items-center gap-3">
          <img 
            src={ministryLogo} 
            alt="משרד החינוך" 
            className="h-12 w-auto"
          />
          <Link to="/" className="flex items-center gap-2">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
            >
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold gradient-text">פסג"ה פורצת דרך</h1>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.route;
            return (
              <Link
                key={item.route}
                to={item.route}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Section - Left Side */}
        <div className="flex items-center gap-3">
          {appUser?.fullName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{appUser.fullName}</span>
            </div>
          )}
          
          {/* Admin Button */}
          {authUser && (
            <Link
              to="/admin"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                location.pathname === '/admin'
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/10 text-accent hover:bg-accent/20"
              )}
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">ניהול</span>
            </Link>
          )}

          {/* Auth Button */}
          {authUser ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">התנתק</span>
            </Button>
          ) : (
            <Link to="/auth">
              <Button
                variant="default"
                size="sm"
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span>התחבר</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
