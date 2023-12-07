const express = require('express');
const router = express.Router({mergeParams: true} ); // 부모 라우터에서 자식 라우터로 req.params 넘겨주기
const isAuth = require('../utils/authorization');
const dotenv = require('dotenv');
dotenv.config();
const pageController = require('../controllers/pageController');

// model
const { User, Diary, Page, sequelize } = require('../models');

// 일기 페이지 목록 조회
router.get('/', pageController.getPageList);

// 일기 페이지 조회
router.get('/:page_id', pageController.getPage);

// 일기 페이지 생성
router.post('/', isAuth, pageController.createPage);

// 일기 페이지 수정
router.put('/:page_id', isAuth, pageController.updatePage);

// 일기 페이지 삭제
router.delete('/:page_id', isAuth, pageController.deletePage);

module.exports = router;