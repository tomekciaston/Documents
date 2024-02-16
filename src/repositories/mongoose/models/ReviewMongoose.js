import { Schema } from 'mongoose';
import ReviewEntity from "../../../entities/Review.js";

// Converts a review document to a business entity
function toBusinessEntity(document) {
    return new ReviewEntity(
        document._id.toString(),
        document.createdAt,
        document.updatedAt,
        document.title,
        document.body,
        document.stars,
        document.userId
    );
}

// Define the review schema
const reviewSchema = new Schema({
    title: {
        type: String,
        required: 'Please enter the title of the review'
    },
    body: {
        type: String,
        required: 'Please provide the body of the review'
    },
    stars: {
        type: Number,
        required: 'Please enter the stars (1-5)',
        min: 1,
        max: 5
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: 'Please select the user',
        ref: 'User'
    }
}, {
    strict: true, // Changed to true for data validation. If you need flexibility, keep it as false.
    timestamps: true,
    toJSON: { virtuals: true }
});

// Attach the toBusinessEntity method to both the instance and the model
reviewSchema.method('toBusinessEntity', function() {
    return toBusinessEntity(this);
});

reviewSchema.static('toBusinessEntity', function(document) {
    return toBusinessEntity(document);
});

export default reviewSchema;
export { toBusinessEntity };
