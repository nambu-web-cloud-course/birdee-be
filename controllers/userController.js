const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || "secret";

const { createHash } = require('../utils/utils');
const { User, Diary, Page } = require('../models');

const registerUser = async (req, res) => {
    const new_user = req.body;
    new_user.password = await createHash(new_user.password, 10);

    try {
        const result = await User.create(new_user);
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const getUserInfo = async (req, res) => {
    const user_id = req.user_id;

    // hiddenDiaries
    const result1 = await User.findOne({
        attributes: ['user_id', 'name', 'email', 'birth', 'allow_random', 'image', 'message', 'created_at'],
        where: { user_id: user_id },
        order: [[{model: Diary}, 'id', 'desc']],
        include: {
            attributes: ['id', 'title', 'color', 'deleted', 'created_at'],
            where: { deleted: 'undeleted' },
            model: Diary,
            through: {
                attributes: ['hidden'],
                where: { hidden: true },
            },
            required: false, // left join을 수행하기 위해 required 속성을 false로 설정
        },
    });
    
    // deletedDiaries
    const result2 = await User.findOne({
        attributes: ['user_id', 'name', 'email', 'birth', 'allow_random', 'created_at'],
        where: { user_id: user_id },
        order: [[{model: Diary}, 'id', 'desc']],
        include: {
            attributes: ['id', 'title', 'color', 'deleted', 'created_at'],
            where: { deleted: 'scheduled' },
            model: Diary,
            required: false, // left join을 수행하기 위해 required 속성을 false로 설정
        },
    });

    // inviteList
    const result3 = await Diary.findAll({
        attributes: ['title', 'created_at', 'owner_id'],
        where: { deleted: 'undeleted' },
        order: [['id', 'desc']],
        include: {
            attributes: ['user_id'],
            where: { user_id: user_id },
            model: User,
            through: {
                attributes: ['status'],
                where: { status: 'pending' },
            },
        },
    });

    const ownerIds = result3.map(diary => diary.owner_id);
    const owners = await User.findAll({
        attributes: ['user_id', 'name'],
        where: { user_id: ownerIds },
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

    const inviteList = result3.map(diary => {
        const owner = owners.find(owner => owner.user_id === diary.owner_id);
        return {
            owner_id: diary.owner_id,
            owner_name: owner ? owner.name : null,
            title: diary.title,
            invite_date: diary.dataValues.created_at,
            status: diary.Users[0].UserHasDiary.status
        }
    })


    const formattedResult = {
        diary_id: result1.id,
        name: result1.name,
        email: result1.email,
        birth: result1.birth,
        image: result1.image,
        message: result1.message,
        allow_random: result1.allow_random,
        pages_count: count,
        create_at: result1.create_at,
        hiddenDiaries: hiddenDiaries,
        deletedDiaries: deletedDiaries,
        inviteList: inviteList
    }

    res.send({ success: true, data: formattedResult});
}

const getDiaryUserInfo = async (req, res) => {
    const user_id = req.params.user_id;
    try {
        const result = await User.findOne(
            {
                attributes: ['user_id', 'name', 'birth', 'image', 'message'],
                where: { user_id: user_id },
            },
                );
        res.send({ success: true, page: result });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
}

const updateUser = async (req, res) => {
    try {
        const { user_id, body, file } = req;
        const update_user = { ...body };

        if (file) {
            const imageUrl = file.url.split('?')[0]; // 만료 날짜 제거
            update_user.image = imageUrl;
        }

        const result = await User.update(update_user, {where: {user_id: user_id}});
        res.send({ success: true, data: result });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const loginUser = async (req, res) => {
    const user = req.body;
    
    options = { 
        attributes: ['password'],
        where: {
            user_id: user.user_id
        }
    }; 

    try {
        const result = await User.findOne(options);
        if (result) {
            const compared = await bcrypt.compare(user.password, result.password);
            console.log(`${user.password} : ${result.password}, ${compared} `)
            if (compared) {
                const token = jwt.sign({ uid: user.user_id, rol: 'user'}, secret, {});
                res.send({ success: true, user_id: user.user_id, token: token });
            } else { // 비밀번호가 틀렸을 경우
                res.send({ "success": false, message: "incorrect password" });
            }
        } else {
            res.send({ "success": false, message: `not registered username: ${user.user_id}` });
        }
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
}

const deleteUser = async (req, res) => {
    const user_id = req.user_id;
    const result = await User.destroy({where: {user_id: user_id}});
    res.send({ success: true, data: result});
}

// 회원가입 시 아이디 중복체크, 일기장 생성 시 user 체크용
const checkUserId = async (req, res) => {
    const login_id = req.user_id; // token이 있을 경우
    const user_id = req.body.user_id;
    try {
        if (login_id === user_id) {
            res.send({ success: false, message: "본인을 초대할 수 없습니다." });
        }
        else {
            const result = await User.findOne({
                where: { user_id: user_id },
            });
            console.log(result);
            if (result)
                res.status(201).send({ success: true, result: "존재하는 ID입니다." });
            else
                res.send({ success: false, message: "존재하지 않는 ID입니다." });
        }
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }

}

const checkPassword = async (req, res) => {
    const user = req.body;
    
    options = { 
        attributes: ['password'],
        where: {
            user_id: req.user_id
        }
    }; 

    try {
        const result = await User.findOne(options);
        console.log(result);
        if (result) {
            const compared = await bcrypt.compare(user.password, result.password);
            console.log(`${user.password} : ${result.password}, ${compared} `)
            if (compared) {
                res.send({ "success": true, message: "비밀번호가 일치합니다." });
            } else { // 비밀번호가 틀렸을 경우
                res.send({ success: false, message: "비밀번호가 일치하지 않습니다." });
            }
        }
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
}

const updatePassword = async (req, res) => {
    const user_id = req.user_id;
    const update_user = req.body;
    update_user.password = await createHash(update_user.password, 10);
    try {
        const result = await User.update(update_user, {where: {user_id: user_id}});
        res.send({ success: true, data: result });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};


module.exports = {
    registerUser,
    getUserInfo,
    updateUser,
    loginUser,
    deleteUser,
    checkUserId,
    checkPassword,
    updatePassword,
    getDiaryUserInfo
};