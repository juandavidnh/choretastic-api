const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken') 
const bcrypt = require('bcryptjs')
const config = require('../src/config')

describe('Users Endpoints', () => {
    let db

    const {
        testUsers, 
        testHomes,
        testTasks
    } = helpers.makeFixtures()

    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DATABASE_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`GET /api/users`, () => {
        beforeEach('insert users', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('gets users from same home', () => {
            const expectedUsers = testUsers.filter(users => users.home_id === testUsers[0].home_id)
            const jwtToken = jwt.sign(
                { user_id: testUsers[0].id }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
                )

            return supertest(app)
                .get('/api/users')
                .set('Authorization', `bearer ${jwtToken}`)
                .expect(200, expectedUsers)
        })
    })

    describe(`POST /api/users/add-user`, () => {
        beforeEach('insert users', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('creates user and gets a 201 response', () => {
            this.retries(3)
            const newUser = {
                first_name: "Test",
                last_name: "Test",
                email: "test@test.com",
                password: "TestPassword1!"
            }
            const jwtToken = jwt.sign(
                { user_id: testUsers[0].id }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
            )

            return supertest(app)
                .post('/api/users/add-user')
                .set('Authorization', `bearer ${jwtToken}`)
                .send(newUser)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.first_name).to.eql(newUser.first_name)
                    expect(res.body.last_name).to.eql(newUser.last_name)
                    expect(res.body.email).to.eql(newUser.email)
                    expect(res.body.password).to.eql(bcrypt.hash(newUser.password, 12))
                    expect(res.body.points).to.eql(0)
                    expect(res.body.home_id).to.eql(testUsers[0].home_id)
                    expect

                })

        })
    })
})