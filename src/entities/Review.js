import BaseEntity from "./BaseEntity.js";

class Review extends BaseEntity {
    title
    body
    stars
    productId
    userId

    constructor(id, createdAt, updatedAt, title, body, stars, productId = null, userId) {
        super(id, createdAt, updatedAt)
        this.title = title
        this.body = body
        this.stars = stars
        this.productId = productId
        this.userId = userId
    }
}

export default Review