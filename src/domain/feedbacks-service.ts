import {CommentBDType, CommentViewModel} from "../types/types";
import {FeedbackRepository} from "../repositories/feedback-repository";
import {randomUUID} from "crypto";
import {LikeStatus} from "../utils/constants";


export class FeedbackService {
    constructor(protected feedbackRepository: FeedbackRepository) {}
    async findCommentById(commentId: string): Promise<CommentViewModel | null> {
        return this.feedbackRepository.findCommentByID(commentId)
    }
    async createComment(postId: string, content: string, userId: string, userLogin: string): Promise<CommentViewModel> {
        const createdComment: CommentBDType = {
            id: randomUUID().toString(),
            postId,
            content,
            commentatorInfo: {
                userId,
                userLogin
            },
            createdAt: new Date().toISOString(),
            likesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                myStatus: LikeStatus.None
            }
        }
        return await this.feedbackRepository.createComment(createdComment)
    }
    async updateCommentById(commentId: string, content: string): Promise<boolean> {
        return await this.feedbackRepository.updateCommentById(commentId, content)
    }
    async deleteCommentById(commentId: string) {
        await this.feedbackRepository.deleteCommentById(commentId)
    }
    async updateCommentLikes(commentId: string, likeStatus: LikeStatus): Promise<boolean> {
        return await this.feedbackRepository.updateCommentLikes(commentId, likeStatus)
    }
}