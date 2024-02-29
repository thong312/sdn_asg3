const categories = require('../models/category');

class categoryController {

    getAllCategory(req, res, next) {
        categories.find({}).then(categories => {
            res.render('category', {
                title: 'List of Categories',
                categories: categories,
                baseURL: req.originalUrl
            });
        }).catch(next);
    }

    createNewCategory(req, res, next) {
        const { categoryName } = req.body;
        categories.findOne({ categoryName })
            .then(existingCategory => {
                if (existingCategory) {
                    // Category with the same name already exists
                    req.flash('error', 'Category with the same name already exists.');
                    return res.redirect('/categories');
                } else {
                    // If category does not exist, create a new one
                    const newCategory = new categories({ categoryName });
                    return newCategory.save()
                        .then(() => {
                            req.flash('success_msg', 'successfully.');
                            res.redirect('/categories');
                        });
                }
            })
            .catch(next);
    }
    

    deleteCategory(req, res, next) {
        const { id } = req.params;
        categories.findByIdAndDelete(id)
            .then(() => {
                req.flash('success_msg', 'successfully.');
                res.redirect('/categories');
            }).catch(next);
    }

    getCategoryById(req, res, next) {
        const { id } = req.params;
        categories.findById(id)
            .then(category => {
                res.render('editCategory', {
                    category: category
                })
            }).catch(next);
    }

    getCategoryEditById(req, res, next) {
        const { id } = req.params;
        categories.findById(id)
            .then(category => {
                res.render('categoryEdit', {
                    title: category.categoryName,
                    category: category
                })
            }).catch(next);
    }

    updateCategoryById(req, res, next) {
        // Check if an existing category has the same name
        categories.findOne({ categoryName: req.body.categoryName, _id: { $ne: req.params.id } })
            .then(existingCategory => {
                if (existingCategory) {
                    // Category with the same name already exists
                    req.flash('error', 'A category with the same name already exists.');
                    return res.redirect('/categories');
                } else {
                    // Update the category
                    categories.updateOne({ _id: req.params.id }, req.body)
                        .then(() => {
                            req.flash('success_msg', 'Category updated successfully.');
                            res.redirect('/categories');
                        })
                        .catch(next);
                }
            })
            .catch(next);
    }
    
}
module.exports = new categoryController();
