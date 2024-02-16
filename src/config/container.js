import { createContainer, asValue, asClass } from 'awilix'
import dotenv from 'dotenv'
import MongooseReviewRepository from '../repositories/mongoose/ReviewRepository.js'
import MongooseUserRepository from '../repositories/mongoose/UserRepository.js'
import MongooseRestaurantRepository from '../repositories/mongoose/RestaurantRepository.js'
import MongooseRestaurantCategoryRepository from '../repositories/mongoose/RestaurantCategoryRepository.js'
import MongooseProductCategoryRepository from '../repositories/mongoose/ProductCategoryRepository.js'
import MongooseProductRepository from '../repositories/mongoose/ProductRepository.js'
import MongooseOrderRepository from '../repositories/mongoose/OrderRepository.js'


import SequelizeReviewRepository from '../repositories/sequelize/ReviewsRepository.js'
import SequelizeUserRepository from '../repositories/sequelize/UserRepository.js'
import SequelizeRestaurantRepository from '../repositories/sequelize/RestaurantRepository.js'
import SequelizeRestaurantCategoryRepository from '../repositories/sequelize/RestaurantCategoryRepository.js'
import SequelizeProductCategoryRepository from '../repositories/sequelize/ProductCategoryRepository.js'
import SequelizeProductRepository from '../repositories/sequelize/ProductRepository.js'
import SequelizeOrderRepository from '../repositories/sequelize/OrderRepository.js'

import ReviewService from '../services/ReviewService.js'

import UserService from '../services/UserService.js'
import RestaurantService from '../services/RestaurantService.js'
import RestaurantCategoryService from '../services/RestaurantCategoryService.js'
import ProductService from '../services/ProductService.js'
import ProductCategoryService from '../services/ProductCategoryService.js'
import OrderService from '../services/OrderService.js'

dotenv.config()

function initContainer (databaseType) {
  const container = createContainer()
  let userRepository, restaurantRepository, restaurantCategoryRepository, productCategoryRepository, productRepository,reviewRepository, orderRepository 
  switch (databaseType) {
    case 'mongoose':
      userRepository = new MongooseUserRepository()
      restaurantRepository = new MongooseRestaurantRepository()
      restaurantCategoryRepository = new MongooseRestaurantCategoryRepository()
      productCategoryRepository = new MongooseProductCategoryRepository()
      productRepository = new MongooseProductRepository()
      reviewRepository = new MongooseReviewRepository()
      orderRepository = new MongooseOrderRepository()

      break
    case 'sequelize':
      userRepository = new SequelizeUserRepository()
      restaurantRepository = new SequelizeRestaurantRepository()
      restaurantCategoryRepository = new SequelizeRestaurantCategoryRepository()
      productCategoryRepository = new SequelizeProductCategoryRepository()
      productRepository = new SequelizeProductRepository()
      reviewRepository = new SequelizeReviewRepository()
      orderRepository = new SequelizeOrderRepository()
      break
    default:
      throw new Error(`Unsupported database type: ${databaseType}`)
  }
  container.register({

    userRepository: asValue(userRepository),
    restaurantRepository: asValue(restaurantRepository),
    restaurantCategoryRepository: asValue(restaurantCategoryRepository),
    productCategoryRepository: asValue(productCategoryRepository),
    productRepository: asValue(productRepository),
    orderRepository: asValue(orderRepository),    
    reviewService: asClass(ReviewService).singleton(),
    userService: asClass(UserService).singleton(),
    orderService: asClass(OrderService).singleton(),
    productService: asClass(ProductService).singleton(),
    restaurantService: asClass(RestaurantService).singleton(),
    restaurantCategoryService: asClass(RestaurantCategoryService).singleton(),
    productCategoryService: asClass(ProductCategoryService).singleton(),
    reviewRepository: asValue(reviewRepository)
  })
  return container
}

let container = null
if (!container) { container = initContainer(process.env.DATABASE_TECHNOLOGY) }

export default container
