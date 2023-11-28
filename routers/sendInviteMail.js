const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');

const sendInviteMail = async (mailInfos) => {
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
        const url = `http://localhost:${process.env.FRONT_PORT}/diaries/invite?token=${mailInfo.token}`;
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
                <a href="${url}">수락하기</a>
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
    });
};

module.exports = sendInviteMail;