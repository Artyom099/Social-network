import {commentCollection} from "../db/db";
import {ResultCode} from "../utils";
import {TComment} from "../types";


export const feedbackRepository = {
    async createComment(createdComment: TComment): Promise<TComment> {
        await commentCollection.insertOne(createdComment)
        return  {
            id: createdComment.id,
            content: createdComment.content,
            commentatorInfo: {
                userId: createdComment.commentatorInfo.userId,
                userLogin: createdComment.commentatorInfo.userLogin
            },
            createdAt: createdComment.createdAt
        }
    },

    async updateCommentById(commentId: string, content: string) {
        const updatedResult = await commentCollection.updateOne({id: commentId},
            {$set: {content: content}})
        if(updatedResult.matchedCount < 1) {
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

    async deleteCommentById(commentId: string) {
        await commentCollection.deleteOne({id: commentId})
    }
}