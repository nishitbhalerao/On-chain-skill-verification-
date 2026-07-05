import mongoose from 'mongoose'

const proofSchema = new mongoose.Schema(
  {
    proof_hash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    proof_type: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4, 5], // github, hackathon, oss, bugbounty, freelance
    },
    wallet_address: {
      type: String,
      required: true,
      index: true,
    },
    score_delta: {
      type: Number,
      required: true,
      default: 0,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    submitter: {
      type: String,
      required: true,
    },
    proof_data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    is_verified_on_chain: {
      type: Boolean,
      default: false,
    },
    on_chain_tx_id: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Proof', proofSchema)
