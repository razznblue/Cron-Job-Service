# Setting up a Development Environment(Cron Job Service)

## Fork the Repo and clone the project
`git clone <repo_url>`

## Install dependencies
`npm install`

## Database Setup
 - Create a local MongoDB Database or in Atlas.

## Fill out env file
 - Using the [.env.example](../../.env.example) file, create a `.env` file and fill out the necessary parameters.

## Admin Setup
 - Run this route to create your local admin user passing in a username and password to the body.
 - Create Admin Route: `POST http://localhost:3005/admin/create`
 - Then login to be able to access all of the app protected routes and start developing
 - Login Route: `POST http://localhost:3005/admin/login`💪