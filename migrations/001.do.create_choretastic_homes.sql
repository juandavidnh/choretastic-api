CREATE TABLE choretastic_homes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    home_name TEXT NOT NULL,
    password TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);