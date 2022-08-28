INSERT INTO department (name)
VALUES 
('Sales'),
('Engineering'),
('Finance'),
('Legal');

INSERT INTO role (title, department_id, salary)
VALUES
('Sales Lead', 1, 100000),
('Salesperson', 1, 80000),
('Lead Engineeer', 2, 150000),
('Software Engineer', 2, 120000),
('Account Manager', 3, 160000),
('Accountant', 3, 125000),
('Legal Team Lead', 4, 250000),
('Lawyer', 4, 190000);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('John', 'Doe', 1, null),
('Mary', 'Smith', 2, null),
('Steve', 'Dawn', 2, 1),
('Roger', 'Roger', 5, null),
('Dean', 'Smith', 6, 4),
('Katheryn', 'Savage', 8, null);