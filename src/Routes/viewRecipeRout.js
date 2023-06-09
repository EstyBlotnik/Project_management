const express = require('express');
const router = express.Router();
const Recipe = require('../models/recipe');
const User = require('../models/users');
router.get('/', (req, res) => {
    Recipe.find()
        .then(result => {
            User.findOne({ email: 'adi@gmail.com' })
                .then(user => {
                    res.render('viewRecipe', { posts: result, currentUser: user });
                })

        })
        .catch(err => {
            console.log(err);
        });
});

router.post('/like', (req, res) => {
    const redirectUrl = req.headers.referer || '/';
    const { userId, postId } = req.body;
    // console.log(userId);
    // console.log(postId);
    User.findById(userId)
        .then(user => {
            user.likedRecipes.push(postId);
            return user.save();
        })
        .catch(err => {
            console.log(err);
        });
    Recipe.findById(postId)
        .then(result => {
            User.findOne({ email: result.uploader })
                .then(user => {
                    console.log(user.numberOfLikes);
                    user.numberOfLikes += 1;
                    if(user.numberOfLikes<=4){
                        user.level = "beginner"
                    }
                    else if(user.numberOfLikes<=9){
                        user.level = "professional"
                    }
                    else{
                        user.level = "chef"
                    }
                    return user.save(); // Save the updated user document
                })
                .then(updatedUser => {
                    console.log('Number of likes updated:', updatedUser.numberOfLikes);
                    // Perform further actions if needed
                })
                .catch(err => {
                    // Handle any errors that occur during the process
                    console.error(err);
                });
        })
        .catch(err => {
            // Handle any errors related to finding the recipe
            console.error(err);
        });

    Recipe.findByIdAndUpdate(postId, { $inc: { likes: 1 } })
        .then(result => {
            res.json({ redirect: redirectUrl });
        })
        .catch(err => {
            console.log(err);
        });
});



router.post('/unlike', (req, res) => {
    const { userId, postId } = req.body;
    const redirectUrl = req.headers.referer || '/';
    // console.log(userId);
    // console.log(postId);
    User.findById(userId)
        .then(user => {
            user.likedRecipes.pull(postId);
            return user.save();
        })
        .catch(err => {
            console.log(err);
        });

    Recipe.findById(postId)
        .then(result => {
            User.findOne({ email: result.uploader })
                .then(user => {
                    console.log(user.numberOfLikes);
                    user.numberOfLikes-= 1;
                    if(user.numberOfLikes<=4){
                        user.level = "beginner"
                    }
                    else if(user.numberOfLikes<=9){
                        user.level = "professional"
                    }
                    else{
                        user.level = "chef"
                    }

                    return user.save(); // Save the updated user document
                })
                .then(updatedUser => {
                    console.log('Number of likes updated:', updatedUser.numberOfLikes);
                    // Perform further actions if needed
                })
                .catch(err => {
                    // Handle any errors that occur during the process
                    console.error(err);
                });
        })
        .catch(err => {
            // Handle any errors related to finding the recipe
            console.error(err);
        });

    Recipe.findByIdAndUpdate(postId, { $inc: { likes: -1 } })
        .then(result => {
            res.json({ redirect: redirectUrl });
        })
        .catch(err => {
            console.log(err);
        });
});

router.post('/share', (req, res) => {
    const { userId, postId } = req.body;
    const redirectUrl = req.headers.referer || '/';
    // console.log(userId);
    // console.log(postId);
    User.findById(userId)
        .then(user => {
            user.sharedRecipes.push(postId);
            res.json({ redirect: redirectUrl });
            return user.save();
        })
        .catch(err => {
            console.log(err);
        });
});

router.post('/save', (req, res) => {
    const { userId, postId } = req.body;
    const redirectUrl = req.headers.referer || '/';
    // console.log(userId);
    // console.log(postId);
    User.findById(userId)
        .then(user => {
            user.savedRecipes.push(postId);
            res.json({ redirect: redirectUrl });
            return user.save();
        })
        .catch(err => {
            console.log(err);
        });

});

router.post('/unsave', (req, res) => {
    const { userId, postId } = req.body;
    const redirectUrl = req.headers.referer || '/';
    // console.log(userId);
    // console.log(postId);
    User.findById(userId)
        .then(user => {
            user.savedRecipes.pull(postId);
            res.json({ redirect: redirectUrl });
            return user.save();
        })
        .catch(err => {
            console.log(err);
        });

});



router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    const redirectUrl = req.headers.referer || '/';
    try {
        const recipeId = id;

        const result = await User.updateMany(
            { likedRecipes: recipeId },
            { $pull: { likedRecipes: recipeId } }
        );
        const result2 = await User.updateMany(
            { uploadedRecipes: recipeId },
            { $pull: { uploadedRecipes: recipeId } }
        )
        const result3 = await User.updateMany(
            { savedRecipes: recipeId },
            { $pull: { savedRecipes: recipeId } }
        )
        const result4 = await User.updateMany(
            { sharedRecipes: recipeId },
            { $pull: { sharedRecipes: recipeId } }
        )

        console.log(`${result.nModified} users updated`);
    } catch (error) {
        console.error('Error deleting recipe from saved lists:', error);
    }
    Recipe.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: redirectUrl });
        })
        .catch(err => {
            console.log(err);
        });
});
module.exports = router;
