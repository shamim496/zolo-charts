module.exports = {
    extends: ['@react-native-community', 'plugin:prettier/recommended'],
    rules: {
        'prettier/prettier': 'error',
    },
    plugins: ['prettier'],
    parser: 'babel-eslint',
    env: {
        jest: true,
    },
};