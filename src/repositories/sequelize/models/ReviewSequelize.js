import { Model, DataTypes } from 'sequelize';
import ReviewEntity from '../../../entities/Review.js';

// Define the Review model with class syntax
class Review extends Model {
    // Define associations with other models
    static associate(models) {
        Review.belongsTo(models.ProductSequelize, { foreignKey: 'productId', as: 'product' });
        Review.belongsTo(models.UserSequelize, { foreignKey: 'userId', as: 'user' });
    }

    // Convert the Review model to a business entity
    toBusinessEntity() {
        return new ReviewEntity(
            this.id.toString(),
            this.createdAt,
            this.updatedAt,
            this.title,
            this.body,
            this.stars,
            this.userId,
            this.productId
        );
    }
}

// Define a function to initialize and return the Review model
const loadReviewModel = (sequelize) => {
    Review.init({
        title: DataTypes.STRING,
        body: DataTypes.STRING,
        stars: DataTypes.TINYINT,
        userId: DataTypes.STRING,
        productId: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Review'
    });

    return Review;
};

export default loadReviewModel;
