import container from '../config/container.js'

class RestaurantController {
  constructor () {
    this.restaurantService = container.resolve('restaurantService')
    this.index = this.index.bind(this)
    this.indexOwner = this.indexOwner.bind(this)
    this.create = this.create.bind(this)
    this.show = this.show.bind(this)
    this.update = this.update.bind(this)
    this.destroy = this.destroy.bind(this)
    this.top = this.top.bind(this)
    this.bottomDeliverers = this.bottomDeliverers.bind(this)
    this.topDeliverers = this.topDeliverers.bind(this)
    this.search = this.search.bind(this)
  }

  async index (req, res) {
    try {
      const restaurants = await this.restaurantService.index()
      res.json(restaurants)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async indexOwner (req, res) {
    try {
      const restaurants = await this.restaurantService.indexOwner(req.user.id)
      res.json(restaurants)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async create (req, res) {
    const newRestaurantData = req.body
    newRestaurantData.userId = req.user.id
    try {
      const restaurant = await this.restaurantService.create(newRestaurantData)
      res.json(restaurant)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async show (req, res) {
    try {
      const restaurant = await this.restaurantService.show(req.params.restaurantId)
      res.json(restaurant)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }


  async update (req, res) {
    const updatedRestaurantData = req.body
    updatedRestaurantData.userId = req.user.id
    try {
      const updatedRestaurant = await this.restaurantService.update(req.params.restaurantId, updatedRestaurantData)
      res.json(updatedRestaurant)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async destroy (req, res) {
    try {
      const result = await this.restaurantService.destroy(req.params.restaurantId)
      const message = result ? 'Successfully deleted.' : 'Could not delete restaurant.'
      res.json(message)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
  async top(req, res) {
    try {
      const restaurants = await this.restaurantService.top()
      res.json(restaurants)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async bottomDeliverers(req, res) {
    try {
      const deliverers = await this.restaurantService.bottomDeliverers()
      res.json(deliverers)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

  async search (req, res) {
    try {
      const restaurants = await this.restaurantService.search(req.query)
      res.json(restaurants)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }
  
  async topDeliverers(req, res) {
    try {
      const deliverers = await this.restaurantService.topDeliverers()
      res.json(deliverers)
    } catch (err) {
      res.status(500).send(err.message)
    }
  }

}

export default RestaurantController
