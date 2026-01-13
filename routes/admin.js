const express = require('express');
const AdminRouter = express.Router()
const User = require('../models/userModel')


AdminRouter.get('/totalUsers', async (req,res)=>{
    try{
 const totalUsers = await User.countDocuments({
            role: { $ne : "admin"}
        })
        res.json({totalUsers})
    }catch(error){
        res.status(500).json({message:"server error"})
    }


})
AdminRouter.get('/activeUsers', async (req,res)=>{
    try{
        const activeUsers = await User.countDocuments({
            isActive:true,
            role: { $ne : "admin"}
        })
        res.json({activeUsers})
    }
    catch(err){
        res.status(500).json({message: "server error"})
    }
})
AdminRouter.get('/user-per-month', async(req,res)=>{
    try{
const userPerMonth= await User.aggregate([
{
    $match:{
        role: {$ne:"admin"}
    }
}, {
    $group:{
        _id: {$month: "$createdAt"},
        totalUsers:{ $sum :1}
    }
}, {
    $sort:{
        "_id":1
    }
}


])

res.json(userPerMonth)
    }
    catch(err){
res.status(500).json({message:"server error"})
    }

})
module.exports= AdminRouter;