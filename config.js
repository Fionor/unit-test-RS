module.exports = {
    admin_permissions: {
        ACCESS_VERIFICATION_PASSWORD: 1,
        ACCESS_VERIFICATION_ACCOUNT: 2,
        ACCESS_CREATE_GROUPS: 4,
        ACCESS_DELETE_ACCOUNTS: 8,
        ACCESS_ADMIN: 16
    },
    resourse_server: {
        port: 3000,
        db_uri: 'mongodb://localhost:27017/unit-test-rs'
    }
}

/*--------------------
ACCESS_VERIFICATION_PASSWORD - змога підтверджувати зміну паролю
ACCESS_VERIFICATION_ACCOUNT - змога підтверджувати аккаунт
ACCESS_CREATE_GROUPS - змога створювати групи
ACCESS_DELETE_ACCOUNTS - змога видаляти акаунти
ACCESS_ADMIN - змога встановлювати доступи
--------------------*/