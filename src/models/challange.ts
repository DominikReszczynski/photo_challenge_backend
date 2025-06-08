import mongoose from "mongoose";

export interface IChallenge extends Document {
  title: string;
  startDate: Date;
  endDate: Date;
}

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  startDate: { type: Date, default: Date.now },
//   now + week
  endDate: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },

});

const Challenge = mongoose.model<IChallenge>("Challenge", challengeSchema, "challenge");
export default Challenge;