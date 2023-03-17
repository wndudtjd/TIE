const express = require('express')
const router = express.Router()
const authmiddleware = require('../middlewares/auth-middleware') 
const { Posts, Users } = require('../models')

// 게시글 전체 조회 API
router.get('/', async (req, res, next) => {
    try {
        const posts = await Posts.findAll({
            raw: true,
            attributes: ['postId', 'title', 'content', 'img', 'createdAt', 'updatedAt', 'User.nickname', 'userId'],
            include: [
                {
                    model: Users,
                    attributes: []
                }
            ],
            order :[['createdAt', 'DESC']],
        })
        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(400).json({ errorMessage: "예상하지 못한 에러가 발생하였습니다." })
        next()
    }
})

// 게시글 삭제 API
router.delete('/:postId', authmiddleware, async (req, res, next) => {
    try {
        const { postId } = req.params
        const user = res.locals.user
        const post = await Posts.findOne({
            where: { postId }
        })
        console.log(user)
        if (!post) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' })
        }
        if (post.userId != user.userId) {
            return res.status(403).json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." })
        }
        
        await Posts.destroy({
            where: { postId, userId: user.userId }
        })
        res.json({ msg: "게시글 삭제 완료" })
    } catch (err) {
        console.log(err)
        res.status(400).json({ errorMessage: "게시글 삭제에 실패하였습니다" })
        next()
    }
})

// 게시글 한개 조회 API
router.get('/:postId', async (req, res, next) => {
    try {
        const { postId } = req.params
        const posts = await Posts.findOne({
            raw: true,
            where: { postId },
            attributes: ['postId', 'title', 'content', 'img', 'createdAt', 'updatedAt', 'User.nickname', 'userId'],
            include: [
                {
                    model: Users,
                    attributes: []
                }
            ]
        })
        if (!posts) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' })
        }
        
        res.json( posts )
    } catch (err) {
        console.log(err)
        res.status(400).json({ errorMessage: "예상하지 못한 에러가 발생하였습니다." })
        next()
    }
})

// 게시글 수정 API
router.patch('/:postId', authmiddleware,async (req, res, next) => {
    try {
        const { postId } = req.params
        const { title, img, content } = req.body
        
        const user = res.locals.user
        const post = await Posts.findOne({ where: { postId } })
        
        if (!post) {
            return res.status(403).json({
                msg : "게시글 수정의 권한이 존재하지 않습니다."
            })
        }
        if (post.userId != user.userId) {
            return res.status(403).json({ errorMessage: "게시글의 수정 권한이 존재하지 않습니다." })
        }
        if (!title || !content) {
            return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." })
        }
        await Posts.update({
            title,
            img,
            content,
        },{where: {postId}})

        res.json({ msg: "게시글 수정 완료" })
    } catch (err) {
        console.log(err)
        res.status(400).json({ errorMessage: "예상하지 못한 에러가 발생하였습니다." })
        next()
    }

})

// 게시글 작성 API
router.post('/', authmiddleware,async (req, res, next) => {
    try {
        const { title, img, content } = req.body
        const user = res.locals.user

        if (!title || !content) {
            return res.status(412).json({ msg: "데이터 형식이 올바르지 않습니다." })
        }
        await Posts.create({
            title,
            nickname: user.nickname,
            img,
            content,
            userId: user.userId
        })
        res.json({ msg: "게시글 작성 완료" })
    } catch (err) {
        console.log(err)
        res.status(400).json({ msg: "예상하지 못한 에러가 발생하였습니다." })
        next()
    }

})

module.exports = router