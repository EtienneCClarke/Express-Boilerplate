// posts.js - Posts route module

const express = require('express');
const router = express.Router();
const { protectedRoute } = require('../middleware/protectedRoute')

posts = [
    {
        name: "etienne",
        title: "post 1"
    },
    {
        name: "joe",
        title: "post 2"
    }
]

router.get('/all', protectedRoute, (req, res) => {
    return res.json(posts);
})

module.exports = router;