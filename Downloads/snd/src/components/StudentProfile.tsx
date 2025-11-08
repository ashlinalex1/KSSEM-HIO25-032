import { useState, useEffect } from "react";
import { 
  Smartphone, 
  Calendar, 
  TrendingUp, 
  CheckCircle,
  Monitor,
  MessageSquare,
  Star,
  User
} from "lucide-react";
// import studentAvatar from "@/assets/student-avatar.png"; // Commented out - image asset not found

interface Card {
  id: number;
  angle: number;
  visible: boolean;
}

// Calculate radius: profile radius (96px) + card half-width (128px) + spacing (60px) = 284px
// Using 300px for better spacing
const CARD_RADIUS = 300;
const PROFILE_RADIUS = 96; // Half of w-48 (192px)

const StudentProfile = () => {
  // 5 cards evenly spaced: 360 / 5 = 72 degrees apart
  const [cards, setCards] = useState<Card[]>([
    { id: 1, angle: 0, visible: false },
    { id: 2, angle: 72, visible: false },
    { id: 3, angle: 144, visible: false },
    { id: 4, angle: 216, visible: false },
    { id: 5, angle: 288, visible: false },
  ]);

  useEffect(() => {
    // Initial pop out - cards come out one by one
    const popOutSequence = () => {
      for (let index = 0; index < 5; index++) {
        setTimeout(() => {
          setCards(prev => prev.map((card, i) => 
            i === index ? { ...card, visible: true } : card
          ));
        }, index * 200); // 200ms delay between each card
      }
    };

    // Pop in - all cards go back together
    const popInSequence = () => {
      setCards(prev => prev.map(card => ({ ...card, visible: false })));
    };

    // Start the animation sequence
    popOutSequence();

    // After all cards are out (5 cards * 200ms = 1000ms), wait 3 seconds, then pop in
    const popInTimeout = setTimeout(() => {
      popInSequence();
    }, 1000 + 3000); // 1s for pop out + 3s display time

    // Repeat the cycle every 8 seconds
    const interval = setInterval(() => {
      popOutSequence();
      setTimeout(() => {
        popInSequence();
      }, 1000 + 3000);
    }, 8000);

    return () => {
      clearInterval(interval);
      clearTimeout(popInTimeout);
    };
  }, []);

  const getCardPosition = (angle: number, radius: number = CARD_RADIUS) => {
    const radian = (angle - 90) * (Math.PI / 180);
    return {
      x: Math.cos(radian) * radius,
      y: Math.sin(radian) * radius,
    };
  };

  const renderCard = (card: Card, index: number) => {
    const position = getCardPosition(card.angle, CARD_RADIUS);
    // Staggered delay for pop out (one by one), no delay for pop in (all together)
    const delay = card.visible ? index * 0.2 : 0;

    return (
      <div
        key={card.id}
        className={`absolute ${
          card.visible ? 'animate-pop-out' : 'animate-pop-in'
        }`}
        style={{
          left: '50%',
          top: '50%',
          '--card-x': `${position.x}px`,
          '--card-y': `${position.y}px`,
          transform: `translate(-50%, -50%) translate(var(--card-x), var(--card-y))`,
          transformOrigin: 'center center',
          animationDelay: `${delay}s`,
          zIndex: 20,
          willChange: 'transform, opacity',
        } as React.CSSProperties}
      >
        {card.id === 1 && <MobileScreentimeCard />}
        {card.id === 2 && <AttendanceCard />}
        {card.id === 3 && <RemarksCard />}
        {card.id === 4 && <GradesCard />}
        {card.id === 5 && <DesktopScreentimeCard />}
      </div>
    );
  };

  return (
    <div className="relative mx-auto w-full max-w-6xl h-[800px] md:h-[900px] overflow-hidden bg-background">
      {/* Animated particles */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-primary/10 animate-particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 20}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}

      {/* Central Profile with Rotating Rings */}
      <div className="absolute inset-0 flex items-center justify-center scale-[0.85] md:scale-100">
        {/* Outer Ring - Dashed */}
        <svg className="absolute w-[420px] h-[420px] animate-rotate" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--ring-outer) / 0.3))' }}>
          <circle
            cx="210"
            cy="210"
            r="200"
            fill="none"
            stroke="hsl(var(--ring-outer))"
            strokeWidth="7"
            strokeDasharray="36 18"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Middle Ring - Dashed */}
        <svg className="absolute w-[360px] h-[360px] animate-rotate-reverse" style={{ filter: 'drop-shadow(0 0 8px hsl(var(--ring-middle) / 0.3))' }}>
          <circle
            cx="180"
            cy="180"
            r="170"
            fill="none"
            stroke="hsl(var(--ring-middle))"
            strokeWidth="6"
            strokeDasharray="32 16"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Inner Ring - Dashed */}
        <svg className="absolute w-[300px] h-[300px] animate-rotate" style={{ filter: 'drop-shadow(0 0 6px hsl(var(--ring-inner) / 0.3))' }}>
          <circle
            cx="150"
            cy="150"
            r="140"
            fill="none"
            stroke="hsl(var(--ring-inner))"
            strokeWidth="5"
            strokeDasharray="26 14"
            strokeLinecap="round"
          />
        </svg>

        {/* Central Profile Circle */}
        <div className="relative z-30 w-48 h-48 rounded-full bg-gradient-to-br from-[hsl(var(--glow-primary))]/80 via-[hsl(var(--glow-secondary))]/80 to-[hsl(var(--glow-primary))]/80 shadow-2xl flex items-center justify-center animate-pulse"
          style={{
            boxShadow: '0 0 40px hsl(var(--glow-primary) / 0.3), 0 0 80px hsl(var(--glow-secondary) / 0.2), inset 0 0 30px hsl(var(--glow-primary) / 0.15)',
            animationDuration: '3s'
          }}
        >
          <div className="w-44 h-44 rounded-full bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 flex items-center justify-center overflow-hidden border-[3px] border-white shadow-lg">
            <User className="w-24 h-24 text-white opacity-90" />
          </div>
        </div>

        {/* Floating Cards */}
        {cards.map((card, index) => renderCard(card, index))}
      </div>
    </div>
  );
};

