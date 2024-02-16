import container from "../config/container.js";

class ReviewService {
    constructor() {
        this.reviewRepository = container.resolve('reviewRepository');
    }

    async exists({ productId, reviewId }) {
        return this.reviewRepository.findById(reviewId);
    }
}

export default ReviewService;