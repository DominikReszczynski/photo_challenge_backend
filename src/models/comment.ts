import mongoose, { Schema, Document } from "mongoose";

export interface Comment extends Document {
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export const CommentSchema = new Schema<Comment>({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// export const CommentModel = mongoose.model<Comment>("Comment", CommentSchema);
