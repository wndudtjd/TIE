const express = require('express');
const router = express.Router();
const { Comments, Users } = require("../models");
const authMiddleware = require("../middlewares/auth-middleware.js");

// 댓글 생성 API (완료)
router.post('/:postId/comments', authMiddleware, async(req, res) => {
    try {
        const { postId } = req.params;
        const { comment } = req.body;
        const { userId } = res.locals.user;

        // 게시글 미존재
        if (!postId) {
            res.status(404).json({
                errorMessage: "게시글이 존재하지 않습니다"
            });
            return;
        }
        // 댓글 미입력
        if (!comment) {
            res.status(412).json({
                errorMessage: "댓글 내용의 형식이 일치하지 않습니다."
            });
            return;
        }

        // 댓글 생성
        await Comments.create({
            postId: postId,
            userId: userId,
            comment : comment,
        });

        res.status(201).json({ message: "댓글 작성에 성공하였습니다." });

    } catch(err) {
        console.log(err);
        res.status(400).json({
            errorMessage: "댓글 작성에 실패했습니다."
        });
        return;
    }
});

// 댓글 조회 API (완료)
router.get('/:postId/comments', async(req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comments.findAll({
            attributes: ["commentId", "userId", "comment", "createdAt", "updatedAt", "User.nickname"],
            include: [
                {
                    model: Users,
                    attributes: [],
                },
            ],
            where : [{ postId: postId }], 
            order: [['createdAt', 'DESC']],
            raw: true,
        })

        res.status(200).json({ comments : comments });

    } catch(err) {
        console.log(err);
        res.status(400).json({
            errorMessage: "게시글 조회에 실패했습니다."
        });
        return;
    }
});

// 댓글 삭제 API
router.delete("/:postId/comments/:commentId", authMiddleware, async(req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { userId } = res.locals.user; // 토큰을 검사하여, 유효한 토큰일 경우에만 댓글 삭제 가능
        // 댓글을 조회합니다.
        const existComment = await Comments.findOne({ where: { commentId } });
        // 게시글이 존재하지 않는 경우
        if (!postId) {
            res.status(404).json({
                errorMessage: "게시글이 존재하지 않습니다."
            });
            return;
        }
        // 댓글이 존재하지 않는 경우
        if (!existComment) {
            res.status(404).json({
                errorMessage: "댓글이 존재하지 않습니다."
            });
            return;
        }
        // 로그인한 회원의 유저 아이디와 댓글 작성한 회원 아이디가 다른 경우
        if (existComment.userId !== userId)  {
            res.status(403).json({
                errorMessage: "댓글 삭제의 권한이 존재하지 않습니다."
            });
            return;
        }
        // 댓글의 권한을 확인하고, 댓글을 삭제합니다.
        await Comments.destroy(
            { where: { commentId, userId: userId } }
        );
        // 게시글 삭제
        if (existComment) {
            res.status(200).json({ message: "댓글을 삭제하였습니다." });
            return;
        } else {
            res.status(401).json({ errorMessage: "댓글이 정상적으로 삭제되지 않았습니다." });
            return;
        }
    } catch(err) {
        res.status(400).json({
            errorMessage: "댓글 삭제에 실패했습니다."
        });
        return;
    }
});


module.exports = router