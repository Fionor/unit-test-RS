const mongoose = require('mongoose');
const Photos = mongoose.model('photos');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const stream = require('stream');

// GET
module.exports.get = async (req, res) => {
    const photo = await Photos.findOne({_id: req.query.photo_id}).exec();
    if(photo == void(0)) return res.sendStatus(400);
    return res.sendFile(path.join(__dirname, '..', '..', '..', photo.src));
}

// POST
module.exports.create = async (req, res) => {
    try {
        const file = req.files.photo[0];
        const hash = crypto.createHash('md5');
        const read_stream = new stream.PassThrough();
        read_stream.end(new Buffer(file.buffer));
        hash.setEncoding('hex');
        read_stream.on('end', async function() {
            hash.end();
            const md5_hash = hash.read();
            const hash_photo = await Photos.findOne({md5_hash}).exec();
            if( hash_photo != void(0) ){
                return res.send({status: 200, response: [{photo_id: hash_photo._id}]});
            } else {
                const new_file_name = crypto.randomBytes(20).toString('hex') + 
                    '.' + 
                    file.originalname.match(/\.([a-zA-Z]+)$/)[1];
                const src = `/resource_files/${new_file_name}`;
                fs.writeFile(path.join(__dirname, '..', '..', '..', src), file.buffer, async (err) => {
                    if(err) return res.send({status: 500, error: {error_msg: err}});
                    const photo = await Photos.create({src: src, md5_hash});
                    return res.send({status: 200, response: [{photo_id: photo._id}]});
                })
            }
        });
        read_stream.pipe(hash);
        
    } catch (error) {
        console.log('photos.create', error);
        res.send({status: 500, error: {error_msg: error}});
    }
}