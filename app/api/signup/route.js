import userModel from "@/app/models/userModel";
import connectToDatabase from "@/lib/db";
import bcrypt from 'bcrypt';
import { NextResponse } from "next/server";

export async function POST(request){
    try {
        const defaultImg='';
        await connectToDatabase();
        const {name,password,email,mobile} = await request.json();
        const userExist = await userModel.findOne({email})
        if(userExist){
            return NextResponse.json({error:'User already registered', status:400})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new userModel({
            name,
            email,
            password:hashedPassword,
            mobile,
            profile_pic:defaultImg,
        })
        await newUser.save();
        return NextResponse.json({message:'User Registered Successfully', status:201})

    } catch (error) {
        return NextResponse.json({error:error.message, status:500})
    }
}