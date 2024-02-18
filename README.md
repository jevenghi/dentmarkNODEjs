Clone the project, install Node.js. Navigate to the project directory in terminal and run npm install. Then
$ npm run start (to run in Development environment, detailed error information including the stack trace is sent to the client)
$ npm run start:prod (for Production environment, only specific error messages are sent, while hiding sensitive information such as stack traces. This helps to prevent leaking internal details to the client in a production environment.)
