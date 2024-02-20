#### Project Setup
To get started with this project, follow these steps:
1. Clone the project repository.
2. Install Node.js if you haven't already. You can download it [here](https://nodejs.org/en).
4. Navigate to the project directory in your terminal.
5. Run `npm install` to install all dependencies.
6. Run `npm install -g nodemon` to install the Node.js package 'nodemon' globally on your system. Nodemon is a utility tool that helps in development by automatically restarting the Node.js application whenever changes are made to the files in the directory.

#### Running the Project
Once you have installed the dependencies, you can start the project in either Development or Production environment:

- #### *Development Environment* 
`npm run start`.
This mode provides detailed error information, including the stack trace, which is sent to the client. It's suitable for development purposes.

- #### *Production Environment*
`npm run start:prod`.
In this mode, only specific error messages are sent to the client, while sensitive information such as stack traces is hidden. This approach helps prevent leaking internal details to the client in a production environment.
