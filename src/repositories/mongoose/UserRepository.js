import RepositoryBase from '../RepositoryBase.js'
import UserMongoose from './models/UserMongoose.js'

class UserRepository extends RepositoryBase {
  async findById (id, ...args) {
    try {
      return UserMongoose.findById(id)
    } catch (err) {
      return null
    }
  }

  async top(){

    const top10PercentCount = await UserMongoose.count() * 0.1
    const top10PercentCountRounded = Math.ceil(top10PercentCount)
    console.log(top10PercentCountRounded)
    return UserMongoose.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "_userId",
          as: "orders"
        }
      },
      {
        $unwind: "$orders"
      },
      {
        $group: {
          _id: "$_id",
          totalSpent: { $sum: "$orders.price" },
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" }
        }
      },
      {
        $sort: { totalSpent: -1 }
      },
      {
        $limit: top10PercentCountRounded
      }
    ])
  }

  async search (query) {
    return UserMongoose.aggregate([
      { $match: { postalCode: query.postalCode, userType: "customer" } },
      {
        $project: {
          _id: 0,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          address: 1,
          postalCode: 1
        }
      }
    ])
  }
  async create (businessEntity, ...args) {
    return (new UserMongoose(businessEntity)).save()
  }

  async update (id, businessEntity, ...args) {
    return UserMongoose.findOneAndUpdate({ _id: id }, businessEntity, { new: true, exclude: ['password'] })
  }

  async updateToken (id, tokenDTO, ...args) {
    return this.update(id, tokenDTO, args)
  }

  async destroy (id, ...args) {
    const result = await UserMongoose.deleteOne({ _id: id })
    return result?.deletedCount === 1
  }

  async save (entity) {
    return UserMongoose.findByIdAndUpdate(entity.id, entity, { upsert: true, new: true })
  }

  async findByToken (token) {
    return UserMongoose.findOne({ token }, { password: 0 })
  }

  async findOwnerByEmail (email) {
    return this._findByEmailAndUserType(email, 'owner')
  }

  async findCustomerByEmail (email) {
    return this._findByEmailAndUserType(email, 'customer')
  }

  async _findByEmailAndUserType (email, userType) {
    return UserMongoose.findOne({ email, userType })
  }
}

export default UserRepository
