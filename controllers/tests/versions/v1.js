module.exports.create = async (req, res) => {
     return res.send({msg: 'create test', user: res.token.user});
}