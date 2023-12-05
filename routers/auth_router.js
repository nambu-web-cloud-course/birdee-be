const express = require('express');
const router = express.Router();

// middleware
const isAuth = require('../utils/authorization');
const upload = require('../utils/uploadImage');

const userController = require('../controllers/userController');


// 회원 가입
router.post('/member', userController.registerUser);

// 회원 정보 조회
router.get('/member', isAuth, userController.getUserInfo);

// 로그인
router.post('/login', userController.loginUser);

// 회원 정보 수정
router.put('/member', isAuth, upload.single('profileImg'), userController.updateUser);


// 회원 탈퇴
router.delete('/member', isAuth, userController.deleteUser);

// 아이디 중복 체크
router.post('/check-user-id', userController.checkUserId);

// 일기장 생성 시 user 체크
router.post('/check-user', isAuth, userController.checkUserId);

// 비밀번호 확인
router.post('/check-password', isAuth, userController.checkPassword);

// 비밀번호 확인
router.put('/member/password', isAuth, userController.updatePassword);


module.exports = router;