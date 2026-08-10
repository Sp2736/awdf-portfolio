import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

const LeftHand = ({ className }) => (
  <svg viewBox="0 0 100 120" className={className} fill="#e2a77a" style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' }}>
    <rect x="20" y="40" width="50" height="60" rx="15" />
    <rect x="20" y="20" width="10" height="30" rx="5" />
    <rect x="33" y="10" width="10" height="40" rx="5" />
    <rect x="46" y="5" width="10" height="45" rx="5" />
    <rect x="59" y="15" width="10" height="35" rx="5" />
    <rect x="68" y="45" width="12" height="30" rx="6" transform="rotate(25 68 45)" />
    <rect x="22" y="90" width="46" height="30" fill="#cbd5e1" />
  </svg>
);

const RightHand = ({ className }) => (
  <svg viewBox="0 0 100 120" className={className} fill="#e2a77a" style={{ filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' }}>
    <rect x="30" y="40" width="50" height="60" rx="15" />
    <rect x="31" y="15" width="10" height="35" rx="5" />
    <rect x="44" y="5" width="10" height="45" rx="5" />
    <rect x="57" y="10" width="10" height="40" rx="5" />
    <rect x="70" y="20" width="10" height="30" rx="5" />
    <rect x="20" y="45" width="12" height="30" rx="6" transform="rotate(-25 32 45)" />
    <rect x="32" y="90" width="46" height="30" fill="#cbd5e1" />
  </svg>
);

const KEYBOARD_ROWS = [
  ['esc', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'del'],
  ['tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'enter'],
  ['shiftL', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'shiftR'],
  ['fn', 'ctrl', 'alt', 'cmd', 'space', 'cmd', 'alt', 'ctrl']
];

// Map keys to their approximate % positions on the keyboard
const KEY_POSITIONS = {
  'shiftL': { x: 5, y: 70 },
  'v': { x: 35, y: 70 },
  'i': { x: 65, y: 30 },
  'e': { x: 28, y: 30 },
  'w': { x: 21, y: 30 },
  'space': { x: 50, y: 90 },
  'shiftR': { x: 92, y: 70 },
  'r': { x: 35, y: 30 },
  's': { x: 21, y: 50 },
  'u': { x: 57, y: 30 },
  'm': { x: 57, y: 70 },
  'enter': { x: 90, y: 50 }
};

const CHOREOGRAPHY = [
  { hand: 'left', key: 'shiftL', text: "", time: 0.15 },
  { hand: 'left', key: 'v', text: "V", time: 0.1 },
  { hand: 'left', key: 'shiftL', text: "V", time: 0.05 },
  { hand: 'right', key: 'i', text: "Vi", time: 0.1 },
  { hand: 'left', key: 'e', text: "Vie", time: 0.1 },
  { hand: 'left', key: 'w', text: "View", time: 0.1 },
  { hand: 'right', key: 'space', text: "View ", time: 0.1 },
  { hand: 'right', key: 'shiftR', text: "View ", time: 0.15 },
  { hand: 'left', key: 'r', text: "View R", time: 0.1 },
  { hand: 'right', key: 'shiftR', text: "View R", time: 0.05 },
  { hand: 'left', key: 'e', text: "View Re", time: 0.1 },
  { hand: 'left', key: 's', text: "View Res", time: 0.1 },
  { hand: 'right', key: 'u', text: "View Resu", time: 0.1 },
  { hand: 'right', key: 'm', text: "View Resum", time: 0.1 },
  { hand: 'left', key: 'e', text: "View Resume", time: 0.1 },
  { hand: 'right', key: 'enter', text: "View Resume", time: 0.2 },
];

export default function LandingHero({ onEnterResume }) {
  const [typedText, setTypedText] = useState("");
  const [activeKey, setActiveKey] = useState(null);
  
  const containerControls = useAnimation();
  const screenControls = useAnimation();
  const leftHandControls = useAnimation();
  const rightHandControls = useAnimation();

  useEffect(() => {
    let isMounted = true;
    
    async function sequence() {
      // 1. Initial wait
      await new Promise(r => setTimeout(r, 500));
      if (!isMounted) return;

      // 2. Laptop scales in
      await containerControls.start({ scale: 1, opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } });
      
      // 3. Hands slide in from bottom
      leftHandControls.start({ top: "110%", left: "20%", opacity: 1, transition: { duration: 0.5 } });
      await rightHandControls.start({ top: "110%", left: "70%", opacity: 1, transition: { duration: 0.5 } });

      await new Promise(r => setTimeout(r, 300));

      // 4. Choreographed typing
      for (const step of CHOREOGRAPHY) {
        if (!isMounted) return;
        
        const pos = KEY_POSITIONS[step.key];
        const controls = step.hand === 'left' ? leftHandControls : rightHandControls;
        
        // Move hand to key (adjusting so finger roughly hits center)
        await controls.start({ 
          left: `calc(${pos.x}% - 10px)`, 
          top: `calc(${pos.y}% - 10px)`, 
          transition: { duration: step.time, ease: "easeOut" } 
        });
        
        // Simulate press
        setActiveKey(step.key);
        controls.start({ scale: 0.85, transition: { duration: 0.05 } });
        await new Promise(r => setTimeout(r, 50));
        controls.start({ scale: 1, transition: { duration: 0.05 } });
        setActiveKey(null);
        
        // Update screen text
        setTypedText(step.text);
      }

      await new Promise(r => setTimeout(r, 300));

      // 6. Screen flashes white
      screenControls.start({ backgroundColor: "#e2e8f0", transition: { duration: 0.3 } });
      
      // Hands move away
      leftHandControls.start({ top: "150%", opacity: 0, transition: { duration: 0.5 } });
      rightHandControls.start({ top: "150%", opacity: 0, transition: { duration: 0.5 } });

      await new Promise(r => setTimeout(r, 400));

      // 7. Zoom in massive
      containerControls.start({ 
        scale: 40, 
        opacity: 0,
        y: 1500,
        transition: { duration: 1.2, ease: "easeInOut" } 
      });

      // Wait for zoom to cover screen
      await new Promise(r => setTimeout(r, 900));
      
      // 8. Trigger SPA route change
      if (isMounted) onEnterResume();
    }

    sequence();

    return () => { isMounted = false; };
  }, [containerControls, leftHandControls, rightHandControls, screenControls, onEnterResume]);

  return (
    <section className="relative w-full h-screen flex items-center justify-center overflow-hidden bg-[#0b0f19]">
      
      {/* Background ambient light */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
      </div>

      <motion.div 
        className="relative z-10 flex flex-col items-center"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={containerControls}
      >
        {/* Laptop Screen */}
        <div className="w-[320px] sm:w-[500px] md:w-[700px] aspect-[16/10] bg-slate-800 border-[8px] md:border-[12px] border-slate-700 rounded-t-2xl shadow-2xl relative overflow-hidden flex flex-col z-20">
          
          {/* Mac window controls */}
          <div className="h-4 md:h-6 bg-slate-900 border-b border-slate-800 flex items-center px-2 md:px-3 gap-1.5 shrink-0">
             <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-red-500"></div>
             <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-yellow-500"></div>
             <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500"></div>
          </div>
          
          {/* Terminal / Screen Content */}
          <motion.div 
            animate={screenControls}
            className="flex-1 p-4 md:p-6 font-mono text-sm md:text-xl bg-slate-950 flex flex-col"
          >
            <div className="mb-4 text-purple-400 font-bold uppercase tracking-widest text-xs opacity-70">
              [System Booting...]
            </div>
            <div>
               <span className="text-green-400">swayam@awdf</span><span className="text-white">:</span><span className="text-blue-400">~/portfolio</span><span className="text-white">$ </span>
               <span className="text-purple-300 font-bold">{typedText}</span>
               <span className="w-2 h-4 md:h-5 bg-white inline-block animate-pulse ml-1 align-middle"></span>
            </div>
          </motion.div>
        </div>

        {/* Laptop Hinge */}
        <div className="w-[360px] sm:w-[560px] md:w-[780px] h-3 md:h-5 bg-slate-400 rounded-b-xl relative z-30 shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 md:w-24 h-1 md:h-2 bg-slate-500 rounded-b-md"></div>
        </div>

        {/* Laptop Keyboard (3D angled base) */}
        <div 
          className="w-[360px] sm:w-[560px] md:w-[780px] h-32 sm:h-48 md:h-56 bg-slate-600 rounded-b-3xl relative shadow-2xl z-10 mt-[-2px] flex items-center justify-center" 
          style={{ transform: 'perspective(600px) rotateX(40deg)', transformOrigin: 'top' }}
        >
           {/* Trackpad */}
           <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 w-20 md:w-32 h-6 md:h-10 bg-slate-700/50 rounded-md"></div>

           {/* Keyboard Grid */}
           <div className="absolute top-2 md:top-4 inset-x-4 md:inset-x-8 h-20 sm:h-32 md:h-36 bg-slate-800 rounded-lg p-1.5 md:p-2 shadow-inner flex flex-col gap-0.5 md:gap-1">
              {KEYBOARD_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="flex flex-1 gap-0.5 md:gap-1">
                  {row.map((keyLabel, colIndex) => {
                    // Calculate flex-grow based on key type (space is huge, shift is wider)
                    let flexGrow = 1;
                    if (keyLabel === 'space') flexGrow = 8;
                    else if (keyLabel.includes('shift') || keyLabel === 'enter' || keyLabel === 'caps' || keyLabel === 'tab') flexGrow = 2;
                    else if (keyLabel === 'del') flexGrow = 1.5;

                    const isActive = activeKey === keyLabel;
                    return (
                      <div 
                        key={`${rowIndex}-${colIndex}`} 
                        className={`bg-slate-700 rounded-sm shadow-[0_1px_1px_rgba(0,0,0,0.5)] flex items-center justify-center transition-all ${isActive ? 'bg-purple-500 shadow-none translate-y-[1px]' : ''}`}
                        style={{ flexGrow }}
                      >
                         <span className="text-[5px] md:text-[8px] text-slate-400 uppercase font-mono truncate px-1">
                            {keyLabel.replace('shiftL', 'shift').replace('shiftR', 'shift')}
                         </span>
                      </div>
                    );
                  })}
                </div>
              ))}
           </div>

           {/* Animated Hands inside the 3D transformed container */}
           <motion.div
             className="absolute w-12 sm:w-16 md:w-20 pointer-events-none z-40 origin-top"
             initial={{ top: "150%", left: "20%", opacity: 0 }}
             animate={leftHandControls}
           >
             <LeftHand />
           </motion.div>
           <motion.div
             className="absolute w-12 sm:w-16 md:w-20 pointer-events-none z-40 origin-top"
             initial={{ top: "150%", left: "70%", opacity: 0 }}
             animate={rightHandControls}
           >
             <RightHand />
           </motion.div>
        </div>

      </motion.div>
      
    </section>
  );
}
