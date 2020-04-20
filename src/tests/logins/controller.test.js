const {Pool} = require('pg');
const crypto = require('crypto');
const request = require('supertest');
const app = require('../../auth');
let server;
let pool;

jest.mock('pg', () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return {Pool: jest.fn(() => mClient)};
});

beforeEach(async () => {
  server = await app.listen(4000);
  global.agent = request.agent(server);
  pool = new Pool();
});

describe('No logins exist, login created successfully', () => {
  it('Should return 200 OK', async () => {
    pool.query.mockResolvedValueOnce({rows: [{'count': '0'}], rowCount: 1});
    pool.query.mockResolvedValue();
    const username = 'test';
    const id = crypto.createHash('md5').update(username).digest('hex');
    const password = 'test';
    const email = 'test@test.com';
    const res = await global.agent
        .post('/v1/logins/create')
        .send({
          'username': username,
          'password': password,
          'email': email,
        });
    expect(pool.query)
        .toBeCalledWith(
            'SELECT COUNT(*) FROM logins WHERE username = $1 OR email = $2',
            [username, email],
            undefined,
        );
    expect(pool.query)
        .toBeCalledWith(
            'INSERT INTO logins(id, username, password, email) ' +
            'VALUES ($1, $2, $3, $4)',
            [id, username, password, email],
            undefined,
        );
    expect(pool.query).toBeCalledTimes(2);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({'msg': 'User created successfully'});
  });
});

describe('Username or email exists, login not created', () => {
  it('Should return 400 Bad Request', async () => {
    pool.query.mockResolvedValueOnce({rows: [{'count': '1'}], rowCount: 1});
    const res = await global.agent
        .post('/v1/logins/create')
        .send({
          'username': 'test',
          'password': 'test',
          'email': 'test@test.com',
        });
    expect(pool.query)
        .toBeCalledWith(
            'SELECT COUNT(*) FROM logins WHERE username = $1 OR email = $2',
            ['test', 'test@test.com'],
            undefined,
        );
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({'msg': 'Login information already exists'});
  });
});

describe('Username missing, login not created', () => {
  it('Should return 400 Bad Request', async () => {
    const res = await global.agent
        .post('/v1/logins/create')
        .send({
          'password': 'test',
          'email': 'test@test.com',
        });
    expect(pool.query).toBeCalledTimes(0);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(
        {'msg': 'The username, password, or email is missing'},
    );
  });
});

describe('Password missing, login not created', () => {
  it('Should return 400 Bad Request', async () => {
    const res = await global.agent
        .post('/v1/logins/create')
        .send({
          'username': 'test',
          'email': 'test@test.com',
        });
    expect(pool.query).toBeCalledTimes(0);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(
        {'msg': 'The username, password, or email is missing'},
    );
  });
});

describe('Email missing, login not created', () => {
  it('Should return 400 Bad Request', async () => {
    const res = await global.agent
        .post('/v1/logins/create')
        .send({
          'username': 'test',
          'password': 'test',
        });
    expect(pool.query).toBeCalledTimes(0);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual(
        {'msg': 'The username, password, or email is missing'},
    );
  });
});

describe('Username and email missing, login attempt failed', () => {
  it('Should return 400 Bad Request', async () => {
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'password': 'test',
        });
    expect(pool.query).toBeCalledTimes(0);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({'msg': 'Values missing from request'});
  });
});

describe('Password missing, login attempt failed', () => {
  it('Should return 400 Bad Request', async () => {
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'username': 'test',
          'email': 'test@test.com',
        });
    expect(pool.query).toBeCalledTimes(0);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({'msg': 'Values missing from request'});
  });
});

describe('Username and email both present, good login attempt', () => {
  it('Should return 200 OK with id', async () => {
    const usernameQuery = 'SELECT id FROM logins ' +
                'WHERE username = $1 ' +
                'AND password = $2';
    const username = 'test';
    const password = 'test';
    const email = 'test@test.com';
    const id = '12345';
    pool.query.mockResolvedValueOnce({rows: [{'id': id}], rowCount: 1});
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'username': username,
          'password': password,
          'email': email,
        });
    expect(pool.query)
        .toBeCalledWith(usernameQuery, [username, password], undefined);
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({'id': id});
  });
});

describe('Username and email both present, bad login attempt', () => {
  it('Should return 400 Bad Request with Invalid Credentials msg', async () => {
    const usernameQuery = 'SELECT id FROM logins ' +
                'WHERE username = $1 ' +
                'AND password = $2';
    const username = 'test';
    const password = 'test';
    const email = 'test@test.com';
    pool.query.mockResolvedValueOnce({rows: [], rowCount: 0});
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'username': username,
          'password': password,
          'email': email,
        });
    expect(pool.query)
        .toBeCalledWith(usernameQuery, [username, password], undefined);
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({'msg': 'Invalid credentials'});
  });
});

