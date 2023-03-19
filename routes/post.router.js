const express = require('express')
const router = express.Router()
const authmiddleware = require('../middlewares/auth-middleware')
const { Posts, Users } = require('../models')
const fs = require('fs').promises
// 날짜 변환 모듈
const dayjs = require('dayjs')
const d = dayjs()
// multer 모듈
const multer = require('multer')
// path 모듈 불러오기
const path = require('path')
const { emitWarning } = require('process')

// 디스크 스토리지 엔진 설정
const storage = multer.diskStorage({
    // 업로드된 파일이 저장될 경로 지정
    destination: function (req, file, cb) {
        // 오류가 없을때 'public/images/' 경로에 파일을 저장하도록 설정
        cb(null, 'public/images/')
    },
    // 업로드된 파일의 이름 지정
    filename: (req, file, cb)=> {
        // 업로드된 파일의 확장자 추출
        const ext = path.extname(file.originalname)
        const name = path.basename(file.originalname, ext).replace(/\s+/g, '') // 파일 이름에서 공백 제거
        const timestamp = Date.now()
        const filename = `${name}-${timestamp}${ext}`
        // 업로드된 파일의 이름에서 확장자를 제외한 부분과 현재 시간을 조합하여 새로운 파일 이름 생성
        cb(null, filename) // 에러가 없으면 최종적으로 사용될 filename 을 multer 에 알림
        // cb는 multer 에서 사용하는 콜백
        // cb(null, name + '-' + d.format('YY-MM-DD-HH-mm-ss') + ext)
    },
})

const imageFilter = (req, file, cb)=> {
    // 이미지 파일인지 체크
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        // 이미지 파일이 아닌경우 파일을 업로드 하지 않음
        req.err = {errorMessage : "이미지 파일만 업로드 가능 합니다."}
        return cb(null, false)

        // cb(null, false);
    }
    cb(null, true); // 에러가 없으면 업로드 될수 있음. (이미지 파일인경우 업로드)
};

// 설정한 스토리지 엔진을 사용하여 Multer 미들웨어를 생성
const upload = multer({
    storage: storage,
    fileFilter: imageFilter
})


// 게시글 전체 조회 API
router.get('/', async (req, res, next) => {
    try {
        const posts = await Posts.findAll({
            raw: true,
            attributes: ['postId', 'title', 'content', 'createdAt', 'img', 'User.nickname', 'userId'],
            include: [
                {
                    model: Users,
                    attributes: []
                }
            ],
            order: [['createdAt', 'DESC']],
        })
        res.json(posts)
    } catch (err) {
        console.log(err)
        res.status(400).json({ errorMessage: "예상하지 못한 에러가 발생하였습니다." })
        next()
    }
})

