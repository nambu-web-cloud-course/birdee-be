const express = require('express');
const router = express.Router();
const isAuth = require('../utils/authorization');
const dotenv = require('dotenv');
const Sequelize = require("sequelize");

dotenv.config();
const { Category, Diary, UserHasDiary } = require('../models');

// 카테고리 생성
router.post('/', isAuth, async (req, res) => {
    const new_category = req.body;
    new_category.user_id = req.user_id;

    try {
        const result = await Category.create(new_category);
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }

});

// 카테고리 이름 수정
router.put('/:category_id', isAuth, async (req, res) => {
    const update_category = req.body;
    update_category.user_id = req.user_id;
    const category_id = req.params.category_id;

    try {
        const result = await Category.update(update_category, {where: { id: category_id}});
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }

});

// 카테고리 리스트 조회
router.get('/', isAuth, async (req, res) => {
    const user_id = req.user_id;
    try {
        const result = await Category.findAll({
            attributes: ['id', 'cname'],
            where: { user_id: user_id },
        });
        res.send({ success: true, category: result });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
});

// 카테고리 삭제
router.delete('/:category_id', isAuth, async (req, res) => {
    const category_id = req.params.category_id;

    try {
        const result = await Category.destroy({where: { id: category_id, user_id: req.user_id}});
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }
});


// 카테고리에 다이어리 추가
router.put('/:category_id/diaries', isAuth, async (req, res) => {
    const user_id = req.user_id;
    const category_id = req.params.category_id;
    const diary_id = req.body.diary_id;

    try {
        const result = await UserHasDiary.update({ category_id: category_id }, {
            where: { user_id: user_id, diary_id: diary_id }
        });
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }
})

module.exports = router;