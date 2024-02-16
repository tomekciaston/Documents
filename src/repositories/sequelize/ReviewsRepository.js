import RepositoryBase from "../RepositoryBase.js";
import { ReviewSequelize } from "./models/models.js";

class ReviewsRepository extends RepositoryBase {
    // Constructor to set model for easy access and potential future expansions
    constructor() {
        super();
        this.model = ReviewSequelize;
    }

    // Find a review by its ID
    async findById(reviewId) {
        return this.model.findByPk(reviewId);
    }

    // Utilize base findAll method correctly
    async findAll(options = {}) {
        return this.model.findAll(options);
    }

    // Create a new review
    async create({ title, body, stars, productId, userId }) {
        const review = new this.model({ title, body, stars, productId, userId });
        await review.save();
        return review; // Assuming the save method returns the saved object
    }

    // Update an existing review
    async update(reviewId, { title, body, stars }) {
        const review = await this.model.findByPk(reviewId);
        if (!review) return null; // Handle non-existent review

        review.set({ title, body, stars });
        await review.save();
        // Assuming toBusinessEntity is a method for converting Sequelize model to a business entity
        // Ensure this method exists in the ReviewSequelize model or remove if not applicable
        return review.toBusinessEntity ? review.toBusinessEntity() : review;
    }

    // Destroy (delete) a review by its ID
    async destroy(reviewId) {
        const result = await this.model.destroy({ where: { id: reviewId } });
        return result === 1; // Return true if one record was deleted
    }
}

export default ReviewsRepository;
