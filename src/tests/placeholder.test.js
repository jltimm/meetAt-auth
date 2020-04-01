const request = require('supertest');
const app = require('../api/auth');

let server;

beforeEach(async () => {
  server = await app.listen(4000);
  global.agent = request.agent(server);
});

describe('Placeholder test', () => {
  it('should return true', async () => {
    const trueValue = true;
    expect(trueValue).toEqual(true);
  });
});

afterEach(async () => {
  await server.close();
});

afterAll(async () => {
  await new Promise(
      (resolve) => setTimeout(() => resolve(), 500));
});
