
import React, { useState } from "react";

export default function CategoryCard({ category, progress, taskCount, completedCount, onClick }) {
  return (
    <div
      className={`
        bg-gray-100 rounded-3xl p-8 cursor-pointer 
        transition-all duration-300 transform hover:scale-105 hover:shadow-neumorphic-pressed shadow-neumorphic
      `}
      onClick={onClick}
    >
      {/* Icon & Header */}
      <div className="text-center mb-6">
        <div className="text-6xl mb-4">{category.icon}</div>
        <h3 className="text-xl font-semibold text-gray-800 leading-tight">
          {category.name}
        </h3>
      </div>

      {/* Progress Circle */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-24 h-24">
          <div className="w-full h-full rounded-full bg-gray-100 shadow-neumorphic-inset"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl font-semibold text-gray-800">
              {progress}%
            </div>
          </div>
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="36"
              fill="none"
              stroke="rgba(0,0,0,0.05)"
              strokeWidth="4"
            />
            <circle
              cx="50%"
              cy="50%"
              r="36"
              fill="none"
              stroke="url(#gradient-dashboard)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(progress * 226) / 100} 226`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient-dashboard" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-gray-700">
        <div className="text-center">
          <div className="text-lg font-semibold">{completedCount}</div>
          <div className="text-xs text-gray-500">Concluídas</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">{taskCount - completedCount}</div>
          <div className="text-xs text-gray-500">Pendentes</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold">{taskCount}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
    </div>
  );
}
