const { Category, UserHasDiary } = require('../models');

const createCategory = async (req, res) => {
    const new_category = req.body;
    new_category.user_id = req.user_id;

    try {
        const result = await Category.create(new_category);
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }

}

const updateCategoryName = async (req, res) => {
    const update_category = req.body;
    const category_id = req.params.category_id;

    try {
        const result = await Category.update(update_category, {where: { id: category_id, user_id: req.user_id}});
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }

}

const getCategoryList = async (req, res) => {
    const user_id = req.user_id;
    try {
        const result = await Category.findAll({
            attributes: ['id', 'cname'],
            where: { user_id: user_id },
        });
        res.send({ success: true, category: result });
    } catch(error) {
        res.send({ success: false, message: error.message });
    }
}

const deleteCategory = async (req, res) => {
    const category_id = req.params.category_id;

    try {
        const result = await Category.destroy({where: { id: category_id, user_id: req.user_id}});
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const addDiaryToCategory = async (req, res) => {
    const user_id = req.user_id;
    const category_id = req.params.category_id;
    const diary_id = req.body.diary_id;

    try {
        const result = await UserHasDiary.update({ category_id: category_id }, {
            where: { user_id: user_id, diary_id: diary_id }
        });
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }
}

const deleteDiaryFromCategory = async (req, res) => {
    const user_id = req.user_id;
    const diary_id = req.body.diary_id;

    try {
        const result = await UserHasDiary.update({ category_id: null }, {
            where: { user_id: user_id, diary_id: diary_id }
        });
        res.status(201).send({ success: true, result: result });
    } catch(error) {
        res.status(500).send({ success: false, message: error.message });
    }
}


module.exports = {
    createCategory,
    updateCategoryName,
    getCategoryList,
    deleteCategory,
    addDiaryToCategory,
    deleteDiaryFromCategory
};