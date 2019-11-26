var fs = require('fs');
var mime = require('mime');
var Videos = require('../models/videos');

//configura os tipos de video que serão aceitos
var VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/ogv'];

//metodo para listar os videos
exports.listVideos = function(req, res) {

    Videos.find().sort('-created').populate('user', 'local.email').exec(function(error, videos) {
        if (error) {
            return res.status(400).send({
                message: error
            });
        }

        console.log(videos);
        res.render('videos', {
            title: 'Videos Page',
            videos: videos
        });
    });
};

//metodo para inserir os videos
exports.uploadVideo = function(req, res) {
    var src;
    var dest;
    var targetPath;

    console.log(req);
    //caminho de onde o arquivo vem
    var tempPath = req.file.path;
    //saber o tipo de arquivo que esta sendo enviado
    var type = mime.lookup(req.file.mimetype);

    //validar se o tipo é válido de acordo com o que setamos
    if (VIDEO_TYPES.indexOf(type) == -1) {
        return res.status(415).send('Supported video formats: mp4, webm, ogg, ogv');
    }

    //local onde serão armazenados os vídeos
    targetPath = './public/videos/' + req.file.originalname;
    
    //ler arquivo a partir de sua fonte
    src = fs.createReadStream(tempPath);
    //escrever o arquivo na sua pasta de destino
    dest = fs.createWriteStream(targetPath);
    //ler os dados quando ficam disponíveis na fonte (src) e escrever em outro lugar (dest)
    src.pipe(dest);

    //tratamento de erro
    src.on('error', function(error) {
        if (error) {
            return res.status(500).send({
                message: error
            });
        }
    });

    //instanciar novo video
    src.on('end', function() {
        var video = new Videos(req.body);
        video.videoName = req.file.originalname;
        //vincular um usuario com o upload desse video
        video.user = req.user;

        video.save(function(error) {
            if (error) {
                return res.status(400).send({
                    message: error
                });
            }
        });

        fs.unlink(tempPath, function(err) {
            if (err) {
                return res.status(500).send({
                    message: error
                });
            }
            //exibir a lista de videos com o novo video incluso
            res.redirect('videos');

        });
    });
};

//metodo para buscar um video pelo nome
exports.findVideo = function(req, res) {

    Videos.find({title: req.query.name}).sort('-created').populate('user', 'local.email').exec(function(error, videos) {
        if (error) {
            return res.status(400).send({
                message: error
            });
        }else{
            console.log(videos);
            console.log(req.query.title);
            res.render('videos', {
                title: 'Videos Page',
                videos: videos
            });
        }
    });
};

//verificar se usuario esta logado 
exports.hasAuthorization = function(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
};
