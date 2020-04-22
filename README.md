# Choretastic API

## Summary

Choretastic is a web app that allows users to organize their household's chores among members of their family. Each task will confer a certain number of points to the user who completes it.
There will be a scoreboard with each user's points ordered from highest to lowest.

## Base URL

The base url to access our API is [https://fathomless-sands-27164.herokuapp.com/](https://fathomless-sands-27164.herokuapp.com/)

## Authentication

In order to interact with the database you'll need a valid user token passed through Header.

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

## Scripts

Start the application `npm start`

Start nodemon for the application `npm run dev`

Run the tests `npm test`

## Deploying

When your new project is ready for deployment, add a new Heroku application with `heroku create`. This will make a new git remote called "heroku" and you can then `npm run deploy` which will push to this remote's master branch.