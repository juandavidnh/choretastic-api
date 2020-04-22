# Choretastic API

## Summary

Choretastic is a web app that allows users to organize their household's chores among members of their family. Each task will confer a certain number of points to the user who completes it.
There will be a scoreboard with each user's points ordered from highest to lowest.

## Base URL

The base url to access our API is [https://fathomless-sands-27164.herokuapp.com/](https://fathomless-sands-27164.herokuapp.com/)

## Authentication

In order to access most you'll need a valid user token passed through Header.

You can demo test with the following token:
`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1ODc1NzYyMDAsInN1YiI6ImpkQGNob3JldGFzdGljLmNvbSJ9.BeN42FSpXhZ3ByViyF7WeccjzLRbMfdcZkez2y0Nv8A`


## Endpoints

### /api/users

Use this endpoint to interact with the users table.

#### GET /api/users/

Gets all users that belong to the user's home.

Response example:

```javascript

[
    {
        "id": 21,
        "first_name": "jalo",
        "last_name": "mas",
        "nickname": "jalon",
        "email": "jal@choretastic.com",
        "password": "$2a$12$6BYF5cBtMIDawJW8pVHHwO3q7W1I3i..7l0zDKPL5SQ4QL9JZM8eG",
        "points": 0,
        "home_id": 6,
        "date_created": "2020-04-17T01:43:09.601Z"
    },
    {
        "id": 23,
        "first_name": "pacos feaas",
        "last_name": "llatas",
        "nickname": "",
        "email": "jd@nunununbunu.com",
        "password": "CODfin235!",
        "points": 0,
        "home_id": 6,
        "date_created": "2020-04-18T19:39:10.654Z"
    },
    {
        "id": 25,
        "first_name": "pacos feaas",
        "last_name": "llatas",
        "nickname": "",
        "email": "jd@hdisahudisahodsaho.com",
        "password": "CODfin235!",
        "points": 0,
        "home_id": 6,
        "date_created": "2020-04-18T19:53:21.363Z"
    },
    {
        "id": 26,
        "first_name": "pacos feaas",
        "last_name": "llatas",
        "nickname": "",
        "email": "jd@dsa.com",
        "password": "CODfin235!",
        "points": 0,
        "home_id": 6,
        "date_created": "2020-04-18T21:43:57.008Z"
    }
]
```

#### POST /api/users/add-user

Add new user with the home where your token has access to.

Body request example:
```javascript
{
	"first_name": "Tests",
	"last_name": "Smith",
	"password": "MyNewPassword321!",
	"nickname": "pancho",
	"email": "jd@gmail3.com"
}
```

`first_name`, `last-name`, `password`, and `email` are required.

Response example:
```javascript
{
    "id": 28,
    "first_name": "Tests",
    "last_name": "Smith",
    "nickname": "pancho",
    "email": "jd@gmail3.com",
    "password": "MyNewPassword321!",
    "points": 0,
    "home_id": 6,
    "date_created": "2020-04-22T21:51:40.778Z"
}
```

#### POST /api/users/sign-up

Add new user without a specific home. No `Authorization` header required.

Body request example:
```javascript
{
	"first_name": "Tests",
	"last_name": "Smith",
	"password": "MyNewPassword321!",
	"nickname": "pancho",
	"email": "jd@gmail4.com"
}
```

`first_name`, `last-name`, `password`, and `email` are required.

Response example:
```javascript
{
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoyOSwiaWF0IjoxNTg3NTc0NzI1LCJzdWIiOiJqZEBnbWFpbDQuY29tIn0.iALNvQvomAwiI5PIukCaGWlQwNmYSawggewR7vriiYw"
}
```

#### GET /api/users/user-id/:id

Get specific user. You can only access users who are in the same home your token has access to.

Sample request url:
`GET /api/users/user-id/3`

Response example:
```javascript
{
    "id": 3,
    "first_name": "Paco",
    "last_name": "Coco",
    "nickname": "Paquito",
    "email": "paco@choretastic.com",
    "password": "$2a$12$9BQ6lP.A1SjKt7SDUMbTU.19jkaRTn71TsCWYzrVfYN6olb7iVFa.",
    "points": 46,
    "home_id": 1,
    "date_created": "2020-04-16T16:38:18.451Z"
}
```

#### PATCH /api/users/user-id/:id

Edit a specific user attribute. You can only edit users who are in the same home your token has access to.

Sample request url:
`GET /api/users/user-id/3`

Sample body request:
```javascript
{
	"home_id": 2
}
```

Successful response: `OK`

#### DELETE /api/users/user-id/:id

Delete a specific user from database. You can only delete users who are in the same home your token has access to.

Sample request url:
`GET /api/users/user-id/3`

When successful it'll respond with a 204 status.

#### GET /api/users/own

Get user object associated with authToken.

Sample request url:
`GET /api/users/own`

Successful response:
```javascript
{
    "id": 1,
    "first_name": "Juan",
    "last_name": "Nunez",
    "nickname": "Juanpavip",
    "email": "jd@choretastic.com",
    "password": "$2a$12$Gyv4dTZ5Gm3W7sSmGqjRC.dT681fbCnv3HvrtuX8eYQast4iSOL16",
    "points": 35,
    "home_id": 1,
    "date_created": "2020-04-16T16:38:18.451Z"
}
```

### /api/tasks

Use this endpoint to interact with the tasks table.

#### GET /api/tasks/

Gets all tasks that belong to the user's home.

Response example:

```javascript
[
    {
        "id": 5,
        "task_name": "Cut grass",
        "status": "pending",
        "points": 4,
        "assignee_id": 3,
        "home_id": 1,
        "date_created": "2020-04-16T16:38:18.451Z",
        "date_completed": "1970-01-01T00:00:00.000Z"
    },
    {
        "id": 21,
        "task_name": "New Task",
        "status": "complete",
        "points": 6,
        "assignee_id": 3,
        "home_id": 1,
        "date_created": "2020-04-16T16:39:17.795Z",
        "date_completed": "1970-01-01T00:00:00.000Z"
    },
    {
        "id": 1,
        "task_name": "Vacuum",
        "status": "complete",
        "points": 5,
        "assignee_id": 1,
        "home_id": 1,
        "date_created": "2020-04-16T16:38:18.451Z",
        "date_completed": "1970-01-01T00:00:00.000Z"
    },
    {
        "id": 23,
        "task_name": "guyghu",
        "status": "pending",
        "points": 5,
        "assignee_id": 15,
        "home_id": 1,
        "date_created": "2020-04-16T18:49:19.717Z",
        "date_completed": "1970-01-01T00:00:00.000Z"
    },
    {
        "id": 4,
        "task_name": "Wash clothes",
        "status": "pending",
        "points": 1,
        "assignee_id": null,
        "home_id": 1,
        "date_created": "2020-04-16T16:38:18.451Z",
        "date_completed": "1970-01-01T00:00:00.000Z"
    },
    {
        "id": 6,
        "task_name": "Wash car",
        "status": "pending",
        "points": 9,
        "assignee_id": null,
        "home_id": 1,
        "date_created": "2020-04-16T16:38:18.451Z",
        "date_completed": "1970-01-01T00:00:00.000Z"
    },
    {
        "id": 22,
        "task_name": "New new task",
        "status": "pending",
        "points": 7,
        "assignee_id": null,
        "home_id": 1,
        "date_created": "2020-04-16T16:55:09.799Z",
        "date_completed": "1970-01-01T00:00:00.000Z"
    }
]
```

#### POST /api/tasks

Add new task to the home where your token has access to.

Body request example:
```javascript
{
	"task_name": "Tests",
	"points": "Smith",
	"assignee_id": "MyNewPassword321!",
}
```

`task_name`, `points`, and `assignee_id` are required.

Response example:
```javascript
{
    "id": 26,
    "task_name": "Brush cat's hair",
    "status": "pending",
    "points": 5,
    "assignee_id": 3,
    "home_id": 1,
    "date_created": "2020-04-22T22:46:01.314Z",
    "date_completed": "1970-01-01T00:00:00.000Z"
}
```

#### GET /api/tasks/:taskId

Get specific task. You can only access that who are in the same home your token has access to.

Sample request url:
`GET /api/tasks/5`

Response example:
```javascript
{
    "id": 5,
    "task_name": "Cut grass",
    "status": "pending",
    "points": 4,
    "assignee_id": 3,
    "home_id": 1,
    "date_created": "2020-04-16T16:38:18.451Z",
    "date_completed": "1970-01-01T00:00:00.000Z"
}
```

#### PATCH /api/tasks/:taskId

Edit a specific task attribute. You can only edit tasks that are in the same home your token has access to.

Sample request url:
`PATCH /api/tasks/5`

Sample body request:
```javascript
{
	"status": "complete"
}
```

Successful response: `OK`

#### DELETE /api/tasks/:taskId

Delete a specific task from database. You can only delete tasks that are in the same home your token has access to.

Sample request url:
`GET /api/tasks/5`

Successful response: `OK`

#### GET /api/tasks/own

Get tasks object associated with logged in user.

Sample request url:
`GET /api/tasks/own`

Successful response:
```javascript
[
    {
        "id": 1,
        "task_name": "Vacuum",
        "status": "complete",
        "points": 5,
        "assignee_id": 1,
        "home_id": 1,
        "date_created": "2020-04-16T16:38:18.451Z",
        "date_completed": "1970-01-01T00:00:00.000Z"
    }
]
```

### /api/homes

Use this endpoint to interact with the homes table.

#### POST /api/homes/add-home

Add new home.

Sample body request:

```javascript
{
    "home_name": "Las Casas",
    "password": "CasasPassword123!"
}
```
Successful response:

```javascript
{
    "id": 7,
    "home_name": "Las Casas",
    "password": "$2a$12$wHfOVpSLN.B0npVd1MjDD.Z5hoX/GXoHFHMIUGf8RW7UCUKoeBQwS",
    "date_created": "2020-04-22T22:56:28.579Z"
}
```

### /api/auth-user

Authenticate existing user and get a valid token.

#### /api/auth-user/login

Sample body request:

```javascript
{
    "email": "jd@choretastic.com",
    "password": "jd-password"
}
```

Both email and password are required.

Sample response:

```javascript
{
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE1ODc1Nzg0NDAsInN1YiI6ImpkQGNob3JldGFzdGljLmNvbSJ9.-i1c1Pmfa7ZTt0QE53YEtUSzGWsMmGSY4G_BGdNu0zI"
}
```

### /api/auth-home

Authenticate existing home login.

#### /api/auth-home/login

Sample body request:

```javascript
{
    "email": "jd@choretastic.com",
    "password": "jd-password"
}
```

Both `home_name` and `password` are required.

Sample response:

```javascript
{
    "id": 1,
    "home_name": "Los Gatos",
    "password": "$2a$12$r7Dui4oHzQZetu648IAszuaB1KLin7uQ81n.Q5NKwm72dQs2.wnVC",
    "date_created": "2020-04-16T16:38:18.451Z"
}
```

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.