const MobileScreentimeCard = () => (
  <div className="w-60 md:w-64 p-5 rounded-2xl backdrop-blur-xl border shadow-2xl hover:scale-105 transition-all duration-300"
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
      borderColor: 'hsl(var(--glass-border))',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: 'hsl(var(--info) / 0.15)',
          boxShadow: '0 4px 12px hsl(var(--info) / 0.2)'
        }}
      >
        <Smartphone className="w-6 h-6" style={{ color: 'hsl(var(--info))' }} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">Mobile Screentime</h3>
        <p className="text-sm text-slate-600">Last 24 hours</p>
      </div>
    </div>
    
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-sm" />
            Study
          </span>
          <span className="text-sm font-bold text-slate-800">4h 32m</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full w-[68%] bg-gradient-to-r from-success to-success/80 rounded-full" />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-warning rounded-sm" />
            Entertainment
          </span>
          <span className="text-sm font-bold text-slate-800">2h 08m</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full w-[32%] bg-gradient-to-r from-warning to-warning/80 rounded-full" />
        </div>
      </div>
      
      <div className="pt-2 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Total</span>
          <span className="text-lg font-bold text-slate-800">6h 40m</span>
        </div>
      </div>
    </div>
  </div>
);

const AttendanceCard = () => (
  <div className="w-60 md:w-64 p-5 rounded-2xl backdrop-blur-xl border shadow-2xl hover:scale-105 transition-all duration-300"
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
      borderColor: 'hsl(var(--success) / 0.3)',
      boxShadow: '0 8px 32px hsl(var(--success) / 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: 'hsl(var(--success) / 0.15)',
          boxShadow: '0 4px 12px hsl(var(--success) / 0.2)'
        }}
      >
        <Calendar className="w-6 h-6" style={{ color: 'hsl(var(--success))' }} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">Attendance</h3>
        <p className="text-sm text-slate-600">This semester</p>
      </div>
    </div>
    
    <div className="flex items-center gap-2 mb-4">
      <CheckCircle className="w-5 h-5 text-success" />
      <span className="text-sm text-slate-600">Present</span>
      <span className="text-3xl font-bold text-slate-800 ml-auto">94%</span>
    </div>
    
    <div className="grid grid-cols-3 gap-3 mb-3">
      <div className="text-center p-3 rounded-lg bg-success/10">
        <div className="text-2xl font-bold text-success">142</div>
        <div className="text-xs text-slate-600">Present</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-warning/10">
        <div className="text-2xl font-bold text-warning">6</div>
        <div className="text-xs text-slate-600">Absent</div>
      </div>
      <div className="text-center p-3 rounded-lg bg-info/10">
        <div className="text-2xl font-bold text-info">3</div>
        <div className="text-xs text-slate-600">Late</div>
      </div>
    </div>
    
    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
      <div className="h-full w-[94%] bg-gradient-to-r from-success to-success/80 rounded-full" />
    </div>
  </div>
);

