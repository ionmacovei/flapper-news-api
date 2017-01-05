/**
 * Created by imacovei on 1/2/2017.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
require('../app/models/model-comments');
require('../app/models/model-posts');
var Post = mongoose.model('Post');
var jwt = require('express-jwt');
var Comment = mongoose.model('Comment');
var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
router.param('post', function(req, res, next, id) {
    var query = Post.findById(id);

    query.exec(function (err, post){
        if (err) { return next(err); }
        if (!post) {

            return next(new Error('can\'t find post'));
        }

        req.post = post;
        return next();
        console.log(req.post);
    });
});
router.param('com', function(req, res, next, id) {
    var query = Comment.findById(id);

    query.exec(function (err, comment){
        if (err) { return next(err); }
        if (!comment) {

            return next(new Error('can\'t find post'));
        }

        req.comment = comment;
        return next();
        console.log(req.post);
    });
});
/*router.get('/:post', function(req, res) {
    res.json(req.post);
});*/
router.get('/', function(req, res, next) {
    Post.find(function(err, posts){
        if(err){ return next(err); }

        res.json(posts);
    });
});
router.post('/:post/comments',auth, function(req, res, next) {
    var comment = new Comment(req.body);
    comment.post = req.post;
    comment.author = req.payload.username;
    comment.save(function(err, comment){
        if(err){ return next(err); }

        req.post.comments.push(comment);
        req.post.save(function(err, post) {
            if(err){ return next(err); }

            res.json(comment);
        });
    });
});
router.get('/:post', function(req, res, next) {
    req.post.populate('comments', function(err, post) {
        if (err) { return next(err); }

        res.json(post);
    });
});

router.post('/',auth, function(req, res, next) {
    var post = new Post(req.body);
    post.author = req.payload.username;
    post.save(function(err, post){
        if(err){ return next(err); }

        res.json(post);
    });
});
router.put('/:post/comments/:com/upvote',auth, function(req, res, next) {
    req.comment.upvote(function(err, comment){
        if (err) { return next(err); }

        res.json(comment);
    });
});
router.put('/:post/upvote',auth, function(req, res, next) {
    req.post.upvote(function(err, post){
        if (err) { return next(err); }

        res.json(post);
    });
});



module.exports = router;