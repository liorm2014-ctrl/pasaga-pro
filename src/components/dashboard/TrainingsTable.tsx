import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  AlertCircle,
  ChevronDown,
  Calendar,
  Users,
  Clock,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Training } from '@/types';

interface TrainingsTableProps {
  trainings: Training[];
}

const TrainingsTable: React.FC<TrainingsTableProps> = ({ trainings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [facilitatorFilter, setFacilitatorFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const categories = useMemo(() => 
    [...new Set(trainings.map(t => t.category))].filter(Boolean),
    [trainings]
  );
  
  const audiences = useMemo(() => 
    [...new Set(trainings.map(t => t.targetAudience))].filter(Boolean),
    [trainings]
  );
  
  const facilitators = useMemo(() => 
    [...new Set(trainings.map(t => t.facilitator).filter(Boolean))],
    [trainings]
  );

  // Filter trainings
  const filteredTrainings = useMemo(() => {
    return trainings.filter(training => {
      // Search filter
      if (searchTerm && !training.trainingName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Category filter
      if (categoryFilter !== 'all' && training.category !== categoryFilter) {
        return false;
      }
      
      // Audience filter
      if (audienceFilter !== 'all' && training.targetAudience !== audienceFilter) {
        return false;
      }
      
      // Facilitator filter
      if (facilitatorFilter !== 'all' && training.facilitator !== facilitatorFilter) {
        return false;
      }
      
      // Date range filter
      if (dateFrom && new Date(training.date) < new Date(dateFrom)) {
        return false;
      }
      if (dateTo && new Date(training.date) > new Date(dateTo)) {
        return false;
      }
      
      return true;
    });
  }, [trainings, searchTerm, categoryFilter, audienceFilter, facilitatorFilter, dateFrom, dateTo]);

  // Identify at-risk trainings
  const isAtRisk = (training: Training) => {
    return training.participants < 10 || training.durationHours < 2;
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setAudienceFilter('all');
    setFacilitatorFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchTerm || categoryFilter !== 'all' || audienceFilter !== 'all' || 
    facilitatorFilter !== 'all' || dateFrom || dateTo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground text-lg">טבלת תכניות</h3>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="חיפוש תכנית..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-64"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={showFilters ? 'bg-primary/10' : ''}
          >
            <Filter className="h-4 w-4 ml-2" />
            סינון
            <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 ml-1" />
              נקה
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-muted/30 rounded-lg"
        >
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">קטגוריה</label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="כל הקטגוריות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">קהל יעד</label>
            <Select value={audienceFilter} onValueChange={setAudienceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="כל הקהלים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקהלים</SelectItem>
                {audiences.map(aud => (
                  <SelectItem key={aud} value={aud}>{aud}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">מנחה</label>
            <Select value={facilitatorFilter} onValueChange={setFacilitatorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="כל המנחים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל המנחים</SelectItem>
                {facilitators.map(fac => (
                  <SelectItem key={fac} value={fac as string}>{fac}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">מתאריך</label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">עד תאריך</label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">
          מציג {filteredTrainings.length} מתוך {trainings.length} תכניות
        </p>
        {filteredTrainings.filter(isAtRisk).length > 0 && (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            {filteredTrainings.filter(isAtRisk).length} תכניות בסיכון
          </Badge>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right font-bold">שם התכנית</TableHead>
              <TableHead className="text-right font-bold">תאריך</TableHead>
              <TableHead className="text-right font-bold">קטגוריה</TableHead>
              <TableHead className="text-right font-bold">קהל יעד</TableHead>
              <TableHead className="text-right font-bold">משתתפים</TableHead>
              <TableHead className="text-right font-bold">שעות</TableHead>
              <TableHead className="text-right font-bold">מנחה</TableHead>
              <TableHead className="text-right font-bold">סטטוס</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTrainings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  לא נמצאו תכניות
                </TableCell>
              </TableRow>
            ) : (
              filteredTrainings.map((training) => (
                <TableRow 
                  key={training.id}
                  className={isAtRisk(training) ? 'bg-destructive/5 hover:bg-destructive/10' : ''}
                >
                  <TableCell className="font-medium">{training.trainingName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {new Date(training.date).toLocaleDateString('he-IL')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{training.category}</Badge>
                  </TableCell>
                  <TableCell>{training.targetAudience}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {training.participants}
                      {training.participants < 10 && (
                        <AlertCircle className="h-3 w-3 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {training.durationHours}
                      {training.durationHours < 2 && (
                        <AlertCircle className="h-3 w-3 text-warning" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{training.facilitator || '-'}</TableCell>
                  <TableCell>
                    {isAtRisk(training) ? (
                      <Badge variant="destructive" className="gap-1">
                        <AlertCircle className="h-3 w-3" />
                        בסיכון
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-success border-success">
                        תקין
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
};

export default TrainingsTable;
