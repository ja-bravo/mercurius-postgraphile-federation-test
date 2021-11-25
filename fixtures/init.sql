CREATE TABLE dogs
(
  id serial PRIMARY KEY,
  name VARCHAR (50) NOT NULL
);

INSERT INTO dogs
  (name)
VALUES
  ('Alfie'),
  ('Nala');
