const express = require('express');
const router = express.Router();
const isAuth = require('./authorization');
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const Sequelize = require("sequelize");
dotenv.config();

const secret = process.env.JWT_SECRET || "secret";
// model
const { User, Diary, UserHasDiary, Page, sequelize } = require('../models');

// 메일 전송
const sendInviteMail = (async (mailInfos) => {
    // 초대한 user들에게 메일 전송
    const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        },
    });

    // 메일 보내기
    const info = mailInfos.map(mailInfo => {
        // 초대 링크 생성
        const url = `http://localhost:${process.env.PORT}/diaries/invite?token=${mailInfo.token}`;
        console.log(url);
        console.log(mailInfo.email);

        console.log(mailInfo.token);
        const mailOptions = {
            from: process.env.MAIL_USER,
            to: mailInfo.email,
            subject: '초대 메일 Test',
            html: `<html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invitation Page</title>
            </head>
            <body>
              <h1>Invitation Page</h1>
              <form action="http://localhost:${process.env.PORT}/diaries/invite" method="POST"
                    enctype="application/x-www-form-urlencoded">
                <input type="hidden" name="token" value="${mailInfo.token}">
                <button type="submit">초대 수락</button>
              </form>
            </body>
            </html>`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error(error);
            } else {
                console.log('Email Sent: ', info);
            }
        });
    })
});

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
              attributes: ['hidden', 'status'],
              where: { hidden: false, status: "accept" }
            }
        },
        // raw: true
    });

    res.send({ success: true, data: diaries});
});

// 일기장 생성
router.post('/', isAuth, async (req, res) => {
    const user_id = req.user_id; // token의 user_id
    const new_diary = req.body;
    new_diary.user_id = user_id;

    try {
        const user = await User.findOne({
            where: { user_id: new_diary.user_id }
        })
        const diary = await Diary.create(new_diary);
        
        // 최초 생성자는 accept
        await user.addDiary(diary, {
            through: { status: 'accept', accept_date: new Date() }
        });

        // inviteUsers 배열에 초대된 사용자의 정보를 담음
        const inviteUsersInfo = await Promise.all(
            new_diary.invitedUsers.map(async (user_id) => {
            const user = await User.findOne({
                where: { user_id: user_id }
            });
            return user;
            })
        );
        
        // 초대된 user들의 userHasDiary 데이터 생성
        const inviteUserDairyMapping = inviteUsersInfo.map(async (inviteUser) => {
            return await inviteUser.addDiary(diary);
        });
        await Promise.all(inviteUserDairyMapping);

        // 초대한 user들의 user_id, email, diary_id로 token 생성
        const mailInfos = inviteUsersInfo.map(inviteUser => {
            return  {
                email: inviteUser.email,
                token: jwt.sign({ uid: inviteUser.user_id, email: inviteUser.email, did: diary.id }, secret, {})
            }
        })

        sendInviteMail(mailInfos);
        
        res.send({ success: true,  message: '일기장 초대 메일이 발송되었습니다.', data: new_diary });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
});

// 일기장 초대 수락하기
router.post('/invite', async (req, res) => {
    // todo: 로그인한 user인지 확인
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
    console.log(`user_id: ${user_id}, diary_id: ${diary_id},`)
    const result = await UserHasDiary.update({
        status: "accept",
        accept_date: new Date()
    }, {where: {user_id: user_id, diary_id: diary_id}});
    res.send({ success: true, message: "초대를 수락했습니다.", data: result});
});

// 일기장 숨기기
router.put('/:id', isAuth, async (req, res) => {
    const result = await UserHasDiary.update({
        "hidden": true
    }, { where: {
            diary_id: req.params.id,
            user_id: req.user_id
        }});
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
    
    const result1 = await Diary.findAll({
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
     
    let pages = [];
    let users = [];

    // 참여 user 찾기
    const [result2, metadata] = await sequelize.query(`
            SELECT u.name, uhd.accept_date
            FROM userhasdiary uhd, diaries d, users u
            WHERE uhd.diary_id = d.id AND d.id = ${diary_id} AND uhd.user_id = u.user_id
            ORDER by uhd.accept_date;
            `)
    console.log(result2);

    if (result1[0].Page != null) {
        pages = result1.map(diary => {
            return {
                page_id: diary.Page.id,
                subject: diary.Page.subject,
                contents: diary.Page.contents,
                created_at: diary.Page.dataValues.created_at,
                user_id: diary.Page.User.user_id,
                name: diary.Page.User.name,
            }
        })
    }
    if (result2 != null) {
        users = result2.map(user => { return user.name })
    }


    const formattedResult = {
        diary_id: result1[0].id,
        title: result1[0].title,
        color: result1[0].color,
        is_editable: result1[0].is_editable,
        is_deletable: result1[0].is_deletable,
        users: users,
        pages: pages
    }

    res.send({ success: true, data: formattedResult});
    
});

// 일기 페이지 조회
router.get('/:diary_id/pages/:page_id', async (req, res) => {
    const page_id = req.params.page_id;
    console.log(req.params.page_id);
    try {
        const result = await Page.findOne({where: { id: page_id }});
        res.send({ success: true, page: result });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
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
    const page_id = req.params.page_id;
    const update_page = req.body;
    const result = await Page.update(update_page, {where: {id: page_id}});
    res.send({ success: true, data: result});
});

// 일기 페이지 삭제
router.delete('/:diary_id/pages/:page_id', async (req, res) => {
    const page_id = req.params.page_id;
    const result = await Page.destroy({where: {id: page_id}});
    res.send({ success: true, data: result});
});

module.exports = router;