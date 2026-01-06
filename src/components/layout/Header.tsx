import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { 
  Home, 
  FileText, 
  BarChart3, 
  MessageCircle, 
  Rocket, 
  Download,
  User
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
  const { user } = useApp();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
              <span className="text-xl font-bold text-primary-foreground">ט</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold gradient-text">טיפ טופ בפסג"ה</h1>
              <p className="text-xs text-muted-foreground">מחוז דרום</p>
            </div>
          </motion.div>
        </Link>

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

        {/* User Section */}
        <div className="flex items-center gap-3">
          {user?.fullName && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{user.fullName}</span>
            </div>
          )}
          {/* Ministry of Education Logo */}
          <img 
            src={ministryLogo} 
            alt="משרד החינוך" 
            className="h-12 w-auto"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;