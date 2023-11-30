const express = require('express');
const router = express.Router();
const isAuth = require('../utils/authorization');
const categoryController = require('../controllers/categoryController');

// 카테고리 생성
router.post('/', isAuth, categoryController.createCategory);

// 카테고리 이름 수정
router.put('/:category_id', isAuth, categoryController.updateCategoryName);

// 카테고리 리스트 조회
router.get('/', isAuth, categoryController.getCategoryList);

// 카테고리 삭제
router.delete('/:category_id', isAuth, categoryController.deleteCategory);


// 카테고리에 다이어리 추가
router.put('/:category_id/diaries', isAuth, categoryController.addDiaryToCategory)

module.exports = router;