// 게시글 한개 조회 API
router.get('/:postId', async (req, res, next) => {
    try {
        const { postId } = req.params
        const post = await Posts.findOne({
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
        if (!post) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' })
        }
        const isUpdate = post.createdAt.toLocaleString() == post.updatedAt.toLocaleString() ? false : true

        res.status(200).json({ post, isUpdate })
    } catch (err) {
        console.log(err)
        res.status(400).json({ errorMessage: "예상하지 못한 에러가 발생하였습니다." })
        next()
    }
})

// 게시글 작성 API
router.post('/', authmiddleware, upload.single('img'), async (req, res, next) => {
    try {
        if(req.err){
            return res.status(400).json(req.err)
        }
        console.log('req.file', req.file)
        const { title, content } = req.body
        const user = res.locals.user

        if (!title || !content) {
            return res.status(412).json({ msg: "데이터 형식이 올바르지 않습니다." })
        }

        // 이미지가 있으면 파일경로, 없으면 false 반환
        const img = !req.file ? 'false' : `/images/${req.file.filename}`

        let post = await Posts.create({
            title,
            nickname: user.nickname,
            img: img,
            content,
            userId: user.userId
        })

        post = post.toJSON()

        // Date 객체를 현제 시스템 로케일로
        const isUpdate = post.createdAt.toLocaleString() == post.updatedAt.toLocaleString() ? false : true
        console.log(isUpdate)
        res.json({ msg: "게시글 작성 완료", post, isUpdate })
    } catch (err) {
        console.log(err)
        if (err instanceof multer.MulterError) {
            res.status(400).json({ errorMessage: "이미지 파일만 업로드 할 수 있습니다." })
        } else {
            res.status(400).json({ errorMessage: "게시글 작성에 실패하였습니다." })
        }
        console.log("next()")
        next(err)
    }

})

// 게시글 수정 API
router.patch('/:postId',
    authmiddleware,
    async (req, res, next) => {
        const { postId } = req.params
        const { userId } = res.locals.user
        const existPost = await Posts.findOne({ where: { postId } })
        existPost.userId == userId ? next() : res.status(403).json({ errorMessage: "게시글의 수정 권한이 존재하지 않습니다." })
    }
    , upload.single('img'), async (req, res, next) => {
        try {
            const { postId } = req.params
            const { title, content } = req.body
            const existPost = await Posts.findOne({ where: { postId } })

            if (!existPost) {
                return res.status(403).json({
                    errorMessage: "게시글이 존재하지 않습니다."
                })
            }
            if (!title || !content) {
                return res.status(412).json({ errorMessage: "데이터 형식이 올바르지 않습니다." })
            }
            console.log('req.file 입니당ㅇㅇ', req.file, Boolean(req.file))
            let img = !req.file ? 'false' : `/images/${req.file.filename}`

            console.log('원래 이미지', existPost.img)

            // 수정전 게시글에 사진이 있었는데 수정시 사진데이터를 수정하지 않았을때 기존 사진이 그대로 있게,
            // 수정전 게시글에 사진이 있었고 새로운 이미지도 들어왔다면 기존 사진 삭제
            // 수정할때 사진을 삭제하는 로직은고민중
            if (existPost.img !== 'false' && img == 'false') {
                img = existPost.img
            } else if (existPost.img !== 'false') {
                await fs.unlink(`public${existPost.img}`)
            }
            await Posts.update({
                title,
                img,
                content,
            }, {
                where: { postId },
                // returning: true
            })

            // 업로드 하고 삭제를 해야 되는데... 원래 경로를 어케 가져오지요!
            // 그리고 이미지가 없으면 원래 이미지를 그대로 써야 할까요 아님 없애는게 맞을까요..?
            // 이미지가 안들어왔던 게시물일때 수정시 이미지를 넣으면 어떻게 되는지. 
            // 프론트 화면에서 이미지를 교체하지 않을시 원래 있던 이미지를 보내줄수 있는지
            // 결론. 삭제해 줄 필요 없다  
            // 만약 이름이 똑같으면? 

            const post = await Posts.findOne({
                raw: true,
                where: { postId }
            })
            console.log('수정 이미지', post.img)
            const isUpdate = post.createdAt.toLocaleString() == post.updatedAt.toLocaleString() ? false : true

            res.json({ msg: "게시글 수정 완료", post, isUpdate })
        } catch (err) {
            console.log(err)
            res.status(400).json({ errorMessage: "게시글 수정에 실패하였습니다.." })
            next()
        }

    })

// 게시글 삭제 API
router.delete('/:postId', authmiddleware, async (req, res, next) => {
    try {
        const { postId } = req.params
        const user = res.locals.user
        const existPost = await Posts.findOne({
            where: { postId }
        })
        console.log(user)
        if (!existPost) {
            return res.status(404).json({ errorMessage: '게시글이 존재하지 않습니다.' })
        }
        if (existPost.userId != user.userId) {
            return res.status(403).json({ errorMessage: "게시글의 삭제 권한이 존재하지 않습니다." })
        }
        if (existPost.img !== 'false') {
            await fs.unlink(`public${existPost.img}`)
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

module.exports = router