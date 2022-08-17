import PostModel from "../Models/Post.Model.js";
import mongoose from "mongoose";
import UserModel from '../Models/User.Model.js'

//create new post
export const createPost = async (req, res) => {
    const newPost = new PostModel(req.body)

    try {
        await newPost.save()
        res.status(200).json(newPost)
    } catch (error) {
        res.status(500).json(error)
    }
}

//get a post 
export const getPost = async (req, res) => {
    const id = req.params.id;

    try {
        const post = await PostModel.findById(id)
        res.status(200).json(post)
    } catch (error) {
        res.status(500).json(error)
    }
}

//update a apost
export const updatePost = async (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body;

    try {
        const post = await PostModel.findById(postId)
        if (post.userId === userId) {
            await post.updateOne({ $set: req.body })
            res.status(200).json("post updated")
        } else {
            res.status(403).json("action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }

}

//delete post
export const deletePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
        const post = await PostModel.findById(id)
        if (post.userId === userId) {
            await post.deleteOne();
            res.status(200).json("post deleted successfully")
        } else {
            res.status(403).json("action forbidden")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


// like/disalike a post
export const likePost = async (req, res) => {
    const id = req.params.id;
    const { userId } = req.body;

    try {
        const post = await PostModel.findById(id)
        if (!post.likes.includes(userId)) {
            await post.updateOne({ $push: { likes: userId } })
            res.status(200).json("post liked")
        }
        else {
            await post.updateOne({ $pull: { likes: userId } })
            res.status(200).json("post unLiked")
        }
    } catch (error) {
        res.status(500).json(error)
    }
}


//get timeline post
export const getTimelinePost = (req, res) => {
    const userId = req.params.id;

    try {
        const currentUserPost = PostModel.find({ userId: userId })
        const followingsPost = UserModel.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(userId)
                },
                $lookup: {
                    from: "posts",
                    localField: "followings",
                    foreignField: "userId",
                    as: "followingPost"
                },
                $project: {
                    followingsPost: 1,
                    _id: 0
                }
            }
        ])
        res.status(200).json(currentUserPost.concat(...followingsPost[0].followingsPost)
            .sort((a, b) => {
                return b.createdAt - a.createdAt
            }))
    } catch (error) {
        res.status(500).json(error)
    }
}