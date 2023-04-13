import {postCollection} from "../db/db";
import {TBlog, TPost} from "../types";
import {Result, ResultCode} from "../utils";


export const postsRepository = {
    async findExistPosts(): Promise<TPost[]> {      // get
        return await postCollection.find({}, {projection: {_id: false}}).toArray();
    },
    async createPost(title: string, shortDescription: string, content: string,
                     blogId: string, blog: TBlog | null): Promise<TPost> {    // post
        const dateNow = new Date()
        const createdPost: TPost = {
            id: (+dateNow).toString(),
            title,
            shortDescription,
            content,
            blogId,
            blogName: blog!.name,
            createdAt: dateNow.toISOString()
        }
        await postCollection.insertOne(createdPost)
        return {
            id: createdPost.id,
            title: createdPost.title,
            shortDescription: createdPost.shortDescription,
            content: createdPost.content,
            blogId: createdPost.blogId,
            blogName: createdPost.blogName,
            createdAt: createdPost.createdAt
        }
    },
    async findPostById(postId: string): Promise<TPost | null> {   // get, put, delete
        const post = await postCollection.findOne({id: postId},  {projection: {_id: false}})
        if (post) return post
        else return null
    },
    async updatePost(postId: string, title: string, shortDescription: string,
               content: string): Promise<Result<boolean>> {      // put
        const updatedResult = await postCollection.updateOne({id: postId},
        { $set: {title: title, shortDescription: shortDescription, content: content}})
        if(updatedResult.matchedCount < 1 ) {
            return {
                data: false,
                code: ResultCode.NotFound
            }
        } else {
            return {
                data: true,
                code: ResultCode.Success
            }
        }
    },
    async deletePostById(postId: string) {    // delete
        return await postCollection.deleteOne({id: postId})
    }
}