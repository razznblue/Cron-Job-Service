# Setting up a Development Environment(JetSetRadio-API-Admin)

## Fork the Repo and clone the project
`git clone <repo_url>`

## Install dependencies
`npm install`

## Database Setup
 - Create a local MongoDB Database or in Atlas. You should use the same DB setup if you already made one for API.

## Fill out env file
 - Using the [.env.example](../../.env.example) file, create a `qa.env` fill out the necessary parameters.
 - Example `qa.env` file:
```
#jsr-api-admin
PORT=
BASE_URL=localhost:3005
LOG_LEVEL=info

# Used to generate a sessionToken for the admin user
# You can generate/type this yourself while developing. It doesn't matter what it is.
TOKEN_SECRET=

# DB
MONGO_USER=
MONGO_PASS=
MONGO_CLUSTER=
MONGO_DOMAIN=
JSR_DB=
JSRF_DB=
CORE_DB=

# Google Cloud(optional. Only necessary if you want to store images)
CLOUD_BUCKET_NAME=
```

## Postman Collection Export
- You are welcome to download and use this [postman collection export](/src/utils/postman/JetSetRadio-API-Admin.postman_collection.json) with pre-defined routes. It is very helpful for developing. Just import the JSON file into Postman to start using it.

## Pipe Database
 - Once you get your local project connected to mongo, you'll likely want to work with real production data. There is a route you can run that will OVERWRITE your local database with what exists in production. 
 - PIPE route: `http://localhost:3005/pipe`
 - The logs should tell you if piping was successful or not.

## Admin Setup
 - Run this route to create your local admin user passing in a username and password to the body.
 - Create Admin Route: `POST http://localhost:3005/admin/create`
 - Then login to be able to access all of the app protected routes and start developing
 - Login Route: `POST http://localhost:3005/admin/login`

## Google Cloud Storage
 - The application has the option to store files in google cloud storage. It is sometimes a pain to setup a service worker account, grab the credentials file, and work with it. If you want to use the storage, hmu and we can come up with a plan! 💪

## New Resource
 - Interested in adding a completely new Resource to the API? Check out these [Docs](./Resource.md) on how to do that!