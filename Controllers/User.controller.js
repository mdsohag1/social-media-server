import UserModel from "../Models/User.Model.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'


//get all user
export const getAllUsers = async (req, res) => {
    try {
        let users = await UserModel.find()
        users = users.map((user) => {
            const { password, ...otherDatails } = user._doc
            return otherDatails
        })
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json(error)
    }
}


//get a user
export const getUser = async (req, res) => {
    const id = req.params.id;

    try {
        const user = await UserModel.findById(id)
        if (user) {
            const { password, ...otherDatails } = user._doc
            res.status(200).json(otherDatails)
        }
        else {
            res.status(404).json("No such user exits")
        }

    } catch (error) {
        res.status(500).json(error)
    }
}

//update a user
export const updateUser = async (req, res) => {
    const id = req.params.id;
    const { _id, currentUserAdminStatus, password } = req.body;
    if (id === _id) {
        try {
            if (password) {
                const slat = await bcrypt.genSalt(10)
                req.body.password = await bcrypt.hash(password, slat)
            }
            const user = await UserModel.findByIdAndUpdate(id, req.body, { new: true })
            const token = jwt.sign(
                { username: user.username, id: user._id },
                process.env.JWT_KEY, { expiresIn: "1h" }
            )
            res.status(200).json({ user, token })
        } catch (error) {
            res.status(500).json(error)
        }
    }
    else {
        res.status(403).json("Access Denile! you can update your own profile")
    }
}

//delete user
export const deleteUser = async (req, res) => {
    const id = req.params.id;
    const { currentUserId, currentUserAdminStatus } = req.body;
    if (id === currentUserId || currentUserAdminStatus) {
        try {
            await UserModel.findByIdAndDelete(id)
            res.status(200).json("user deleted successfully")
        } catch (error) {
            res.status(500).json(error)
        }
    } else {
        res.status(403).json("Access Denile! you can delete your own profile")
    }
}

//follow a user
export const followUser = async (req, res) => {
    const id = req.params.id;
    const { _id } = req.body;

    if (_id === id) {
        res.status(403).json("Action forbidden")
    }
    else {
        try {
            const followUser = await UserModel.findById(id)
            const folloingUser = await UserModel.findById(_id)

            if (!followUser.followers.includes(_id)) {
                await followUser.updateOne({ $push: { followers: _id } })
                await folloingUser.updateOne({ $push: { followings: id } })
                res.status(200).json("users followed")
            }
            else {
                res.status(403).json("user is already followed by you")
            }
        } catch (error) {
            res.status(500).json(error)
        }
    }
}


//UnFollow a user
export const unFollowUser = async (req, res) => {
    const id = req.params.id;
    const { _id } = req.body;

    if (_id === id) {
        res.status(403).json("Action forbidden")
    }
    else {
        try {
            const followUser = await UserModel.findById(id)
            const folloingUser = await UserModel.findById(_id)

            if (followUser.followers.includes(_id)) {
                await followUser.updateOne({ $pull: { followers: _id } })
                await folloingUser.updateOne({ $pull: { followings: id } })
                res.status(200).json("users UnFollowed")
            }
            else {
                res.status(403).json("user is not followed by you")
            }
        } catch (error) {
            res.status(500).json(error)
        }
    }
}