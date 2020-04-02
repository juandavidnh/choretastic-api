module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: 'https://choretastic.now.sh/',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://juan_david_dev@localhost/choretastic',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://juan_david_dev@localhost/choretastic-test',
    JWT_SECRET: process.env.JWT_SECRET || 'random-secret'
}