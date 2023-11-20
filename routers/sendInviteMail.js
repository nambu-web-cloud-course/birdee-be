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
    });
};

module.exports = sendInviteMail;