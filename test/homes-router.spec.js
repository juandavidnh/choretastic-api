const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken') 
const config = require('../src/config')
const bcrypt = require('bcryptjs')

describe('Homes Endpoints', () => {
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

    beforeEach('cleanup', () => helpers.cleanTables(db))

    afterEach('cleanup', () => helpers.cleanTables(db))

    describe(`POST /api/tasks`, () => {
        beforeEach('insert homes', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('creates home and gets a 201 response', function() {
            const newHome = {
                home_name: "Test Home",
                password: "TestPassword1!",
            }
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
            )

            hashedPassword = bcrypt.hash(newHome.password, 12)

            return supertest(app)
                .post('/api/homes/add-home')
                .set('Authorization', `bearer ${jwtToken}`)
                .send(newHome)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.home_name).to.eql(newHome.home_name)
                    expect(res.headers.location).to.eql(`/api/homes/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString()
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })

        })
    })

   
})