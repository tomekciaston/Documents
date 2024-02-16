import {Model} from 'sequelize'
import ReviewEntity from '../../../entities/Review.js'

const loadReviewModel = function (sequelize, DataTypes) {
    class Review extends Model {
        static associate(models) {
            Review.belongsTo(models.ProductSequelize, {foreignKey: 'productId', as: 'product'})
            Review.belongsTo(models.UserSequelize, {foreignKey: 'userId', as: 'user'})
        }

        toBusinessEntity() {
            return new ReviewEntity(this.id.toString(), this.createdAt, this.updatedAt, this.title, this.body, this.stars, this.userId, this.productId)
        }
    }

    Review.init({
        title: DataTypes.STRING,
        body: DataTypes.STRING,
        stars: DataTypes.TINYINT,
        userId: DataTypes.STRING,
        productId: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Review'
    })

    return Review;
}

export default loadReviewModel
