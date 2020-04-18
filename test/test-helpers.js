
function makeUsersArray() {
    return [
        {
            "id": 1,
            "email": "jd@choretastic.com",
            "password": "jd-password",
            "first_name": "Juan David",
            "last_name": "Nunez",
            "nickname": "juandavidnh",
            "points": 50,
            "home_id": 1,
            "date_created": "2020-04-18T18:57:54.111Z"
        },
        {
            "id": 2,
            "email": "ivanka@choretastic.com",
            "password": "ivanka-password",
            "first_name": "Ivanna",
            "last_name": "Zauzich",
            "nickname": "ivankazauria",
            "points": 20,
            "home_id": 1,
            "date_created": "2020-04-18T18:57:54.111Z"
        },
        {
            "id": 3,
            "email": "mashua@choretastic.com",
            "password": "mashua-password",
            "first_name": "Mashua",
            "last_name": "Lleina",
            "nickname": "mashuacucuga",
            "points": 100,
            "home_id": 1,
            "date_created": "2020-04-18T18:57:54.111Z"
        },
        {
            "id": 4,
            "email": "lilili@choretastic.com",
            "password": "lilili-password",
            "first_name": "Capuli",
            "last_name": "Llata",
            "nickname": "el_llata",
            "points": 0,
            "home_id": 2,
            "date_created": "2020-04-18T18:57:54.111Z"
        },
        {
            "id": 5,
            "email": "pimienka@choretastic.com",
            "password": "pimienka-password",
            "first_name": "Pimienka",
            "last_name": "Zauria",
            "nickname": "pimienkadoca",
            "points": 20,
            "home_id": 2,
            "date_created": "2020-04-18T18:57:54.111Z"
        },
        {
            "id": 6,
            "email": "mashuo@choretastic.com",
            "password": "mashuo-password",
            "first_name": "Mashuo",
            "last_name": "Piundai",
            "nickname": "mashuo",
            "points": 40,
            "home_id": 2,
            "date_created": "2020-04-18T18:57:54.111Z"
        }
    ]
}

function makeTasksArray() {
    return [
        {
            "id": "1",
            "task_name": "Clean bathroom",
            "points": 7,
            "assignee_id": "1",
            "status": "pending"
        },
        {
            "id": "2",
            "task_name": "Feed cats",
            "points": 3,
            "assignee_id": "2",
            "status": "pending" 
        },
        {
            "id": "3",
            "task_name": "Clean litter",
            "points": 7,
            "assignee_id": "3",
            "status": "pending"
        },
        {
            "id": "4",
            "task_name": "Wash car",
            "points": 6,
            "assignee_id": "1",
            "status": "pending"
        },
        {
            "id": "5",
            "task_name": "Vacuum",
            "points": 8,
            "assignee_id": "2",
            "status": "pending"
        },
        {
            "id": "6",
            "task_name": "Make breakfast",
            "points": 6,
            "assignee_id": "4",
            "status": "pending"
        }, 
        {
            "id": "7",
            "task_name": "Take out trash",
            "points": 3,
            "assignee_id": "5",
            "status": "pending"
        },
        {
            "id": "8",
            "task_name": "Wash dishes",
            "points": 7,
            "assignee_id": "6",
            "status": "pending"
        },
        {
            "id": "9",
            "task_name": "Clean toilets",
            "points": 8,
            "assignee_id": "4",
            "status": "pending"
        }, 
        {
            "id": "10",
            "task_name": "Make bed",
            "points": 3,
            "assignee_id": "5",
            "status": "pending"
        }
    ]
}

function makeHomesArray() {
    return [
        {
            "id": "1",
            "password": "gatos-password",
            "home_name": "Los Gatos"
        },
        {
            "id": "2",
            "password": "perros-password",
            "home_name": "Los Perros"
        }
    ]
}

function cleanTables(db) {
    return db.raw(
        `TRUNCATE
        choretastic_users,
        choretastic_tasks,
        choretastic_homes
        RESTART IDENTITY CASCADE`
    )
}

function seedTables(db, users, tasks, homes){
    return db
        .into('choretastic_homes')
        .insert(homes)
        .then(() =>
            db 
                .into('choretastic_users')
                .insert(users)
        )
        .then(() =>
            db  
                .into('choretastic_tasks')
                .insert(tasks)
        )
}

function makeFixtures() {
    const testUsers = makeUsersArray()
    const testHomes = makeHomesArray()
    const testTasks = makeTasksArray()

    return {testUsers, testTasks, testHomes}
}

module.exports = {
    seedTables,
    cleanTables,
    makeHomesArray,
    makeTasksArray,
    makeUsersArray,
    makeFixtures
}