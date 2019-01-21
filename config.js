
/* Конфигурация для авторизации */

function ExtractJwt (req) {
    let token = null;
    if(req.cookies && req.cookies.token != void(0)) token = req.cookies['token'];
    return token;
}

module.exports = {
    jwt: {
        jwtFromRequest: ExtractJwt,
        secretOrKey: 'Vmw5fuo42hMbCkOV4Uc9'
    },

    expiresIn: '1 day'
};