const {Pool} = require('pg');

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

afterEach(async () => {
  await server.close();
  jest.clearAllMocks();
});

afterAll(async () => {
  await new Promise(
      (resolve) => setTimeout(() => resolve(), 500));
});
