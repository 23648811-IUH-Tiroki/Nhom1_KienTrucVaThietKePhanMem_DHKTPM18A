import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    refreshToken: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});
//Tu dong xoa khi het han
SessionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Session', SessionSchema);
