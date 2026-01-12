import React, { useState, useCallback } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  User, 
  MapPin, 
  Building2, 
  Upload, 
  FileSpreadsheet,
  ArrowLeft,
  Check,
  Image,
  File,
  X,
  Plus
} from 'lucide-react';
import { Training } from '@/types';
import * as XLSX from 'xlsx';

const Onboarding: React.FC = () => {
  const { user, updateUser, addTrainings } = useApp();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    gender: user?.gender || '',
    district: user?.district || '',
    city: user?.city || '',
    pisgaSymbol: user?.pisgaSymbol || '',
    numKindergartens: user?.numKindergartens || 0,
    numElementary: user?.numElementary || 0,
    numHighSchools: user?.numHighSchools || 0,
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      toast.success(`הקובץ "${file.name}" הועלה בהצלחה`);
    }
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      toast.success(`הלוגו "${file.name}" הועלה בהצלחה`);
    }
  }, []);

  const handleAdditionalFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setAdditionalFiles(prev => [...prev, ...newFiles]);
      toast.success(`${newFiles.length} קבצים הועלו בהצלחה`);
    }
  }, []);

  const removeAdditionalFile = (index: number) => {
    setAdditionalFiles(prev => prev.filter((_, i) => i !== index));
  };

  const parseExcelFile = async (file: File): Promise<Training[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          
          const allTrainings: Training[] = [];
          
          // Parse all sheets in the workbook
          workbook.SheetNames.forEach((sheetName, sheetIndex) => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
            
            if (jsonData.length < 2) return; // Skip empty sheets
            
            const headers = jsonData[0] as string[];
            const rows = jsonData.slice(1);
            
            // Map Hebrew column names to our data structure
            const columnMap: Record<string, string> = {
              'שם השתלמות': 'trainingName',
              'שם ההשתלמות': 'trainingName',
              'תאריך': 'date',
              'משתתפים': 'participants',
              'מספר משתתפים': 'participants',
              'קטגוריה': 'category',
              'קהל יעד': 'targetAudience',
              'רפורמה': 'reform',
              'שיטת למידה': 'learningMethod',
              'אופן למידה': 'learningMethod',
              'תחום': 'domain',
              'שעות': 'durationHours',
              'משך בשעות': 'durationHours',
              'מנחה': 'facilitator',
              'הערות': 'notes',
            };
            
            const getColumnIndex = (fieldName: string): number => {
              for (const [hebrewName, englishName] of Object.entries(columnMap)) {
                if (englishName === fieldName) {
                  const idx = headers.findIndex(h => 
                    h && h.toString().includes(hebrewName)
                  );
                  if (idx !== -1) return idx;
                }
              }
              return -1;
            };
            
            rows.forEach((row, rowIndex) => {
              if (!row || row.length === 0 || !row.some(cell => cell)) return; // Skip empty rows
              
              const nameIdx = getColumnIndex('trainingName');
              const trainingName = nameIdx !== -1 ? row[nameIdx]?.toString() : row[0]?.toString();
              
              if (!trainingName || trainingName.trim() === '') return;
              
              const dateIdx = getColumnIndex('date');
              const participantsIdx = getColumnIndex('participants');
              const categoryIdx = getColumnIndex('category');
              const audienceIdx = getColumnIndex('targetAudience');
              const reformIdx = getColumnIndex('reform');
              const methodIdx = getColumnIndex('learningMethod');
              const domainIdx = getColumnIndex('domain');
              const hoursIdx = getColumnIndex('durationHours');
              
              const parseCategory = (val: string): Training['category'] => {
                const categories = ['פדגוגיה', 'טכנולוגיה', 'ניהול', 'רווחה', 'חינוך מיוחד', 'מנהיגות'];
                const found = categories.find(c => val?.includes(c));
                return (found as Training['category']) || 'אחר';
              };
              
              const parseAudience = (val: string): Training['targetAudience'] => {
                const audiences = ['גנים', 'יסודי', 'תיכון', 'חינוך מיוחד'];
                const found = audiences.find(a => val?.includes(a));
                return (found as Training['targetAudience']) || 'יסודי';
              };
              
              const parseReform = (val: string): Training['reform'] => {
                if (val?.includes('אופק')) return 'אופק חדש';
                if (val?.includes('עוז')) return 'עוז לתמורה';
                return 'אחר';
              };
              
              const parseMethod = (val: string): Training['learningMethod'] => {
                if (val?.includes('סינכרוני') && !val?.includes('א-סינכרוני')) return 'סינכרוני';
                if (val?.includes('א-סינכרוני')) return 'א-סינכרוני';
                return 'פרונטלי';
              };
              
              const parseDomain = (val: string): Training['domain'] => {
                const domains = ['מנהיגות', 'טכנו-פדגוגיה', 'חינוך מיוחד'];
                const found = domains.find(d => val?.includes(d));
                return (found as Training['domain']) || 'אחר';
              };
              
              const training: Training = {
                id: `training-${sheetIndex}-${rowIndex + 1}`,
                trainingName: trainingName.trim(),
                date: dateIdx !== -1 && row[dateIdx] ? formatExcelDate(row[dateIdx]) : new Date().toISOString().split('T')[0],
                participants: participantsIdx !== -1 ? parseInt(row[participantsIdx]) || 20 : 20,
                category: categoryIdx !== -1 ? parseCategory(row[categoryIdx]?.toString() || '') : 'פדגוגיה',
                targetAudience: audienceIdx !== -1 ? parseAudience(row[audienceIdx]?.toString() || '') : 'יסודי',
                reform: reformIdx !== -1 ? parseReform(row[reformIdx]?.toString() || '') : 'אחר',
                learningMethod: methodIdx !== -1 ? parseMethod(row[methodIdx]?.toString() || '') : 'פרונטלי',
                domain: domainIdx !== -1 ? parseDomain(row[domainIdx]?.toString() || '') : 'אחר',
                durationHours: hoursIdx !== -1 ? parseInt(row[hoursIdx]) || 4 : 4,
                userId: user?.id || '1',
              };
              
              allTrainings.push(training);
            });
          });
          
          resolve(allTrainings);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsBinaryString(file);
    });
  };
  
  const formatExcelDate = (excelDate: any): string => {
    if (typeof excelDate === 'number') {
      // Excel serial date
      const date = new Date((excelDate - 25569) * 86400 * 1000);
      return date.toISOString().split('T')[0];
    }
    if (typeof excelDate === 'string') {
      // Try to parse various date formats
      const parts = excelDate.split(/[\/\-\.]/);
      if (parts.length === 3) {
        const [a, b, c] = parts.map(p => parseInt(p));
        if (a > 31) return `${a}-${String(b).padStart(2, '0')}-${String(c).padStart(2, '0')}`;
        if (c > 31) return `${c}-${String(b).padStart(2, '0')}-${String(a).padStart(2, '0')}`;
      }
      return excelDate;
    }
    return new Date().toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.city) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    if (!uploadedFile) {
      toast.error('נא להעלות קובץ השתלמויות');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user data
      updateUser({
        ...formData,
        gender: formData.gender as 'male' | 'female' | '',
        onboardingCompleted: true,
      });

      // Parse trainings from uploaded Excel file
      const trainings = await parseExcelFile(uploadedFile);
      
      if (trainings.length === 0) {
        toast.error('לא נמצאו השתלמויות בקובץ');
        setIsSubmitting(false);
        return;
      }
      
      addTrainings(trainings);

      toast.success(`נטענו ${trainings.length} השתלמויות מהקובץ בהצלחה!`);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('אירעה שגיאה בקריאת הקובץ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <div className="card-elevated">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">קליטת נתונים</h1>
              <p className="text-muted-foreground">הזינו את פרטי הפסג"ה ונתונים ראשוניים</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">שם מלא *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="שם פרטי ומשפחה"
                  required
                  className="border-2 border-primary/30 focus:border-primary shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">מגדר</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleInputChange('gender', value)}
                  dir="rtl"
                >
                  <SelectTrigger className="border-2 border-primary/30 focus:border-primary shadow-sm text-right">
                    <SelectValue placeholder="בחר מגדר" />
                  </SelectTrigger>
                  <SelectContent align="end" className="text-right">
                    <SelectItem value="male">זכר</SelectItem>
                    <SelectItem value="female">נקבה</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="district" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  מחוז
                </Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  placeholder="בחר מחוז"
                  className="border-2 border-primary/30 focus:border-primary shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">ישוב *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="שם הישוב"
                  required
                  className="border-2 border-primary/30 focus:border-primary shadow-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pisgaSymbol">סמל פסג"ה</Label>
                <Input
                  id="pisgaSymbol"
                  value={formData.pisgaSymbol}
                  onChange={(e) => handleInputChange('pisgaSymbol', e.target.value)}
                  placeholder="סמל מוסד"
                  className="border-2 border-primary/30 focus:border-primary shadow-sm"
                />
              </div>
            </div>

            {/* Schools Count */}
            <div className="p-4 rounded-xl bg-secondary/50 border-2 border-primary/20">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">מוסדות חינוך</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numKindergartens">מספר גנים</Label>
                  <Input
                    id="numKindergartens"
                    type="number"
                    min="0"
                    value={formData.numKindergartens}
                    onChange={(e) => handleInputChange('numKindergartens', parseInt(e.target.value) || 0)}
                    className="border-2 border-primary/30 focus:border-primary shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numElementary">בתי ספר יסודיים</Label>
                  <Input
                    id="numElementary"
                    type="number"
                    min="0"
                    value={formData.numElementary}
                    onChange={(e) => handleInputChange('numElementary', parseInt(e.target.value) || 0)}
                    className="border-2 border-primary/30 focus:border-primary shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numHighSchools">בתי ספר תיכוניים</Label>
                  <Input
                    id="numHighSchools"
                    type="number"
                    min="0"
                    value={formData.numHighSchools}
                    onChange={(e) => handleInputChange('numHighSchools', parseInt(e.target.value) || 0)}
                    className="border-2 border-primary/30 focus:border-primary shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors" style={{ backgroundColor: 'rgba(135, 206, 250, 0.2)' }}>
              <div className="text-center">
                <Image className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-2">העלאת לוגו פסג"ה</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  העלו קובץ תמונה בפורמט PNG או JPG מהמחשב או מהדרייב
                </p>
                
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                  בחר לוגו
                </Button>

                {logoFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-center gap-2 text-green-600"
                  >
                    <Image className="h-4 w-4" />
                    <span className="text-sm">{logoFile.name}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Training File Upload */}
            <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors" style={{ backgroundColor: 'rgba(135, 206, 250, 0.2)' }}>
              <div className="text-center">
                <FileSpreadsheet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">העלאת קובץ השתלמויות *</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  העלו קובץ PDF, Excel או CSV מהמחשב או מהדרייב
                </p>
                
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="training-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => document.getElementById('training-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                  בחר קובץ
                </Button>

                {uploadedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 flex items-center justify-center gap-2 text-green-600"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="text-sm">{uploadedFile.name}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Additional Files Upload */}
            <div className="p-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors" style={{ backgroundColor: 'rgba(135, 206, 250, 0.2)' }}>
              <div className="text-center">
                <Plus className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-medium text-foreground mb-2">קבצים נוספים (אופציונלי)</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  העלו קבצים נוספים שיכולים לסייע בתהליך
                </p>
                
                <input
                  type="file"
                  multiple
                  onChange={handleAdditionalFileUpload}
                  className="hidden"
                  id="additional-upload"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => document.getElementById('additional-upload')?.click()}
                >
                  <Upload className="h-4 w-4" />
                  הוסף קבצים
                </Button>

                {additionalFiles.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 space-y-2"
                  >
                    {additionalFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center gap-2 text-primary bg-primary/10 rounded-lg px-3 py-2"
                      >
                        <File className="h-4 w-4" />
                        <span className="text-sm">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAdditionalFile(index)}
                          className="hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                size="lg"
                disabled={isSubmitting}
                className="gap-2 text-white border-0 rounded-full px-8 shadow-md font-medium"
                style={{ backgroundColor: 'rgba(30, 58, 95, 0.8)' }}
              >
                {isSubmitting ? 'שומר...' : 'שמור והמשך'}
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Onboarding;