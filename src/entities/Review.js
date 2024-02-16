import BaseEntity from "./BaseEntity.js";

class Review extends BaseEntity {
    title
    body
    stars
    productId
    userId

    constructor(id, createdAt, updatedAt, title, body, stars,  userId, productId = null) {
        super(id, createdAt, updatedAt)
        this.title = title
        this.body = body
        this.stars = stars
        this.userId = userId
        this.productId = productId
    }
}

export default Review