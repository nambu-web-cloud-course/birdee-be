const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || "secret";
const isAuth = require('./authorization');

const { User, Diary, Page } = require('../models');

const create_hash = (async (password, saltAround) => {
    let hashed = bcrypt.hashSync(password, saltAround);
    console.log(`${password} : ${hashed}`);
    return hashed;
});

// 회원 가입
router.post('/member', async (req, res) => {
    const new_user = req.body;
    new_user.password = await create_hash(new_user.password, 10);

    try {
        const result = await User.create(new_user);
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }

});

// 회원 정보 조회
router.get('/member', isAuth, async (req, res) => {
    const user_id = req.user_id;
    const result1 = await User.findOne({
        attributes: ['user_id', 'name', 'email', 'birth', 'allow_random', 'created_at'],
        where: { user_id: user_id },
        order: [[{model: Diary}, 'id', 'desc']],
        include: {
            attributes: ['id', 'title', 'color', 'deleted', 'created_at'],
            where: { deleted: false },
            model: Diary,
            through: {
                attributes: ['hidden'],
                where: { hidden: true },
            },
            required: false, // left join을 수행하기 위해 required 속성을 false로 설정
        },
    });
    const result2 = await User.findOne({
        attributes: ['user_id', 'name', 'email', 'birth', 'allow_random', 'created_at'],
        where: { user_id: user_id },
        order: [[{model: Diary}, 'id', 'desc']],
        include: {
            attributes: ['id', 'title', 'color', 'deleted', 'created_at'],
            where: { deleted: true },
            model: Diary,
            required: false, // left join을 수행하기 위해 required 속성을 false로 설정
        },
    });

    const { count } = await Page.findAndCountAll({where: { user_id: user_id }});
    
    const hiddenDiaries = result1.Diaries.map(diary => {
        return {
            id: diary.id,
            title: diary.title,
            color: diary.color,
            created_at: diary.created_at,
            hidden: diary.UserHasDiary.hidden
        }
    })

    const deletedDiaries = result2.Diaries.map(diary => {
        return {
            id: diary.id,
            title: diary.title,
            color: diary.color,
            created_at: diary.created_at,
            deleted: diary.deleted
        }
    })

    const formattedResult = {
        diary_id: result1.id,
        name: result1.name,
        birth: result1.birth,
        allow_random: result1.allow_random,
        pages_count: count,
        create_at: result1.create_at,
        hiddenDiaries: hiddenDiaries,
        deletedDiaries: deletedDiaries
    }

    res.send({ success: true, data: formattedResult});
});

// 로그인
router.post('/login', async (req, res) => {
    const user = req.body;
    
    options = { 
        attributes: ['password'],
        where: {
            user_id: user.user_id
        }
    }; 

    try {
        const result = await User.findOne(options);
        console.log(result);
        if (result) {
            const compared = await bcrypt.compare(user.password, result.password);
            console.log(`${user.password} : ${result.password}, ${compared} `)
            if (compared) {
                const token = jwt.sign({ uid: user.user_id, rol: 'user'}, secret, {});
                res.send({ success: true, user_id: user.user_id, token: token });
            } else { // 비밀번호가 틀렸을 경우
                res.status(400).send({ "success": false, message: "incorrect password" });
            }
        } else {
            res.status(400).send({ "success": false, message: `not registered username: ${user.user_id}` });
        }
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
});

// 회원 정보 수정
router.put('/member', isAuth, async (req, res) => {
    const user_id = req.user_id;
    const update_user = req.body;
    const result = await User.update(update_user, {where: {user_id: user_id}});
    res.send({ success: true, data: result});
});

// 회원 탈퇴
router.delete('/member', isAuth, async (req, res) => {
    const user_id = req.user_id;
    const result = await User.destroy({where: {user_id: user_id}});
    res.send({ success: true, data: result});
});

module.exports = router;