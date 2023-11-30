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

// user_id 확인
router.post('/check-user', userController.checkUserId);

// 비밀번호 확인
router.post('/check-password', isAuth, userController.checkPassword);


module.exports = router;