describe('Username/email both present, >1 rows returned, bad attempt', () => {
  it('Should return 400 Bad Request with Invalid Credentials msg', async () => {
    const usernameQuery = 'SELECT id FROM logins ' +
                'WHERE username = $1 ' +
                'AND password = $2';
    const username = 'test';
    const password = 'test';
    const email = 'test@test.com';
    pool.query.mockResolvedValueOnce(
        {rows: [{'id': '1234'}, {'id': '1111'}],
          rowCount: 2,
        });
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'username': username,
          'password': password,
          'email': email,
        });
    expect(pool.query)
        .toBeCalledWith(usernameQuery, [username, password], undefined);
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({'msg': 'Invalid credentials'});
  });
});

describe('Only username present, good login attempt', () => {
  it('Should return 200 OK with id', async () => {
    const usernameQuery = 'SELECT id FROM logins ' +
                'WHERE username = $1 ' +
                'AND password = $2';
    const username = 'test';
    const password = 'test';
    const id = '12345';
    pool.query.mockResolvedValueOnce({rows: [{'id': id}], rowCount: 1});
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'username': username,
          'password': password,
        });
    expect(pool.query)
        .toBeCalledWith(usernameQuery, [username, password], undefined);
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({'id': id});
  });
});

describe('Only username present, bad login attempt', () => {
  it('Should return 400 Bad Request with Invalid Credentials msg', async () => {
    const usernameQuery = 'SELECT id FROM logins ' +
                'WHERE username = $1 ' +
                'AND password = $2';
    const username = 'test';
    const password = 'test';
    pool.query.mockResolvedValueOnce({rows: [], rowCount: 0});
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'username': username,
          'password': password,
        });
    expect(pool.query)
        .toBeCalledWith(usernameQuery, [username, password], undefined);
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({'msg': 'Invalid credentials'});
  });
});

describe('Only username present, >1 rows returned, bad login attempt', () => {
  it('Should return 400 Bad Request with Invalid Credentials msg', async () => {
    const usernameQuery = 'SELECT id FROM logins ' +
                'WHERE username = $1 ' +
                'AND password = $2';
    const username = 'test';
    const password = 'test';
    pool.query.mockResolvedValueOnce(
        {rows: [{'id': '1234'}, {'id': '1111'}],
          rowCount: 2,
        });
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'username': username,
          'password': password,
        });
    expect(pool.query)
        .toBeCalledWith(usernameQuery, [username, password], undefined);
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({'msg': 'Invalid credentials'});
  });
});

describe('Only email present, good login attempt', () => {
  it('Should return 200 OK with id', async () => {
    const emailQuery = 'SELECT id FROM logins ' +
                       'WHERE email = $1 ' +
                       'AND password = $2';
    const email = 'test@test.com';
    const password = 'test';
    const id = '12345';
    pool.query.mockResolvedValueOnce({rows: [{'id': id}], rowCount: 1});
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'email': email,
          'password': password,
        });
    expect(pool.query)
        .toBeCalledWith(emailQuery, [email, password], undefined);
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({'id': id});
  });
});

describe('Only email present, bad login attempt', () => {
  it('Should return 400 Bad Request with Invalid Credentials msg', async () => {
    const emailQuery = 'SELECT id FROM logins ' +
                       'WHERE email = $1 ' +
                       'AND password = $2';
    const email = 'test@test.com';
    const password = 'test';
    pool.query.mockResolvedValueOnce({rows: [], rowCount: 0});
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'email': email,
          'password': password,
        });
    expect(pool.query)
        .toBeCalledWith(emailQuery, [email, password], undefined);
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({'msg': 'Invalid credentials'});
  });
});

describe('Only email present, >1 rows returned, bad login attempt', () => {
  it('Should return 400 Bad Request with Invalid Credentials msg', async () => {
    const emailQuery = 'SELECT id FROM logins ' +
                       'WHERE email = $1 ' +
                       'AND password = $2';
    const email = 'test@test.com';
    const password = 'test';
    pool.query.mockResolvedValueOnce(
        {rows: [{'id': '1234'}, {'id': '1111'}],
          rowCount: 2,
        });
    const res = await global.agent
        .post('/v1/logins/login')
        .send({
          'email': email,
          'password': password,
        });
    expect(pool.query)
        .toBeCalledWith(emailQuery, [email, password], undefined);
    expect(pool.query).toBeCalledTimes(1);
    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({'msg': 'Invalid credentials'});
  });
});


afterEach(async () => {
  await server.close();
  jest.clearAllMocks();
});

afterAll(async () => {
  await new Promise(
      (resolve) => setTimeout(() => resolve(), 500));
});
