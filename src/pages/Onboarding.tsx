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

const Onboarding: React.FC = () => {
  const { user, updateUser, addTrainings } = useApp();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    gender: user?.gender || 'male',
    district: user?.district || 'דרום',
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

  const generateSampleTrainings = (): Training[] => {
    const categories = ['פדגוגיה', 'טכנולוגיה', 'ניהול', 'רווחה', 'חינוך מיוחד', 'מנהיגות'] as const;
    const audiences = ['גנים', 'יסודי', 'תיכון', 'חינוך מיוחד'] as const;
    const reforms = ['אופק חדש', 'עוז לתמורה', 'אחר'] as const;
    const methods = ['פרונטלי', 'סינכרוני', 'א-סינכרוני'] as const;
    const domains = ['מנהיגות', 'טכנו-פדגוגיה', 'חינוך מיוחד', 'אחר'] as const;
    
    const trainingNames = [
      'הוראה מותאמת בעידן הדיגיטלי',
      'מנהיגות פדגוגית בזמני שינוי',
      'כלים טכנולוגיים לכיתה',
      'רווחה נפשית של צוות ההוראה',
      'הוראה דיפרנציאלית',
      'הערכה מעצבת בפועל',
      'למידה משמעותית',
      'שילוב תלמידי חינוך מיוחד',
      'פיתוח חשיבה יצירתית',
      'תקשורת בין-אישית',
      'ניהול זמן וארגון',
      'AI בחינוך',
    ];

    return trainingNames.map((name, index) => ({
      id: `training-${index + 1}`,
      trainingName: name,
      date: `2025-${String(Math.floor(Math.random() * 6) + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      participants: Math.floor(Math.random() * 50) + 10,
      category: categories[Math.floor(Math.random() * categories.length)],
      targetAudience: audiences[Math.floor(Math.random() * audiences.length)],
      reform: reforms[Math.floor(Math.random() * reforms.length)],
      learningMethod: methods[Math.floor(Math.random() * methods.length)],
      domain: domains[Math.floor(Math.random() * domains.length)],
      durationHours: Math.floor(Math.random() * 20) + 4,
      facilitator: ['ד"ר שרה לוי', 'מר יוסי כהן', 'גב\' רחל מזרחי', 'פרופ\' דוד שמיר'][Math.floor(Math.random() * 4)],
      userId: user?.id || '1',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.city) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user data
      updateUser({
        ...formData,
        onboardingCompleted: true,
      });

      // Generate sample trainings (in real app, parse from uploaded file)
      const trainings = generateSampleTrainings();
      addTrainings(trainings);

      toast.success('הנתונים נשמרו בהצלחה!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('אירעה שגיאה בשמירת הנתונים');
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
                <Label htmlFor="gender">מגדר</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => handleInputChange('gender', value)}
                >
                  <SelectTrigger className="border-2 border-primary/30 focus:border-primary shadow-sm">
                    <SelectValue placeholder="בחר מגדר" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">זכר</SelectItem>
                    <SelectItem value="female">נקבה</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                  placeholder="מחוז"
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
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    בחר לוגו
                  </Button>
                </label>

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
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    בחר קובץ
                  </Button>
                </label>

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
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    multiple
                    onChange={handleAdditionalFileUpload}
                    className="hidden"
                  />
                  <Button type="button" variant="outline" className="gap-2">
                    <Upload className="h-4 w-4" />
                    הוסף קבצים
                  </Button>
                </label>

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
                className="gap-2 text-white border-0"
                style={{ backgroundColor: '#d4af37' }}
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