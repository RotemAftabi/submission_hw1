// tests/login.test.ts
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import app from '../expressApp';      // or wherever your Express app is exported
import { User } from '../models/User';

jest.setTimeout(20000);

beforeAll(async () => {
  // connect
  await mongoose.connect(process.env.MONGODB_CONNECTION_URL!);

  // remove any leftover testuser
  await User.deleteOne({ username: 'testuser' });

  // seed a new test user directly
  const passwordHash = await bcrypt.hash('s3cret', 10);
  await new User({
    name:         'Test User',
    email:        'test@example.com',
    username:     'testuser',
    passwordHash,             
  }).save();
});

afterAll(async () => {
  // clean up
  await User.deleteOne({ username: 'testuser' });
  await mongoose.disconnect();
});

describe('POST /login', () => {
  it('returns 200 and a token for valid credentials', async () => {
    const res = await request(app)
      .post('/login')   
      .send({ username: 'testuser', password: 's3cret' })
      .expect(200)
      .expect('Content-Type', /application\/json/);

    expect(res.body).toHaveProperty('token');
    expect(res.body).toMatchObject({
      username: 'testuser',
      name:     'Test User'
    });
  });

  it('returns 401 for wrong password', async () => {
    await request(app)
      .post('/login')
      .send({ username: 'testuser', password: 'wrongpass' })
      .expect(401)
      .expect(res => {
        expect(res.body.error).toBe('invalid credentials');
      });
  });

  it('returns 401 for non‐existent user', async () => {
    await request(app)
      .post('/login')
      .send({ username: 'nouser', password: 'whatever' })
      .expect(401)
      .expect(res => {
        expect(res.body.error).toBe('invalid credentials');
      });
  });
});