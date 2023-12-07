const express = require('express');
const router = express.Router({mergeParams: true});
const isAuth = require('../utils/authorization');
const diaryController = require('../controllers/diaryController');


// 일기장 목록 조회
router.get('/', isAuth, diaryController.getDiaries);

// 일기장 생성
router.post('/', isAuth, diaryController.createDiary);

// 일기장 초대 수락하기
router.post('/invite', isAuth, diaryController.acceptInvite);

// 일기장 숨기기/숨김해제
router.put('/:id', isAuth, diaryController.toggleDiaryVisibility);

// 일기장 삭제
router.delete('/:id', diaryController.deleteDiary);

module.exports = router;