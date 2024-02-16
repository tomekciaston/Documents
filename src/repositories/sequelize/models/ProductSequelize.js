import { Model } from 'sequelize'
const loadModel = function (sequelize, DataTypes) {
  class ProductSequelize extends Model {
    static associate (models) {
      const OrderProducts = sequelize.define('OrderProducts', {
        quantity: DataTypes.INTEGER,
        unityPrice: DataTypes.DOUBLE
      })
      ProductSequelize.belongsTo(models.RestaurantSequelize, { foreignKey: 'restaurantId', as: 'restaurant', onDelete: 'cascade' })
      ProductSequelize.belongsTo(models.ProductCategorySequelize, { foreignKey: 'productCategoryId', as: 'productCategory' })
      ProductSequelize.belongsToMany(models.OrderSequelize, { as: 'orders', through: OrderProducts })
      ProductSequelize.hasMany(models.ReviewSequelize, { as: 'reviews', onDelete: 'cascade' })
    }
  }

  ProductSequelize.init({
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.DOUBLE,
    image: DataTypes.STRING,
    order: DataTypes.INTEGER,
    availability: DataTypes.BOOLEAN,
    restaurantId: DataTypes.INTEGER,
    productCategoryId: DataTypes.INTEGER,
    avgStars: {
      type: DataTypes.VIRTUAL,
      get () {
        if (this.ReviewSequelize && this.ReviewSequelize.length > 0) {
          const totalStars = this.ReviewSequelize.reduce((sum, review) => sum + review.stars, 0);
          return totalStars * 1.0 / this.ReviewSequelize.length;
        } else {
          return 0.0
        }
      }
    }
  }, {
    sequelize,
    modelName: 'Product'
  })
  return ProductSequelize
}
export default loadModel
