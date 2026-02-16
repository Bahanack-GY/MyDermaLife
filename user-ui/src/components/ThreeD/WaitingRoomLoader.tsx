
import { useProgress } from '@react-three/drei';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function WaitingRoomLoader() {
  const { active, progress } = useProgress();
  const [show, setShow] = useState(true);
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "Nous mettons tout en place pour que vous ayez la meilleure expérience",
    "Chargement de votre espace personnel...",
    "Préparation de la salle d'attente...",
    "Vérification de la connexion...",
    "Bienvenue chez My Derma Life"
  ];

  useEffect(() => {
    if (!active && progress === 100) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setShow(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
        setShow(true);
    }
  }, [active, progress]);

  // Rotate messages
  useEffect(() => {
    if (!show) return;
    
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-brand-light font-sans"
        >
          <div className="text-center p-8 max-w-md w-full">
            {/* Logo or specialized loader icon */}
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-brand-default/20 relative">
               <Loader2 className="w-10 h-10 text-brand-default animate-spin" />
               <div className="absolute inset-0 rounded-full border-4 border-brand-default/30 border-t-brand-default animate-spin transition-all duration-300" 
                    style={{ animationDuration: '3s' }}
               />
            </div>
            
            <h2 className="text-2xl font-serif font-bold text-brand-dark mb-2">
                Veuillez patienter
            </h2>
            
            <div className="h-16 flex items-center justify-center mb-8">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-gray-600 font-medium"
                    >
                        {messages[messageIndex]}
                    </motion.p>
                </AnimatePresence>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
              <motion.div 
                className="bg-brand-default h-full rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 50 }}
              />
            </div>
            <p className="text-xs text-brand-muted font-bold text-right">{Math.round(progress)}%</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
