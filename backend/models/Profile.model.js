import mongoose from 'mongoose'

const profileSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    total_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 1000,
    },
    github_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 300,
    },
    hackathon_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 200,
    },
    oss_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 250,
    },
    bugbounty_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 150,
    },
    freelance_score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    proof_count: {
      type: Number,
      default: 0,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    proof_hashes: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Profile', profileSchema)
