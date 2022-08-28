const mysql = require("mysql2");
const inquirer = require("inquirer");
const cTable = require("console.table");
const ascii = require("ascii-art-font");
// const connectionInfo = require("./dbinfo");

require("dotenv").config();

//connect to database
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PASSWORD,
  database: "employee_db",
});

connection.connect((err) => {
  if (err) throw err;
  console.log("connectes as id " + connection.threadId);
  afterConnections();
});

afterConnections = () => {
  console.log("\n" + "=".repeat(62) + "\n");
  ascii.create("    Employee", "Doom", (err, result) => {
    if (err) throw err;
    console.log(result);
    ascii.create("      Manager", "Doom", (err, result) => {
      if (err) throw err;
      console.log(result);
      console.log("\n" + "=".repeat(62) + "\n");
      promptUser();
    });
  });
};
var promptUser = () => {
  inquirer
    .prompt([
      {
        type: "list",
        name: "choices",
        message: "What would you like to do?",
        choices: [
          "View all departments",
          "View all roles",
          "View all employees",
          "Add a department",
          "Add a role",
          "Add an employee",
          "No Action",
        ],
      },
    ])
    .then((answers) => {
      const { choices } = answers;

      if (choices === "View all departments") {
        showDepartments();
      }

      if (choices === "View all roles") {
        showRoles();
      }

      if (choices === "View all employees") {
        showEmployees();
      }

      if (choices === "Add a department") {
        addDepartment();
      }

      if (choices === "Add a role") {
        addRole();
      }

      if (choices === "Add an employee") {
        addEmployee();
      }

      if (choices === "No Action") {
        connection.end();
      }
    });
};