const RemarksCard = () => (
  <div className="w-60 md:w-64 p-5 rounded-2xl backdrop-blur-xl border shadow-2xl hover:scale-105 transition-all duration-300"
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
      borderColor: 'hsl(var(--warning) / 0.3)',
      boxShadow: '0 8px 32px hsl(var(--warning) / 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: 'hsl(var(--warning) / 0.15)',
          boxShadow: '0 4px 12px hsl(var(--warning) / 0.2)'
        }}
      >
        <MessageSquare className="w-6 h-6" style={{ color: 'hsl(var(--warning))' }} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">Teacher Remarks</h3>
        <p className="text-sm text-slate-600">Latest feedback</p>
      </div>
    </div>
    
    <div className="space-y-3">
      <div className="p-3 rounded-lg bg-slate-50 border-l-4 border-success">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-4 h-4 text-warning fill-warning" />
          <span className="text-xs font-semibold text-slate-600">Ms. Johnson - Math</span>
        </div>
        <p className="text-sm text-slate-700">"Excellent problem-solving skills. Keep up the great work!"</p>
      </div>
      
      <div className="p-3 rounded-lg bg-slate-50 border-l-4 border-info">
        <div className="flex items-center gap-2 mb-1">
          <Star className="w-4 h-4 text-warning fill-warning" />
          <span className="text-xs font-semibold text-slate-600">Mr. Davis - Physics</span>
        </div>
        <p className="text-sm text-slate-700">"Shows strong understanding of concepts. Participates well in class."</p>
      </div>
      
      <div className="text-center p-2 rounded-lg bg-warning/10">
        <span className="text-sm font-medium text-slate-700">Overall Rating: </span>
        <span className="text-lg font-bold text-warning">4.8/5.0</span>
      </div>
    </div>
  </div>
);

const GradesCard = () => (
  <div className="w-60 md:w-64 p-5 rounded-2xl backdrop-blur-xl border shadow-2xl hover:scale-105 transition-all duration-300"
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
      borderColor: 'hsl(var(--secondary) / 0.3)',
      boxShadow: '0 8px 32px hsl(var(--secondary) / 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: 'hsl(var(--secondary) / 0.15)',
          boxShadow: '0 4px 12px hsl(var(--secondary) / 0.2)'
        }}
      >
        <TrendingUp className="w-6 h-6" style={{ color: 'hsl(var(--secondary))' }} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">Academic Performance</h3>
        <p className="text-sm text-slate-600">Current semester</p>
      </div>
    </div>
    
    <div className="mb-4">
      <div className="text-sm text-slate-600 mb-1">Overall GPA</div>
      <div className="flex items-end gap-2">
        <span className="text-5xl font-bold text-slate-800">3.8</span>
        <span className="text-xl text-slate-600 mb-2">/4.0</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-success mt-2">
        <TrendingUp className="w-4 h-4" />
        <span>+0.2 from last term</span>
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100">
        <span className="text-sm text-slate-700">Mathematics</span>
        <span className="text-sm font-bold text-success">A</span>
      </div>
      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100">
        <span className="text-sm text-slate-700">Physics</span>
        <span className="text-sm font-bold text-success">A-</span>
      </div>
      <div className="flex justify-between items-center p-2 rounded-lg bg-slate-100">
        <span className="text-sm text-slate-700">Computer Science</span>
        <span className="text-sm font-bold text-success">A+</span>
      </div>
    </div>
  </div>
);

const DesktopScreentimeCard = () => (
  <div className="w-60 md:w-64 p-5 rounded-2xl backdrop-blur-xl border shadow-2xl hover:scale-105 transition-all duration-300"
    style={{
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
      borderColor: 'hsl(330 81% 60% / 0.3)',
      boxShadow: '0 8px 32px hsl(330 81% 60% / 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
    }}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{
          background: 'hsl(330 81% 60% / 0.15)',
          boxShadow: '0 4px 12px hsl(330 81% 60% / 0.2)'
        }}
      >
        <Monitor className="w-6 h-6" style={{ color: 'hsl(330 81% 60%)' }} />
      </div>
      <div>
        <h3 className="text-lg font-bold text-slate-800">Desktop Screentime</h3>
        <p className="text-sm text-slate-600">Last 24 hours</p>
      </div>
    </div>
    
    <div className="space-y-3">
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-sm" />
            Study
          </span>
          <span className="text-sm font-bold text-slate-800">5h 45m</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full w-[72%] bg-gradient-to-r from-success to-success/80 rounded-full" />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-slate-700 flex items-center gap-2">
            <div className="w-2 h-2 bg-warning rounded-sm" />
            Entertainment
          </span>
          <span className="text-sm font-bold text-slate-800">2h 15m</span>
        </div>
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full w-[28%] bg-gradient-to-r from-warning to-warning/80 rounded-full" />
        </div>
      </div>
      
      <div className="pt-2 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600">Total</span>
          <span className="text-lg font-bold text-slate-800">8h 00m</span>
        </div>
      </div>
    </div>
  </div>
);

export default StudentProfile;