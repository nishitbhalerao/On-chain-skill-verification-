import React from 'react'
import { Github, Trophy, Code2, Shield, Briefcase } from 'lucide-react'

const SKILL_ICONS = {
  github: Github,
  hackathon: Trophy,
  oss: Code2,
  bugbounty: Shield,
  freelance: Briefcase,
}

export default function SkillBadge({ category, score, maxScore = 300 }) {
  const IconComponent = SKILL_ICONS[category]
  const percentage = (score / maxScore) * 100
  
  const categoryLabels = {
    github: 'GitHub',
    hackathon: 'Hackathons',
    oss: 'Open Source',
    bugbounty: 'Bug Bounty',
    freelance: 'Freelance',
  }

  return (
    <div className="glass-card p-4 rounded-xl">
      <div className="flex items-center space-x-3 mb-3">
        {IconComponent && <IconComponent className="w-5 h-5 text-stellar-purple" />}
        <div>
          <h3 className="text-sm font-semibold text-white">
            {categoryLabels[category]}
          </h3>
          <p className="text-xs text-gray-400">{score} pts</p>
        </div>
      </div>
      
      <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-stellar-purple to-purple-400 transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-400">
        {percentage.toFixed(0)}% of max
      </div>
    </div>
  )
}
