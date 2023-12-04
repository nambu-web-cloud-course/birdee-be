const nodemailer = require("nodemailer");

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
        // const url = `http://${process.env.FRONT_PORT}/diaries/invite?token=${mailInfo.token}`;
        const url = `${process.env.REACT_APP_FRONTEND_HOST}/diaries/invite?token=${mailInfo.token}`;
        const mailOptions = {
            from: process.env.MAIL_USER, 
            to: mailInfo.email,
            subject: `[BIRDEE] ${mailInfo.name}님의 교환일기 초대장`,
            html: `<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitation Page</title>
</head>

<body style="font-family: 'DungGeunMo'; background-color: #f4f4f4; text-align: center; margin: 0; padding: 0;">

    <div
        style="max-width: 600px; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 20px; background-color: #fff; border: 2px solid #4d9cd0; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <h1 style="font-size: 50px; margin: 0;">BIRDEE</h1>
        <p style="font-size: 18px; margin-bottom: 20px; color: #555;">
            ${mailInfo.name}(${mailInfo.user_id})님이<br>'${mailInfo.title}' 교환일기 초대를 보냈습니다.
        </p>
        <a href="${url}"
            style="display: inline-block; padding: 15px 30px; font-size: 20px; color: #4d9cd0; background-color: #f2dd98; border-right: 5px solid #4d9cd0; border-bottom: 5px solid #4d9cd0; text-decoration: none; transition: background-color 0.3s;">
            수락하기
        </a>
    </div>

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