import React, { useEffect, useState } from 'react'

export default function SkillScoreGauge({ score = 0, maxScore = 1000 }) {
  const [displayScore, setDisplayScore] = useState(0)
  
  const percentage = (displayScore / maxScore) * 100
  
  // Color gradient: red (low) -> yellow (medium) -> green (high)
  const getColor = () => {
    if (displayScore < 333) return '#ef4444' // red
    if (displayScore < 666) return '#eab308' // yellow
    return '#22c55e' // green
  }

  useEffect(() => {
    let animationFrame
    let currentScore = 0
    const target = Math.min(score, maxScore)
    
    const animate = () => {
      if (currentScore < target) {
        currentScore += (target - currentScore) * 0.1
        setDisplayScore(Math.floor(currentScore))
        animationFrame = requestAnimationFrame(animate)
      } else {
        setDisplayScore(target)
      }
    }
    
    animate()
    return () => cancelAnimationFrame(animationFrame)
  }, [score, maxScore])

  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-40 h-40">
        <svg width="160" height="160" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="45"
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r="45"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.3s ease, stroke 0.3s ease' }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-4xl font-bold text-white">
            {displayScore}
          </div>
          <div className="text-xs text-gray-400">
            / {maxScore}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <div className="text-sm font-medium text-gray-300">
          {displayScore < 333 ? 'Building' : displayScore < 666 ? 'Strong' : 'Expert'}
        </div>
      </div>
    </div>
  )
}
