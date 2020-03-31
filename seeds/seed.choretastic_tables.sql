BEGIN;

TRUNCATE
    choretastic_tasks,
    choretastic_users,
    choretastic_homes
    RESTART IDENTITY CASCADE;

INSERT INTO choretastic_homes (home_name, password)
VALUES
    ('Los Gatos', 'gatos_password'),
    ('Los Perros', 'perros_password'),
    ('Las Ratas', 'ratas_password');

INSERT INTO choretastic_users (email, password, first_name, last_name, nickname, points, home_id)
VALUES
    ('jd@choretastic.com', 'jd-password', 'Juan', 'Nunez', 'Juanpavip', 30, 1),
    ('mashua@choretastic.com', 'mashua-password', 'Mashua', 'Ninini', 'Shakmua', 50, 1),
    ('paco@choretastic.com', 'paco-password', 'Paco', 'Coco', 'Paquito', 40, 1),
    ('lola@choretastic.com', 'lola-password', 'Lola', 'Gata', 'Lolita', 20, 2),
    ('said@choretastic.com', 'said-password', 'Said', 'Hurtado', 'Estropajo', 60, 2),
    ('capuli@choretastic.com', 'capuli-password', 'Capuli', 'Llata', 'Papupapu', 10, 2),
    ('ivanka@choretastic.com', 'ivanka-password', 'Ivanka', 'Zauria', 'Buanabana', 70, 2),
    ('pimienka@choretastic.com', 'pimienka-password', 'Pimienka', 'Paca', 'Lola', 13, 3),
    ('frank@choretastic.com', 'frank-password', 'Frank', 'Nunez', 'Franklon', 57, 3),
    ('lorenga@choretastic.com', 'lorenga-password', 'Lorenga', 'Mama de Said', 'Lorenga', 21, 3);

INSERT INTO choretastic_tasks (task_name, points, status, assignee_id, home_id)
VALUES
    ('Vacuum', 5, 'pending', 1, 1),
    ('Take out trash', 7, 'pending', 1, 1),
    ('Clean litter', 6, 'pending', 2, 1),
    ('Wash clothes', 1, 'pending', 2, 1),
    ('Cut grass', 4, 'pending', 3, 1),
    ('Wash car', 9, 'pending', 3, 1),
    ('Feed cats', 8, 'pending', 4, 2),
    ('Clean bathrooms', 7, 'pending', 4, 2),
    ('Water plants', 2, 'pending', 5, 2),
    ('Cook dinner', 1, 'pending', 5, 2),
    ('Do groceries', 1, 'pending', 6, 2),
    ('Make bed', 5, 'pending', 6, 2),
    ('Walk dog', 10, 'pending', 7, 2),
    ('Cook breakfast', 8, 'pending', 7, 2),
    ('Cook lunch', 3, 'pending', 8, 3),
    ('Cut hair', 3, 'pending', 8, 3),
    ('Shine shoes', 1, 'pending', 9, 3),
    ('Change fish bowl water', 7, 'pending', 9, 3),
    ('Iron shirts', 9, 'pending', 10, 3),
    ('PLay with cats', 4, 'pending', 10, 3);

COMMIT;
