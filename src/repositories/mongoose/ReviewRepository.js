import RepositoryBase from "../RepositoryBase.js";
import RestaurantMongoose from './models/RestaurantMongoose.js';

class ReviewRepository extends RepositoryBase {
    // Utility method to find a product by productId
    async findProductById(productId) {
        const restaurant = await RestaurantMongoose.findOne({ 'products._id': productId });
        return restaurant ? restaurant.products.id(productId) : null;
    }

    // Find a review by its productId and reviewId
    async findById(productId, reviewId) {
        try {
            const product = await this.findProductById(productId);
            return product ? product.reviews.id(reviewId) : null;
        } catch (err) {
            console.error(err); // Log the error for debugging purposes
            return null;
        }
    }

    // Create a new review
    async create(title, body, stars, productId, userId) {
        const product = await this.findProductById(productId);
        if (!product) return null; // If no product found, return null

        const newReviewCount = product.numberOfReviews + 1;
        product.avgStars = (product.avgStars * product.numberOfReviews + stars) / newReviewCount;
        product.numberOfReviews = newReviewCount;

        const newReview = { title, body, stars, userId };
        product.reviews.push(newReview);

        const restaurant = await product.parent(); // Get parent document (restaurant)
        await restaurant.save();

        return newReview; // Assuming toBusinessEntity is a transformation, add as needed
    }

    // Update an existing review
    async update(productId, reviewId, title, body, stars) {
        const product = await this.findProductById(productId);
        if (!product) return null;

        const review = product.reviews.id(reviewId);
        if (!review) return null;

        // Update the review without changing the total number of reviews
        const reviewsSum = product.avgStars * product.numberOfReviews - review.stars + stars;
        product.avgStars = reviewsSum / product.numberOfReviews;

        // Update review details
        Object.assign(review, { title, body, stars });
        await product.parent().save(); // Save changes in the parent document (restaurant)

        return review; // Assuming toBusinessEntity is a transformation, add as needed
    }

    // Delete a review
    async destroy(productId, reviewId) {
        const product = await this.findProductById(productId);
        if (!product) return null;

        const review = product.reviews.id(reviewId);
        if (!review) return null;

        // Update average stars after removing the review
        const newReviewCount = product.numberOfReviews - 1;
        product.avgStars = newReviewCount > 0 ? (product.avgStars * product.numberOfReviews - review.stars) / newReviewCount : 0;
        product.numberOfReviews = newReviewCount;

        product.reviews.pull(reviewId); // Remove the review
        await product.parent().save(); // Save changes in the parent document (restaurant)

        return review; // Return removed review details if needed
    }
}

export default ReviewRepository;
