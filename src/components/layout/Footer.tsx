import React from 'react';
import pisgaLogo from '@/assets/pisga-logo-ashdod.png';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto">
      {/* Quote Section */}
      <div className="bg-[#1e3a5f]/90 backdrop-blur-sm py-6 px-4">
        <p className="text-center text-white text-sm md:text-base leading-relaxed max-w-4xl mx-auto">
          "מנהיגות פדגוגית היא לא רק ניהול הקיים, אלא היכולת לזהות את הניצוץ במורה הבודד ולהפוך אותו ללהבה של שינוי במערכת כולה."
        </p>
      </div>
      
      {/* Credits Section */}
      <div className="bg-white/95 backdrop-blur-sm py-4 px-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-3">
          <img 
            src={pisgaLogo} 
            alt="לוגו פסג״ה אשדוד" 
            className="h-8 w-auto object-contain"
          />
          <p className="text-center text-gray-600 text-xs md:text-sm">
            כלי פיתוח של פסג"ה אשדוד © 2026 | משרד החינוך
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
