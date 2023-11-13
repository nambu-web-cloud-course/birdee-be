const express = require('express');
const router = express.Router();
const isAuth = require('./authorization');


// model
const { User, Diary, UserHasDiary } = require('../models'); // /models/index.js { User, Post }-> db

// 일기장 목록 조회
router.get('/', async (req, res) => {
    const diaries = await Diary.findAll({
        attributes: ['id', 'title', 'color', 'deleted', 'is_editable', 'is_deletable', 'created_at'],
        order: [['id', 'desc']]
    });

    // 삭제되지 않은 일기장만 조회
    const filtered = diaries.filter((diary) => diary.deleted === false);
    res.send({ success: true, data: filtered});
});

// 일기장 생성
router.post('/', isAuth, async (req, res) => {
    const new_diary = req.body;
    try {
        new_diary.user_id = req.user_id; // token의 user_id
        const user = await User.findOne({
            where: { user_id: new_diary.user_id }
        })
        // console.log
        const diary = await Diary.create(new_diary);
        await user.addDiary(diary);
        res.send({ success: true, data: new_diary });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
});

// 일기장 숨기기

// 일기장 삭제
router.delete('/:id', async (req, res) => {
    const diary_id = req.params.id;
    const result = await Diary.update(req.body, {where: {id: diary_id}});
    res.send({ success: true, data: result});
});

module.exports = router;