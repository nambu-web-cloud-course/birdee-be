const express = require('express');
const router = express.Router();
const isAuth = require('./authorization');

// model
const { User, Diary, UserHasDiary, Page } = require('../models');

// 일기장 목록 조회
router.get('/', isAuth, async (req, res) => {

    const diaries = await User.findOne({
        attributes: ['user_id', 'name'],
        where: { user_id: req.user_id },
        order: [[{model: Diary}, 'id', 'desc']],
        include: {
            attributes: ['id', 'title', 'color', 'deleted', 'created_at'],
            where: { deleted: false },
            model: Diary,
            through: {
              attributes: ['hidden'],
              where: { hidden: false }
            }
        },
        // raw: true
    });
    
    // console.log("result: " + result.data);
    // result = diaries.map(el => el.get({ plain: true }));

    // 삭제되지 않은 일기장만 조회
    // const filtered = diaries.filter((diary) => diary.deleted === false);
    res.send({ success: true, data: diaries});
});

// 일기장 생성
router.post('/', isAuth, async (req, res) => {
    const new_diary = req.body;
    try {
        new_diary.user_id = req.user_id; // token의 user_id
        const user = await User.findOne({
            where: { user_id: new_diary.user_id }
        })
        const diary = await Diary.create(new_diary);
        await user.addDiary(diary);
        res.send({ success: true, data: new_diary });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
});

// 일기장 숨기기
router.put('/:id', async (req, res) => {
    const diary_id = req.params.id;
    const result = await UserHasDiary.update({
        "hidden": true
    }, {where: {diary_id: diary_id}});
    res.send({ success: true, data: result});
});

// 일기장 삭제
router.delete('/:id', async (req, res) => {
    const diary_id = req.params.id;
    const result = await Diary.update({
        "deleted": true
    }, {where: {id: diary_id}});
    res.send({ success: true, data: result});
});

// 일기 페이지 목록 조회
router.get('/:diary_id/pages', async (req, res) => {
    const diary_id = req.params.diary_id;
    
    const result = await Diary.findAll({
        attributes: ['id', 'title', 'color', 'is_editable', 'is_deletable'],
        where: { id: diary_id },
        order: [[{model: Page}, 'created_at', 'desc']],
        include: [{
            attributes: ['id', 'subject', 'contents', 'created_at'],
            model: Page,
            include: [{
                attributes: ['user_id', 'name'],
                model: User
            }]
        },
        ],
    });
    
    const pages = result.map(diary => {
        return {
            page_id: diary.Page.id,
            subject: diary.Page.subject,
            contents: diary.Page.contents,
            created_at: diary.Page.created_at,
            user_id: diary.Page.User.user_id,
            name: diary.Page.User.name,
        }
    })
    
    const formattedResult = {
        diary_id: result[0].id,
        title: result[0].title,
        color: result[0].color,
        is_editable: result[0].is_editable,
		is_deletable: result[0].is_deletable,
        pages: pages
    }
      
    res.send({ success: true, data: formattedResult});
});

// 일기 페이지 생성
router.post('/:diary_id/pages', isAuth, async (req, res) => {
    const new_page = req.body;
    try {
        new_page.user_id = req.user_id; // token의 user_id
        new_page.diary_id = req.params.diary_id;
        console.log(req.params.diary_id);
        const result = await Page.create(new_page);
        res.send({ success: true, data: result });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
});

// 일기 페이지 수정
router.put('/:diary_id/pages/:page_id', async (req, res) => {
    // const diary_id = req.params.diary_id;
    const page_id = req.params.page_id;
    const update_page = req.body;
    const result = await Page.update(update_page, {where: {id: page_id}});
    res.send({ success: true, data: result});
});

module.exports = router;