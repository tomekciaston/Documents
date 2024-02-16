import RepositoryBase from '../RepositoryBase.js'
import {UserSequelize, OrderSequelize} from './models/models.js'
import {col, fn, Op, where} from "sequelize";

class UserRepository extends RepositoryBase {
    async findById(id, ...args) {
        return UserSequelize.findByPk(id)
    }

    async create(businessEntity, ...args) {
        return (new UserSequelize(businessEntity)).save()
    }

    async update(id, valuesToUpdate, ...args) {
        await UserSequelize.update(valuesToUpdate, {
            where: {
                id: id
            }
        })
        return UserSequelize.findByPk(id, {
            attributes: {exclude: ['password']}
        })
    }

    async updateToken(id, tokenDTO, ...args) {
        const entity = await UserSequelize.findByPk(id, {
            attributes: {exclude: ['password']}
        })
        entity.set(tokenDTO)
        return entity.save()
    }

    async destroy(id, ...args) {
        const result = await UserSequelize.destroy({where: {id}})
        return result === 1
    }

    async findByToken(token) {
        return UserSequelize.findOne({where: {token}}, {attributes: {exclude: ['password']}})
    }

    async findOwnerByEmail(email) {
        return this._findByEmailAndUserType(email, 'owner')
    }

    async findCustomerByEmail(email) {
        return this._findByEmailAndUserType(email, 'customer')
    }

    async _findByEmailAndUserType(email, userType) {
        return UserSequelize.findOne({where: {email, userType}})
    }

    async save(businessEntity, ...args) {
        return this.create(businessEntity)
    }

    async search(query) {
        return UserSequelize.findAll({
            where: {
                postalCode: query.postalCode
            }
        })
    }

    async top() {
        const usersThatMadeOrders =  await OrderSequelize.count({
            distinct: true,
            col: 'userId'
        });

        return await OrderSequelize.findAll({
            attributes: [
                'userId',
                [fn('SUM', col('price')), 'spent']
            ],
            include: [{
                model: UserSequelize,
                as: 'user',
                attributes: [],
            }],
            group: ['userId'],
            order: [[col('spent'), 'DESC']],
            limit: Math.ceil(0.1 * usersThatMadeOrders)
        });
    }
}

export default UserRepository
