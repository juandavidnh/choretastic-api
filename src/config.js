module.exports = {
    PORT: process.env.PORT || 8000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    CLIENT_ORIGIN: 'https://choretastic.now.sh/',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://juan_david_dev@localhost/choretastic',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://juan_david_dev@localhost/choretastic-test',
    JWT_SECRET: process.env.JWT_SECRET || '3D9E24B128237816B23EA63A8398C897DE5344039026A1EF8891756078C8733E'
}