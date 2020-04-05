BEGIN;

TRUNCATE
    choretastic_tasks,
    choretastic_users,
    choretastic_homes
    RESTART IDENTITY CASCADE;

INSERT INTO choretastic_homes (home_name, password)
VALUES
    ('Los Gatos', '$2a$12$r7Dui4oHzQZetu648IAszuaB1KLin7uQ81n.Q5NKwm72dQs2.wnVC'),
    ('Los Perros', '$2a$12$.bMYc5dqua2b2azMGxeTvOJ01OP.zSNEByca44LY/cRR3yj7l7Am.'),
    ('Las Ratas', '$2a$12$55iYTTDXiJDcQmVGQFaOQuRKmNkBIC1EkS6awzNZpc4YoHPgRk5KK');

INSERT INTO choretastic_users (email, password, first_name, last_name, nickname, points, home_id)
VALUES
    ('jd@choretastic.com', '$2a$12$Gyv4dTZ5Gm3W7sSmGqjRC.dT681fbCnv3HvrtuX8eYQast4iSOL16', 'Juan', 'Nunez', 'Juanpavip', 30, 1),
    ('mashua@choretastic.com', '$2a$12$jmdRvAV4MaPd7I15E1A4G.aaMlFcXdZ9DRpEy5/ZvQmrJdfIAFIGC', 'Mashua', 'Ninini', 'Shakmua', 50, 1),
    ('paco@choretastic.com', '$2a$12$9BQ6lP.A1SjKt7SDUMbTU.19jkaRTn71TsCWYzrVfYN6olb7iVFa.', 'Paco', 'Coco', 'Paquito', 40, 1),
    ('lola@choretastic.com', '$2a$12$o7OBjReJfzqGdrlKm3SfkuCRfca0BfMPpqB/TtxyCYsanEfR6AYpi', 'Lola', 'Gata', 'Lolita', 20, 2),
    ('said@choretastic.com', '$2a$12$cxH/df2acH45NNZFfrVWouyNeXxUlqO4soB7blDmZlTSBECyzYztW', 'Said', 'Hurtado', 'Estropajo', 60, 2),
    ('capuli@choretastic.com', '$2a$12$UzhHBfCGf2Dw2q3YPD.jJOIdgpsKJnYM42Dm6patl1Kh8riE0RI0S', 'Capuli', 'Llata', 'Papupapu', 10, 2),
    ('ivanka@choretastic.com', '$2a$12$Jn6OG7OvrxaRVs3VJ9Fs8.JtHXnviTY9QtQ37Qi68hYIAC6FVxAxW', 'Ivanka', 'Zauria', 'Buanabana', 70, 2),
    ('pimienka@choretastic.com', '$2a$12$iU1HMOhcljhGafVABr/vP.R6HrMNzWsdgUREe8fHv/Yx7/yERoKgu', 'Pimienka', 'Paca', 'Lola', 13, 3),
    ('frank@choretastic.com', '$2a$12$vNv.WzQvGDJALwz6kPUkKeugAsP51VT9gskZR./gB1lXzVrd4fzD2', 'Frank', 'Nunez', 'Franklon', 57, 3),
    ('lorenga@choretastic.com', '$2a$12$53lUGNUCxi6k8KzKmh6J/eYhdZjYPkhxxl3tEYTaiLVb7l0BUg.Vm', 'Lorenga', 'Mama de Said', 'Lorenga', 21, 3);

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
