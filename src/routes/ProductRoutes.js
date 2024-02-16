import ProductController from '../controllers/ProductController.js'
import * as ProductValidation from '../controllers/validation/ProductValidation.js'
import { hasRole, isLoggedIn } from '../middlewares/AuthMiddleware.js'
import { checkEntityExists } from '../middlewares/EntityMiddleware.js'
import * as ProductMiddleware from '../middlewares/ProductMiddleware.js'
import { addFilenameToBody, handleFileUpload } from '../middlewares/FileHandlerMiddleware.js'
import { handleValidation } from '../middlewares/ValidationHandlingMiddleware.js'
import container from '../config/container.js'
import ReviewController from "../controllers/ReviewController.js";
import * as ReviewValidation from "../controllers/validation/ReviewValidation.js";

const loadFileRoutes = (app) => {
  const productController = new ProductController()
  const reviewController = new ReviewController()
  const productService = container.resolve('productService')
  const upload = handleFileUpload(['image'], process.env.PRODUCTS_FOLDER)

  app.route('/products')
    .post(
      isLoggedIn,
      hasRole('owner'),
      upload,
      addFilenameToBody('image'),
      ProductValidation.create,
      handleValidation,
      ProductMiddleware.checkProductRestaurantOwnership,
      productController.create
    )
  app.route('/products/popular')
    .get(
      productController.popular
    )
  app.route('/products/:productId')
    .get(
      checkEntityExists(productService, 'productId'),
      productController.show)
    .put(
      isLoggedIn,
      hasRole('owner'),
      upload,
      addFilenameToBody('image'),
      checkEntityExists(productService, 'productId'),
      ProductMiddleware.checkProductOwnership,
      ProductValidation.update,
      handleValidation,
      productController.update
    )
    .delete(
      isLoggedIn,
      hasRole('owner'),
      checkEntityExists(productService, 'productId'),
      ProductMiddleware.checkProductOwnership,
      productController.destroy
    )
    app.route('/products/:productId/reviews')
    .post(
        isLoggedIn,
        hasRole('customer'),
        checkEntityExists(productService, 'productId'),
        ReviewValidation.create,
        handleValidation,
        reviewController.create
    )
app.route('/products/:productId/reviews/:reviewId')
    .put(
        isLoggedIn,
        hasRole('customer'),
        checkEntityExists(productService, 'productId'),
        ReviewValidation.update,
        handleValidation,
        reviewController.update
    )
    .delete(
        isLoggedIn,
        hasRole('customer'),
        checkEntityExists(productService, 'productId'),
        reviewController.destroy
    )
}
export default loadFileRoutes
