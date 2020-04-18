const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken') 
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

    beforeEach('cleanup', () => helpers.cleanTables(db))

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
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
                )
            
           
            return supertest(app)
                .get('/api/users')
                .set('Authorization', `bearer ${jwtToken}`)
                .expect(200)
                .expect(res => {
                    for(let i=0; i<res.body.length; i++){
                        expect(res.body[i]).to.have.property('id')
                        expect(res.body[i].email).to.eql(expectedUsers[i].email)
                    }                 
                })
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

        it('creates user and gets a 201 response', function() {
            const newUser = {
                first_name: "Test",
                last_name: "Test",
                email: "test@newest.com",
                password: "TestPassword1!"
            }
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
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
                    expect(res.body.password).to.eql(newUser.password)
                    expect(res.body.points).to.eql(0)
                    expect(res.body.home_id).to.eql(testUsers[0].home_id)
                    expect(res.headers.location).to.eql(`/api/users/user-id/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString()
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })

        })
    })

    describe(`POST /api/users/sign-up`, () => {
        beforeEach('insert users', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('creates new user and returns JWT Token', () => {
            const newUser = {
                first_name: "Test",
                last_name: "Test",
                email: "test@newest.com",
                password: "TestPassword1!"
            }
            
            return supertest(app)
                .post('/api/users/sign-up')
                .send(newUser)
                .expect(200)
                .expect(res=> {
                    expect(res.body).to.have.property('authToken')
                })
        })
    })

    describe(`GET /api/users/user-id/:id`, () => {
        beforeEach('insert users', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('gets user from same home', () => {
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
                )
            
            return supertest(app)
                .get('/api/users/user-id/2')
                .set('Authorization', `bearer ${jwtToken}`)
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.email).to.eql(testUsers[1].email)
                })
        })       
    })

    describe(`PATCH /api/users/user-id/:id`, () => {
        beforeEach('insert users', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('assign a new home to user', () => {
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
            )

            return supertest(app)
                .patch('/api/users/user-id/2')
                .set('Authorization', `bearer ${jwtToken}`)
                .send({
                    home_id: 2
                })
                .expect(200)
                .expect(res => 
                    db
                        .from('choretastic_users')
                        .select('*')
                        .where({ id: 2 })
                        .first()
                        .then(row => {
                            expect(row.home_id).to.eql(2)
                        })
                )
        })
    })

    describe(`DELETE /api/users/user-id/:id`, () => {
        beforeEach('insert users', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('deletes user and returns 200 status', () => {
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
            )

            return supertest(app)
                .delete('/api/users/user-id/2')
                .set('Authorization', `bearer ${jwtToken}`)
                .expect(204)
                .expect(res =>{
                    supertest(app)
                    .get('/api/users/user-id/2')
                    .set('Authorization', `bearer ${jwtToken}`)
                    .expect(404)
                })   
        })
    })

    describe(`GET /api/users/own`, () => {
        beforeEach('insert users', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('returns own user', () => {
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
            )

            return supertest(app)
                .get('/api/users/own')
                .set('Authorization', `bearer ${jwtToken}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.email).to.eql(testUsers[0].email)
                })
        })

    })
})