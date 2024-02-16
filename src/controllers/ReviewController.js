import container from '../config/container.js'

class ReviewController {
    constructor() {
        this.productService = container.resolve('productService')
        this.create = this.create.bind(this)
        this.update = this.update.bind(this)
        this.destroy = this.destroy.bind(this)
    }

    async create(req, res) {
        const {body: {title, body, stars}, user: {id: userId}, params: {productId}} = req;

        try {
            const review = await this.productService.createReview(title, body, stars, productId, userId)
            res.json(review)
        }
        catch(err) {
            res.status(500).send(err.message)
        }
    }

    async update (req, res) {
        try {
            const {body: {title, body, stars}, params: { productId, reviewId} } =req;
            const review = await this.productService.updateReview(productId, reviewId, title, body, stars)
            res.json(review)
        } catch (err) {
            res.status(500).send(err.message)
        }
    }

    async destroy (req, res) {
        try {
            const result = await this.productService.destroyReview(req.params.productId, req.params.reviewId)
            const message = result ? 'Delete OK' : 'Cant delete.'
            res.json(message)
        } catch (err) {
            res.status(500).send(err.message)
        }
    }
}

export default ReviewController;