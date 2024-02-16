import container from '../config/container.js'
import { processFileUris } from './FileService.js'

class ProductService {
  constructor () {
    this.productRepository = container.resolve('productRepository')
    this.restaurantRepository = container.resolve('restaurantRepository')
    this.reviewRepository = container.resolve('reviewRepository')
  }

  async indexRestaurant (restaurantId) {
    const restaurant = await this.restaurantRepository.show(restaurantId)
    if (!restaurant) {
      throw new Error('Restaurant not found')
    }
    restaurant.products = restaurant.products.map(product => {
      processFileUris(product, ['image'])
      return product
    })
    return restaurant.products
  }

  async create (data) {
    const newProduct = await this.productRepository.create(data)
    processFileUris(newProduct, ['image'])

    return newProduct
  }

  async show (id) {
    const product = await this.productRepository.show(id)
    if (!product) {
      throw new Error('Restaurant not found')
    }
    processFileUris(product, ['image'])

    return product
  }

  async update (id, data) {
    const product = await this.productRepository.update(id, data)
    if (!product) {
      throw new Error('Product not found')
    }
    processFileUris(product, ['image'])
    return product
  }

  async destroy (id) {
    const result = await this.productRepository.destroy(id)
    if (!result) {
      throw new Error('Product not found')
    }
    return true
  }

  async popular () {
    let topProducts = await this.productRepository.popular()
    topProducts = topProducts.map(product => {
      processFileUris(product, ['image'])
      return product
    })
    return topProducts
  }

  async createReview(title, body, stars, productId, userId) {
    return await this.reviewRepository.create(title, body, stars, productId, userId);
  }

  async updateReview(productId, reviewId, title, body, stars) {
    return await this.reviewRepository.update(productId, reviewId, title, body, stars);
  }

  async destroyReview(productId, reviewId) {
    return await this.reviewRepository.destroy(productId, reviewId);
  }

  async exists(id) {
    return await this.productRepository.findById(id);
  }

  async reviewExists(productId, reviewId) {
    return await this.reviewRepository.findById(productId, reviewId);
  }

  async checkProductOwnership(productId, ownerId) {
    return await this.productRepository.checkProductOwnership(productId, ownerId);
  }

  async checkProductRestaurantOwnership(restaurantId, ownerId) {
    return await this.productRepository.checkProductRestaurantOwnership(restaurantId, ownerId);
  }

  async search(query) {
    return await this.productRepository.search(query)
  }
}

export default ProductService
