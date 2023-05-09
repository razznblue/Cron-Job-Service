# Setting up a Development Environment(JetSetRadio-API-Admin)

## Fork the Repo and clone the project
`git clone <repo_url>`

## Install dependencies
`npm install`

## Database Setup
 - Create a local MongoDB Database or in Atlas

## Fill out env file
 - Using the [.env.example](../../.env.example) file, create a `qa.env` fill out the necessary parameters.
 - Example `qa.env` file:
```
#jarspi-admin
PORT=
BASE_URL=localhost:<PORT>
LOG_LEVEL=info

# Used to generate a sessionToekn for the admin user
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

 - Include the postman collection import
 - Include link to ./src/docs/Resource.md
 - Include section about setting up a local mongoDB server(same DB if you already made one for the API)
 - Include section about running the pipe route to populate database locally
 - Include section about service worker(optional if they want to utilize google cloud storage)