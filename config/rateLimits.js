module.exports = {
  anonymous: {
    limit: 10,
    window: 60
  },
  user: {
    limit: 100,
    window: 60
  },
  admin: {
    limit: 1000,
    window: 60
  },
  login: {
    limit: 5,
    window: 60
  }
};
