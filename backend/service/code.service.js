import { get } from "http";
import codeModel from "../models/code.model.js";



export const savecode = async ({code,language,fileName,user,output,error,executionTime})=>{

  return await codeModel.create({
        code,
        language,
        user,
        output,
        fileName,
        error,
        executionTime
    })
}

export const getAllSubmissions = async (userId)=>{

    return await codeModel.find({ user: userId }).sort({dateOfSubmission:-1});   //descending

}

export const getSubmissionById = async (id)=>{
    return await codeModel.findById(id);
}