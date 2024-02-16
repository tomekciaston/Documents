import RepositoryBase from '../RepositoryBase.js';
import RestaurantSequelize from './models/RestaurantSequelize.js';
import ProductSequelize from './models/ProductSequelize.js';
import ProductCategorySequelize from './models/ProductCategorySequelize.js';
import ReviewSequelize from './models/ReviewSequelize.js';
import RestaurantCategorySequelize from './models/RestaurantCategorySequelize.js';

class RestaurantRepository extends RepositoryBase {
  constructor() {
    super();
    this.model = RestaurantSequelize;
    this.defaultAttributes = ['id', 'name', 'description', 'address', 'postalCode', 'url', 'shippingCosts', 'averageServiceMinutes', 'email', 'phone', 'logo', 'heroImage', 'status', 'restaurantCategoryId'];
    this.defaultInclude = [
      {
        model: ProductSequelize,
        as: 'products',
        include: [
          { model: ProductCategorySequelize, as: 'productCategory' },
          { model: ReviewSequelize, as: 'reviews', required: false }
        ]
      },
      {
        model: RestaurantCategorySequelize,
        as: 'restaurantCategory'
      }
    ];
  }

  async findById(id) {
    return this.model.findByPk(id, {
      attributes: { exclude: ['userId'] },
      include: this.defaultInclude,
      order: [[{ model: ProductSequelize, as: 'products' }, 'order', 'ASC']]
    });
  }

  async findAll() {
    return this.model.findAll({
      attributes: this.defaultAttributes,
      include: this.defaultInclude,
      order: [[{ model: RestaurantCategorySequelize, as: 'restaurantCategory' }, 'name', 'ASC']]
    });
  }

  async create(restaurantData) {
    return new this.model(restaurantData).save();
  }

  async update(id, dataToUpdate) {
    const entity = await this.model.findByPk(id);
    if (!entity) return null; // Handle non-existent entity
    entity.set(dataToUpdate);
    return entity.save();
  }

  async destroy(id) {
    const result = await this.model.destroy({ where: { id } });
    return result === 1; // Return boolean indicating success or failure
  }

  async findByOwnerId(ownerId) {
    return this.model.findAll({
      attributes: { exclude: ['userId'] },
      where: { userId: ownerId },
      include: [{ model: RestaurantCategorySequelize, as: 'restaurantCategory' }]
    });
  }

  async updateAverageServiceTime(restaurantId) {
    const restaurant = await this.model.findByPk(restaurantId);
    if (!restaurant) return null; // Handle non-existent entity
    const averageServiceTime = await restaurant.getAverageServiceTime();
    return this.model.update({ averageServiceMinutes: averageServiceTime }, { where: { id: restaurantId } });
  }

  async show(id) {
    return this.findById(id);
  }
}

export default RestaurantRepository;
