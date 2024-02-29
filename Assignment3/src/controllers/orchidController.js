const orchids = require('../models/orchid')
const category = require('../models/category')
class orchidController {

    getAllOrchid(req, res, next) {
        if (req.query.search != undefined && req.query.search != '' && req.query.search != null) {
            orchids.find({ name: { $regex: req.query.search } }).then((orchid) => {
                res.render('orchids', {
                    title: 'List of Orchids',
                    orchids: orchid,
                    baseURL: req.originalUrl
                });
            }).catch(next);
        } else {
            orchids.find({}).then((orchid) => {
                res.render('orchids', {
                    title: 'List of Orchids',
                    orchids: orchid,
                    baseURL: req.originalUrl
                });
            }).catch(next);
        }
    }

    manageOrchid(req, res, next) {
        let categories = []
        category.find({}).then((category) => {
            categories.push(...category)
        }).catch(next);

        orchids.find({}).populate('category', 'categoryName').then((orchid) => {
            res.render('manageOrchid', {
                title: 'Manage Orchids',
                orchids: orchid,
                baseURL: req.originalUrl,
                categories: categories
            });
        }).catch(next);
    }

    createNewOrchid(req, res, next) {
        req.body.isNatural === 'on' ? req.body.isNatural = true : req.body.isNatural = false;
        const orchid = new orchids(req.body);
        orchids.findOne({ name: orchid.name }).then((orchidName) => {
            if (orchidName) {
                res.redirect('/orchids');
                req.flash('error', 'An orchid with the same name already exists.');
            } else {
                orchid.save().then(() => {
                    res.redirect('/orchids');
                }).catch(next);
            }
        }).catch(next);
    }

    deleteOrchid(req, res, next) {
        orchids.findByIdAndDelete(req.params.id).then(() => {
            req.flash('success_msg', 'successfully.');
            res.redirect('/orchids');
        }).catch(next);
    }

    getOrchidById(req, res, next) {
        orchids.findById(req.params.id)
            .populate('category', 'categoryName')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: 'name'
                }
            })
            .then((orchid) => {
                res.render('orchidDetail', {
                    title: orchid.name,
                    orchid: orchid,
                    baseURL: req.originalUrl
                });
            }).catch(next);
    }

    addComment(req, res, next) {
        const orchidId = req.params.id;
        const { rating, comment} = req.body;
        const userId = req.user.id; // Lấy id của user đã được đảm bảo authenticated

        orchids.findById(orchidId)
            .then(orchid => {
                if (!orchid) {
                    return res.status(404).render('error', { error: 'Orchid not found' });
                }

                const newComment = {
                    rating,
                    comment,
                    author: userId
                };

                orchid.comments.push(newComment);

                return orchid.save();
            })
            .then(orchid => {
                return res.redirect(`/orchids/${orchidId}`);
            })
            .catch(next);
    }



    getOrchidEditById(req, res, next) {
        let categories = []
        category.find({}).then((category) => {
            categories.push(...category)
        }).catch(next);

        orchids.findById(req.params.id).populate('category', 'categoryName').then((orchid) => {
            res.render('orchidEdit', {
                title: orchid.name,
                orchid: orchid,
                categories: categories,
                baseURL: req.originalUrl
            });
        }).catch(next);
    }

    updateOrchidById(req, res, next) {
        req.body.isNatural == "on" ? req.body.isNatural = true : req.body.isNatural = false;
    
        // Find the orchid by ID
        orchids.findById(req.params.id)
            .then(orchid => {
                if (!orchid) {
                    // Orchid not found
                    req.flash('error', 'Orchid not found.');
                    return res.redirect('/orchids');
                }
    
                // Check if an orchid with the updated name already exists
                return orchids.findOne({ name: req.body.name, _id: { $ne: req.params.id } })
                    .then(existingOrchid => {
                        if (existingOrchid) {
                            // Orchid with the same name already exists
                            req.flash('error', 'An orchid with the same name already exists.');
                            return res.redirect('/orchids');
                        } else {
                            // Update the orchid
                            return orchids.updateOne({ _id: req.params.id }, req.body)
                                .then(() => {
                                    req.flash('success_msg', 'Orchid updated successfully.');
                                    return res.redirect('/orchids');
                                });
                        }
                    });
            })
            .catch(next);
    }
    

    searchOrchid(req, res, next) {
        orchids.find({ name: { $regex: req.query.name } }).then((orchid) => {
            res.render('orchids', {
                title: 'List of Orchids',
                orchids: orchid,
                baseURL: req.originalUrl
            });
        }).catch(next);
    }

}

module.exports = new orchidController();