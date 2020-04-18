const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const jwt = require('jsonwebtoken') 
const config = require('../src/config')

describe('Tasks Endpoints', () => {
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

    describe(`GET /api/tasks`, () => {
        beforeEach('insert tasks', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('gets tasks from home', () => {
            const expectedTasks = testTasks.filter(tasks => tasks.home_id === testUsers[0].home_id)
            
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
                )
            
           
            return supertest(app)
                .get('/api/tasks')
                .set('Authorization', `bearer ${jwtToken}`)
                .expect(200)
                .expect(res => {
                    for(let i=0; i<res.body.length; i++){
                        expect(res.body[i]).to.have.property('id')
                        expect(res.body[i].task_name).to.eql(expectedTasks[i].task_name)
                        expect(res.body[i].home_id).to.eql(testUsers[0].home_id)
                    }                 
                })
        })
    })

    describe(`POST /api/tasks`, () => {
        beforeEach('insert tasks', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('creates task and gets a 201 response', function() {
            const newTask = {
                task_name: "Test",
                assignee_id: 3,
                points: 5
            }
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
            )

            return supertest(app)
                .post('/api/tasks')
                .set('Authorization', `bearer ${jwtToken}`)
                .send(newTask)
                .expect(201)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.task_name).to.eql(newTask.task_name)
                    expect(res.body.assignee_id).to.eql(newTask.assignee_id)
                    expect(res.body.points).to.eql(newTask.points)
                    expect(res.body.status).to.eql('pending')
                    expect(res.body.home_id).to.eql(testUsers[0].home_id)
                    expect(res.headers.location).to.eql(`/api/tasks/${res.body.id}`)
                    const expectedDate = new Date().toLocaleString()
                    const actualDate = new Date(res.body.date_created).toLocaleString()
                    expect(actualDate).to.eql(expectedDate)
                })

        })
    })

    describe(`GET /api/tasks/:id`, () => {
        beforeEach('insert tasks', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('gets specific task from same home', () => {
            expectedTask = testTasks[1]
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
                )
            
            return supertest(app)
                .get('/api/tasks/2')
                .set('Authorization', `bearer ${jwtToken}`)
                .expect(200)
                .expect(res => {
                    expect(res.body).to.have.property('id')
                    expect(res.body.task_name).to.eql(expectedTask.task_name)
                    expect(res.body.assignee_id).to.eql(expectedTask.assignee_id)
                })
        })       
    })

    describe(`PATCH /api/tasks/:id`, () => {
        beforeEach('insert tasks', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('assign task to a different user', () => {
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
            )

            return supertest(app)
                .patch('/api/tasks/2')
                .set('Authorization', `bearer ${jwtToken}`)
                .send({
                    assignee_id: 3
                })
                .expect(200)
                .expect(res => 
                    db
                        .from('choretastic_tasks')
                        .select('*')
                        .where({ id: 2 })
                        .first()
                        .then(row => {
                            expect(row.assignee_id).to.eql(3)
                        })
                )
        })
    })

    describe(`DELETE /api/tasks/:id`, () => {
        beforeEach('insert tasks', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('deletes task and returns 200 status', () => {
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
            )

            return supertest(app)
                .delete('/api/tasks/2')
                .set('Authorization', `bearer ${jwtToken}`)
                .expect(200)
                .expect(res =>{
                    supertest(app)
                    .get('/api/tasks/2')
                    .set('Authorization', `bearer ${jwtToken}`)
                    .expect(404)
                })   
        })
    })

    describe(`GET /api/tasks/own`, () => {
        beforeEach('insert tasks', () => 
            helpers.seedTables(
                db,
                testUsers,
                testTasks,
                testHomes
            )
        )

        it('returns own tasks', () => {
            const jwtToken = jwt.sign(
                { user_id: testUsers.indexOf(testUsers[0])+1 }, 
                config.JWT_SECRET, 
                { subject: testUsers[0].email, algorithm: 'HS256' }
            )

            return supertest(app)
                .get('/api/tasks/own')
                .set('Authorization', `bearer ${jwtToken}`)
                .expect(200)
                .expect(res => {
                    for(let i=0; i < res.body.length; i++){
                        expect(res.body[i].assignee_id).to.eql(testUsers.indexOf(testUsers[0])+1)
                    }
                })
        })

    })
})