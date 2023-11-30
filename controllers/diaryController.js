const { Op } = require('sequelize'); 
const jwt = require('jsonwebtoken');
const Sequelize = require('sequelize');
const dotenv = require('dotenv');

const { User, Diary, UserHasDiary, sequelize } = require('../models');
const sendInviteMail = require('../utils/sendInviteMail')

dotenv.config();
const secret = process.env.JWT_SECRET || "secret";
const PAGE_SIZE = 3;


const getDiaries = async (req, res) => {
    const lastId = req.query.lastId || null; // 클라이언트에서 전달한 마지막 일기장의 ID
    const firstId = req.query.firstId || null; // 클라이언트에서 전달한 첫번째 일기장의 ID
    console.log(`lastId ${lastId}`);
    console.log(`firstId ${firstId}`);

    try {
        const whereClauseDiary = {
            deleted: 'undeleted',
        };

        const whereClauseUhd = { 
            // user_id: req.user_id,
            hidden: false,
            status: 'accept',
        };

        if (lastId) {
            whereClauseDiary.id = { [Op.lt]: lastId }; // lastId 이전의 일기장만 가져오기
        }
        if (firstId) {
            whereClauseDiary.id = { [Op.gt]: firstId }; // firstId 이후의 일기장만 가져오기
        }

        const orderDirection = firstId ? 'asc' : 'desc'; // 다음 페이지로 가거나 첫 페이지라면 DESC, 이전의 페이지는 ASC

        // 카테고리별 조회
        const category_id = req.params.category_id;
        if (category_id) {
            whereClauseUhd.category_id = category_id;
        }

        const result = await Diary.findAll({
            attributes: ['id', 'title', 'color', 'deleted', 'created_at'],
            where: whereClauseDiary,
            include: {
                attributes: ['user_id', 'name'],
                model: User,
                where: { user_id: req.user_id, },
                through: {
                    attributes: ['hidden', 'status', 'category_id', 'user_id'],
                    where: whereClauseUhd
                },
            },
            limit: PAGE_SIZE,
            order: [['id', orderDirection]],
            subQuery: false
        });

        if (result.length !== 0) {
            let diaries = result.map(diary => {
                return {
                    id: diary.id,
                    title: diary.title,
                    color: diary.color,
                }
            })

            if (diaries){ 
                if (orderDirection === 'asc') {
                    diaries = diaries.reverse(); // 내림차순 정렬
                }

                const formattedResult = {
                    category_id: category_id,
                    Diaries : diaries
                }
                res.send({ success: true, result: formattedResult});
            }
        } else { // 카테고리별 조회이면서, 아직 카테고리에 일기장이 추가되지 않은 경우
            if (category_id) {
                const formattedResult = {
                    category_id: category_id,
                    Diaries : []
                }
                res.send({ success: true, result: formattedResult});
            }
        }
     
    } catch (error) {   
        res.status(500).send({ success: false, error: error.message });
    }
}

const createDiary = async (req, res) => {
    const user_id = req.user_id; // token의 user_id
    const new_diary = req.body;
    new_diary.owner_id = user_id;
    

    try {
        // 최초 생성자 user 정보 찾기
        const user = await User.findOne({
            where: { user_id: user_id }
        })
        const diary = await Diary.create(new_diary);

        // 최초 생성자는 accept
        await user.addDiary(diary, {
            through: { status: 'accept', accept_date: new Date() }
        });

        let inviteUsersInfo = [];

        // 랜덤 일기일 경우: 랜덤을 허용하면서 최초 생성자가 아닌 user를 랜덤으로 선택
        console.log(`new_diary.is_random: ${new_diary.is_random}`);
        if (new_diary.is_random === true) {
            const randomUser = await User.findOne({
                order: [sequelize.fn('RAND')],
                where: { 
                    allow_random: true,
                    user_id: { [Sequelize.Op.ne]: new_diary.user_id 
                }}
            });
            console.log(`randomUser: ${randomUser.name}`);
            inviteUsersInfo.push(randomUser);
        } else {
            // inviteUsers 배열에 초대된 사용자의 정보를 담음
            inviteUsersInfo = await Promise.all(
                new_diary.invitedUsers.map(async (user_id) => {
                console.log(user_id);
                const user = await User.findOne({
                    where: { user_id: user_id }
                });
                return user;
                })
            );
        }
        // 초대된 user들의 userHasDiary 데이터 생성
        const inviteUserDairyMapping = inviteUsersInfo.map(async (inviteUser) => {
            return await inviteUser.addDiary(diary);
        });
        await Promise.all(inviteUserDairyMapping);

        // 초대한 user들의 user_id, email, diary_id로 token 생성
        const mailInfos = inviteUsersInfo.map(inviteUser => {
            return  {
                user_id: user_id,
                name: user.name,
                email: inviteUser.email,
                title: new_diary.title,
                token: jwt.sign({ uid: inviteUser.user_id, email: inviteUser.email, did: diary.id }, secret, {})
            }
        })

        sendInviteMail(mailInfos);
        
        res.send({ success: true,  message: '일기장 초대 메일이 발송되었습니다.', data: new_diary });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
}

const acceptInvite = async (req, res) => {
    // todo: 로그인한 user인지 확인
    const login_user_id = req.user_id; // token의 user_id
    const token = req.body.token;
    let user_id, email, diary_id;
    const inviteInfo = jwt.verify(token, secret, (error, decoded) => {
        if (error) {
            return res.send({message: 'Auth error'})
        } else {
            user_id = decoded.uid;
            email = decoded.email;
            diary_id = decoded.did;
        }
    })

    if (login_user_id == user_id) {
        console.log(`user_id: ${user_id}, diary_id: ${diary_id},`)
        const result = await UserHasDiary.update({
            status: "accept",
            accept_date: new Date()
        }, {where: {user_id: user_id, diary_id: diary_id}});
        res.send({ success: true, message: "초대를 수락했습니다.", data: result});
    } else {
        res.send({ success: false, message: "잘못된 접근입니다."});
    }
}

const toggleDiaryVisibility = async (req, res) => {
    const result = await UserHasDiary.update(
        { hidden: Sequelize.literal('NOT hidden') },
        { where: {
                diary_id: req.params.id,
                user_id: req.user_id
        }}
    );
        
    res.send({ success: true, data: result});
}

const deleteDiary = async (req, res) => {
    const diary_id = req.params.id;
    const currentDate = new Date();
    const nextDay = new Date(currentDate.getTime() + 60000); // 60000 밀리초 = 1분, Test용 1분뒤 삭제 예정
    console.log(`currentDate: ${currentDate}, nextDay: ${nextDay}`);
    const result = await Diary.update({
        "deleted": 'scheduled', //삭제 예정
        "delete_at": nextDay
    }, {where: {id: diary_id}});
    res.send({ success: true, data: result});
}

module.exports = {
    getDiaries,
    createDiary,
    acceptInvite,
    toggleDiaryVisibility,
    deleteDiary,
};