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

//creates the welcome screen
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

//prompts user for: view all departments, view all roles, view all employees, add a department, add a role, add an employee, and update an employee role
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
          "Update employee role",
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

      if (choices === "Update employee role") {
        updateEmployee();
      }

      if (choices === "No Action") {
        connection.end();
      }
    });
};

//view all departments will present user with a formated table showing department names and ids
showDepartments = () => {
  console.log("Showing departments...\n");
  const sql = `SELECT department.id AS id, department.name AS department FROM department`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// view all roles will present table with the job title, role id, the department that role belongs to, and the salary for that role
showRoles = () => {
  console.log("Showing all roles...\n");

  const sql = `SELECT role.id, role.title, department.name AS department
                 FROM role
                 INNER JOIN department ON role.department_id = department.id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// view all employees will present table with employee data, including employee ids, first names, last names, job titles, departments,
//salaries, and managers that the employees report to
showEmployees = () => {
  console.log("Showing all employees...\n");
  const sql = `SELECT employee.id, 
                        employee.first_name, 
                        employee.last_name, 
                        role.title, 
                        department.name AS department,
                        role.salary, 
                        CONCAT (manager.first_name, " ", manager.last_name) AS manager
                 FROM employee
                        LEFT JOIN role ON employee.role_id = role.id
                        LEFT JOIN department ON role.department_id = department.id
                        LEFT JOIN employee manager ON employee.manager_id = manager.id`;

  connection.query(sql, (err, rows) => {
    if (err) throw err;
    console.table(rows);
    promptUser();
  });
};

// add a department will prompt to enter the name of the department and that department is added to the database
addDepartment = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "addDept",
        message: "What department do you want to add?",
        validate: (addDept) => {
          if (addDept) {
            return true;
          } else {
            console.log("Please enter a department");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const sql = `INSERT INTO department (name)
                    VALUES (?)`;
      connection.query(sql, answer.addDept, (err, result) => {
        if (err) throw err;
        console.log("Added " + answer.addDept + " to departments!");

        showDepartments();
      });
    });
};

// add a role will prompt to enter the name, salary, and department for the role and that role is added to the database
addRole = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "role",
        message: "What role do you want to add?",
        validate: (addRole) => {
          if (addRole) {
            return true;
          } else {
            console.log("Please enter a role");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "salary",
        message: "What is the salary of this role?",
        validate: (addSalary) => {
          if (isNaN(addSalary)) {
            console.log(
              "\n Invalid: Must be a number. Do not include decimals."
            );
            return false;
          } else {
            return true;
          }
        },
      },
    ])
    .then((answer) => {
      const params = [answer.role, answer.salary];

      // grab dept from department table
      const roleSql = `SELECT name, id FROM department`;

      connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const dept = data.map(({ name, id }) => ({ name: name, value: id }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "dept",
              message: "What department is this role in?",
              choices: dept,
            },
          ])
          .then((deptChoice) => {
            const dept = deptChoice.dept;
            params.push(dept);

            const sql = `INSERT INTO role (title, salary, department_id)
                          VALUES (?, ?, ?)`;

            connection.query(sql, params, (err, result) => {
              if (err) throw err;
              console.log("Added" + answer.role + " to roles!");

              showRoles();
            });
          });
      });
    });
};

//add an employee will prompt to enter the employee’s first name, last name, role, and manager, and that employee is added to the database
addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "fistName",
        message: "What is the employee's first name?",
        validate: (addFirst) => {
          if (addFirst) {
            return true;
          } else {
            console.log("Please enter a first name");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
        validate: (addLast) => {
          if (addLast) {
            return true;
          } else {
            console.log("Please enter a last name");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const params = [answer.fistName, answer.lastName];

      // grab roles from roles table
      const roleSql = `SELECT role.id, role.title FROM role`;

      connection.query(roleSql, (err, data) => {
        if (err) throw err;

        const roles = data.map(({ id, title }) => ({ name: title, value: id }));

        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the employee's role?",
              choices: roles,
            },
          ])
          .then((roleChoice) => {
            const role = roleChoice.role;
            params.push(role);

            const managerSql = `SELECT * FROM employee`;

            connection.query(managerSql, (err, data) => {
              if (err) throw err;

              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
              }));

              // console.log(managers);

              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: managers,
                  },
                ])
                .then((managerChoice) => {
                  const manager = managerChoice.manager;
                  params.push(manager);

                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                      VALUES (?, ?, ?, ?)`;

                  connection.query(sql, params, (err, result) => {
                    if (err) throw err;
                    console.log("Employee has been added!");

                    showEmployees();
                  });
                });
            });
          });
      });
    });
};

//update employee will prompt to select an employee to update and their new role and this information is updated in the database
updateEmployee = () => {
  // get employees from employee table
  const employeeSql = `SELECT * FROM employee`;

  connection.query(employeeSql, (err, data) => {
    if (err) throw err;

    const employees = data.map(({ id, first_name, last_name }) => ({
      name: first_name + " " + last_name,
      value: id,
    }));

    inquirer
      .prompt([
        {
          type: "list",
          name: "name",
          message: "Which employee would you like to update?",
          choices: employees,
        },
      ])
      .then((empChoice) => {
        const employee = empChoice.name;
        const params = [];
        params.push(employee);

        const roleSql = `SELECT * FROM role`;

        connection.query(roleSql, (err, data) => {
          if (err) throw err;

          const roles = data.map(({ id, title }) => ({
            name: title,
            value: id,
          }));

          inquirer
            .prompt([
              {
                type: "list",
                name: "role",
                message: "What is the employee's new role?",
                choices: roles,
              },
            ])
            .then((roleChoice) => {
              const role = roleChoice.role;
              params.push(role);

              let employee = params[0];
              params[0] = role;
              params[1] = employee;

              // console.log(params)

              const sql = `UPDATE employee SET role_id = ? WHERE id = ?`;

              connection.query(sql, params, (err, result) => {
                if (err) throw err;
                console.log("Employee has been updated!");

                showEmployees();
              });
            });
        });
      });
  });
};
