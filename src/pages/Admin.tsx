import React, { useState, useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Shield } from 'lucide-react';

interface UserProgress {
  id: string;
  city: string;
  fullName: string;
  steps: {
    onboarding: 'completed' | 'inProgress' | 'notStarted';
    dashboard: 'completed' | 'inProgress' | 'notStarted';
    reflection: 'completed' | 'inProgress' | 'notStarted';
    vision: 'completed' | 'inProgress' | 'notStarted';
    output: 'completed' | 'inProgress' | 'notStarted';
  };
}

// Sample data - in real app this would come from database
const sampleUsers: UserProgress[] = [
  { id: '1', city: 'אופקים', fullName: 'שרה לוי', steps: { onboarding: 'completed', dashboard: 'completed', reflection: 'inProgress', vision: 'notStarted', output: 'notStarted' } },
  { id: '2', city: 'באר שבע', fullName: 'יוסי כהן', steps: { onboarding: 'completed', dashboard: 'completed', reflection: 'completed', vision: 'completed', output: 'inProgress' } },
  { id: '3', city: 'דימונה', fullName: 'רחל מזרחי', steps: { onboarding: 'completed', dashboard: 'inProgress', reflection: 'notStarted', vision: 'notStarted', output: 'notStarted' } },
  { id: '4', city: 'ירוחם', fullName: 'דוד שמיר', steps: { onboarding: 'completed', dashboard: 'completed', reflection: 'completed', vision: 'completed', output: 'completed' } },
  { id: '5', city: 'נתיבות', fullName: 'מרים אברהם', steps: { onboarding: 'inProgress', dashboard: 'notStarted', reflection: 'notStarted', vision: 'notStarted', output: 'notStarted' } },
  { id: '6', city: 'ערד', fullName: 'אלי גולן', steps: { onboarding: 'completed', dashboard: 'completed', reflection: 'completed', vision: 'inProgress', output: 'notStarted' } },
  { id: '7', city: 'קריית גת', fullName: 'נעמי פרץ', steps: { onboarding: 'completed', dashboard: 'completed', reflection: 'inProgress', vision: 'notStarted', output: 'notStarted' } },
  { id: '8', city: 'שדרות', fullName: 'משה ביטון', steps: { onboarding: 'completed', dashboard: 'inProgress', reflection: 'notStarted', vision: 'notStarted', output: 'notStarted' } },
];

const stepNames = ['קליטה', 'דשבורד', 'רפלקציה', 'חזון', 'תוצרים'];

const getStepColor = (status: 'completed' | 'inProgress' | 'notStarted') => {
  switch (status) {
    case 'completed':
      return 'bg-green-500';
    case 'inProgress':
      return 'bg-yellow-400';
    case 'notStarted':
      return 'bg-gray-300';
  }
};

const getStepTitle = (status: 'completed' | 'inProgress' | 'notStarted') => {
  switch (status) {
    case 'completed':
      return 'הושלם';
    case 'inProgress':
      return 'בתהליך';
    case 'notStarted':
      return 'לא התחיל';
  }
};

const Admin: React.FC = () => {
  const sortedUsers = useMemo(() => {
    return [...sampleUsers].sort((a, b) => a.city.localeCompare(b.city, 'he'));
  }, []);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <div className="card-elevated">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">פאנל ניהול</h1>
              <p className="text-muted-foreground">מעקב התקדמות מנהלי פסג"ה</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-green-500"></div>
              <span>הושלם</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
              <span>בתהליך</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gray-300"></div>
              <span>לא התחיל</span>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-primary/5">
                  <TableHead className="text-right w-16">#</TableHead>
                  <TableHead className="text-right">ישוב</TableHead>
                  <TableHead className="text-right">שם מלא</TableHead>
                  <TableHead className="text-center">התקדמות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.map((user, index) => (
                  <TableRow key={user.id} className="hover:bg-primary/5">
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{user.city}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        {Object.entries(user.steps).map(([key, status], stepIndex) => (
                          <div
                            key={key}
                            className="flex flex-col items-center"
                            title={`${stepNames[stepIndex]}: ${getStepTitle(status)}`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full ${getStepColor(status)} transition-all hover:scale-110`}
                            ></div>
                            <span className="text-[10px] text-muted-foreground mt-1">
                              {stepNames[stepIndex]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-center">
              <div className="text-2xl font-bold text-green-600">
                {sortedUsers.filter(u => u.steps.output === 'completed').length}
              </div>
              <div className="text-sm text-green-700">סיימו את כל השלבים</div>
            </div>
            <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {sortedUsers.filter(u => Object.values(u.steps).some(s => s === 'inProgress')).length}
              </div>
              <div className="text-sm text-yellow-700">בתהליך</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {sortedUsers.filter(u => u.steps.onboarding === 'notStarted').length}
              </div>
              <div className="text-sm text-gray-700">לא התחילו</div>
            </div>
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
              <div className="text-2xl font-bold text-primary">{sortedUsers.length}</div>
              <div className="text-sm text-primary/70">סה"כ משתמשים</div>
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Admin;