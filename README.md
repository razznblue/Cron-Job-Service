
# <img src="https://storage.googleapis.com/jetsetradio-api-core/images/jsr-logo.png" width=6% />  JetSetRadio-API Admin

A set of Tools to manage the [JetSetRadio-API](https://github.com/Jet-Set-Radio-API/JetSetRadio-API)

## Purpose
This application uses an ETL process to centralize multiple data sources into a single source and pump that into a Database Collection. The JetSetRadio-API contains all of the public API endpoints that you can use freely. The JetSetRadio-API relies on this service to make sure data is stored and is secure.


## Overview
This is an open-source software free for anyone to use. I do NOT claim to own.
 *NOTE: I do NOT own JetSetRadio, JetSetRadioFuture, or any entity falling under the JetSetRadio franchise. I do not own the name Jet-Set-Radio-API. I do not own any of the content provided by this API.


## Integrations
 - MongoDB
 - Google Cloud
 - SwaggerUI
 - JetSetPedia
 
## CronJobs
 - Each Data Model is connected to a cronJob that runs on a specified interval. This application contains a REST API to handle these jobs. CronJob routes are protected in Production.


## Contributing
I am open and welcome to ALL contributions!

Instructions on setting up a DEV environment is coming soon!

Please submit a Pull Request off of main with your proposed changes. 
You can also submit an issue if you find something wrong, have questions, or want to discuss something further.

For help on how to setup a pipeline for a new data point, see the [Instructions](./src/jobs/DataPoint.md) here.

Feel free to post anything under Issues even if it is a question or comment. If you see something incorrect from any of the endpoints, that is definitely something you can post about.

You may see a warning 'Unable to get GCS Bucket' while starting up the app. You can get rid of this warning by setting up a service account to connect to this app. Plug in your bucket name to the .env file and the error should disappear. However, this step is not required to develop throughout the rest of the app!


## Author
 - RazzNBlue


## License
 - [Apache 2.0](/LICENSE)


## Acknowledgements
 - SEGA - Creators and Owners of Jet Set Radio
 - Hideki Naganuma - Composer, DJ, and Remixer of Jet Set Radio Music
 - The Creators and Contributors of [JetSetPedia](https://jetsetradio.fandom.com/wiki/Main_Page)
 - Greg Kennedy for gathering all of the [JSR Graffiti Files](https://greg-kennedy.com/jsr/) into one organized place.
 - The JetSetRadio Community

