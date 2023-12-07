const { User, Diary, Page, sequelize } = require('../models');

const getPageList = async (req, res) => {
    const diary_id = req.params.diary_id;
    
    const result1 = await Diary.findAll({
        attributes: ['id', 'title', 'color', 'deleted', 'is_editable', 'is_deletable'],
        where: { id: diary_id },
        order: [[{model: Page}, 'created_at', 'desc']],
        include: [{
            attributes: ['id', 'subject', 'contents', 'created_at', 'deleted'],
            model: Page,
            include: [{
                attributes: ['user_id', 'name'],
                model: User,
                required: false, // 외부 조인
            }],
        }],
    });
     
    let pages = [];
    let users = [];

    // 참여 user 찾기
    const [result2, metadata] = await sequelize.query(`
            SELECT u.user_id, u.name, u.image, u.message, u.birth, uhd.accept_date, uhd.status
            FROM userhasdiary uhd, diaries d, users u
            WHERE uhd.diary_id = d.id AND d.id = ${diary_id} AND uhd.user_id = u.user_id AND u.deleted_at IS NULL
            ORDER by uhd.accept_date;
            `)

    if (result1[0].Page != null) {
        pages = result1.map(diary => {
            return {
                page_id: diary.Page.id,
                subject: diary.Page.subject,
                contents: diary.Page.contents,
                created_at: diary.Page.dataValues.created_at,
                deleted: diary.Page.deleted,
                // user_id: diary.Page.User.user_id,
                // name: diary.Page.User.name,
                user_id: (diary.Page.User) ? diary.Page.User.user_id : "탈퇴한 사용자",
                name: (diary.Page.User) ? diary.Page.User.name : "탈퇴한 사용자",
            }
        })
    }
    if (result2 != null) {
        users = result2.map(user => { 
            return { user_id: user.user_id, name: user.name, birth: user.birth, message: user.message, status: user.status, image: user.image}
        })
    }


    const formattedResult = {
        diary_id: result1[0].id,
        title: result1[0].title,
        color: result1[0].color,
        deleted: result1[0].deleted,
        is_editable: result1[0].is_editable,
        is_deletable: result1[0].is_deletable,
        users: users,
        pages: pages
    }

    res.send({ success: true, data: formattedResult});
    
}

const getPage = async (req, res) => {
    const page_id = req.params.page_id;
    try {
        const result = await Page.findOne(
            {
                where: { id: page_id },
                include: {
                    attributes: ['name'],
                    model: User},
            },
                );

        if (!result.User) {
            result.dataValues.User = { name : null }
        }
        res.send({ success: true, page: result });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
}

const createPage = async (req, res) => {
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
}

const updatePage = async (req, res) => {
    const user_id = req.user_id;
    const page_id = req.params.page_id;
    const update_page = req.body;
    const result = await Page.update(update_page, {where: {id: page_id, user_id: user_id}});
    res.send({ success: true, data: result});
}

const deletePage = async (req, res) => {
    const user_id = req.user_id;
    const page_id = req.params.page_id;
    const result = await Page.update({ "deleted": true }, {where: {id: page_id, user_id: user_id}});
    res.send({ success: true, data: result});
}

module.exports = {
    getPageList,
    getPage,
    createPage,
    updatePage,
    deletePage
};