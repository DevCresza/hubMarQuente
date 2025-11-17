
import React, { useEffect, useState } from "react";
import { CheckCircle, Trophy, Star, Zap, TrendingUp, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

const confettiColors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

export default function TaskCompletionCelebration({ task, stats, onClose }) {
  const [confetti, setConfetti] = useState([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Gerar confetes
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2,
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)]
      });
    }
    setConfetti(particles);

    // Auto fechar após 4 segundos
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // The randomMessage and its usage in the h2 tag are removed as per the outline.
  // const messages = [
  //   "Excelente trabalho! 🎉",
  //   "Mais uma no bolso! 💪",
  //   "Você é incrível! ⭐",
  //   "Arrasou! 🚀",
  //   "Mandou bem! 🔥",
  //   "Show de bola! ✨"
  // ];

  // const randomMessage = messages[Math.floor(Math.random() * messages.length)];

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      {/* Confetes */}
      {confetti.map(particle => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 animate-fall"
          style={{
            left: `${particle.left}%`,
            top: '-20px',
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}

      {/* Card de celebração */}
      <div 
        className={`bg-gray-100 rounded-3xl shadow-neumorphic p-8 max-w-md mx-4 text-center transform transition-all duration-500 ${
          show ? 'scale-100 rotate-0' : 'scale-75 rotate-12'
        }`}
      >
        {/* Ícone animado */}
        <div className="relative mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-neumorphic-soft animate-bounce-slow">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <div className="absolute top-0 right-1/4 animate-ping-slow">
            <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="absolute top-0 left-1/4 animate-ping-slow" style={{ animationDelay: '0.3s' }}>
            <Zap className="w-6 h-6 text-blue-400 fill-blue-400" />
          </div>
        </div>

        {/* Mensagem - The randomMessage h2 is removed */}
        {/* <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {randomMessage}
        </h2> */}
        <p className="text-3xl font-bold text-gray-800 mb-2">
          Tarefa concluída! 🎉
        </p>
        <p className="text-lg text-gray-600 mb-6">
          "<span className="font-semibold">{task.title}</span>"
        </p>

        {/* Stats rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-100 rounded-xl p-4 shadow-neumorphic-inset">
            <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold text-gray-800">{stats.completedToday}</div>
            <div className="text-xs text-gray-500">Hoje</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 shadow-neumorphic-inset">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-gray-800">{stats.completedThisWeek}</div>
            <div className="text-xs text-gray-500">Esta Semana</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 shadow-neumorphic-inset">
            <Award className="w-6 h-6 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold text-gray-800">{stats.totalCompleted}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
        </div>

        {/* Mensagem motivacional */}
        {stats.completedToday >= 5 && (
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3 mb-4">
            <p className="text-sm font-semibold text-purple-800">
              🔥 {stats.completedToday} tarefas hoje!
            </p>
          </div>
        )}

        {stats.streak >= 3 && (
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-3 mb-4">
            <p className="text-sm font-semibold text-orange-800">
              ⚡ Sequência de {stats.streak} dias!
            </p>
          </div>
        )}

        {/* Botão fechar */}
        <Button
          onClick={() => {
            setShow(false);
            setTimeout(onClose, 300);
          }}
          className="bg-green-500 hover:bg-green-600 text-white shadow-neumorphic-soft"
        >
          Continuar
        </Button>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes ping-slow {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          75%, 100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        
        .animate-fall {
          animation: fall linear forwards;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}
