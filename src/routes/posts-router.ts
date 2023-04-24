import {body} from "express-validator";
import express, {Request, Response} from "express";
import {ReqParamsQueryType, IdDTO, PagingDTO, ReqQueryType, TPost, PostDTO, ReqBodyType} from "../types";
import {convertResultErrorCodeToHttp, HTTP_STATUS} from "../utils";
import {postsService} from "../domain/posts-service";
import {blogsService} from "../domain/blogs-service";
import {inputValidationMiddleware} from "../middleware/input-validation-middleware";
import {queryRepository} from "../repositories/query-repository";
import {feedbackService} from "../domain/feedbacks-service";
import {authMiddleware} from "../middleware/auth-middleware";


const validationPost = [
    body('title').isString().isLength({min: 3, max: 30}).trim().not().isEmpty(),
    body('shortDescription').isString().isLength({min: 3, max: 100}).trim().notEmpty(),
    body('content').isString().isLength({min: 3, max: 1000}).trim().notEmpty(),
    body('blogId').isString().custom(async (value) => {
        const blog = await blogsService.findBlogById(value)
        if (!blog) {
            throw new Error('blog not found')
        }
        return true
    })]
const validationComment = [
    body('content').isString().isLength({min: 20, max: 300}).trim().not().isEmpty()
]

export const getPostsRouter = () => {
    const router = express.Router()

    router.get('/:postId/comments', async (req: ReqParamsQueryType<IdDTO, PagingDTO>, res: Response) => {
        const postId = req.params.id
        if (!postId) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404)

        const pageNumber = req.query.pageNumber ?? 1
        const pageSize = req.query.pageSize ?? 10
        const sortBy = req.query.sortBy ?? 'createdAt'
        const sortDirection = req.query.sortDirection ?? 'desc'

        const foundSortedComments = await queryRepository.findCommentsAndSort(postId, Number(pageNumber), Number(pageSize), sortBy, sortDirection)
        res.status(HTTP_STATUS.OK_200).json(foundSortedComments)
    })

    router.post('/:postId/comments', validationComment, authMiddleware, inputValidationMiddleware,
        async (req: Request, res: Response) => {
        const currentPost = await postsService.findPostById(req.params.postId)
        if (!currentPost) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404)

        const createdComment = await feedbackService.createComment(req.body.content, req.params.postId)
        res.status(HTTP_STATUS.CREATED_201).json(createdComment)
    })


    router.get('/', async (req: ReqQueryType<PagingDTO>, res: Response) => {
        const pageNumber = req.query.pageNumber ?? 1
        const pageSize = req.query.pageSize ?? 10
        const sortBy = req.query.sortBy ?? 'createdAt'
        const sortDirection = req.query.sortDirection ?? 'desc'

        const foundSortedPosts = await queryRepository.findPostsAndSort(Number(pageNumber), Number(pageSize), sortBy, sortDirection)
        res.status(HTTP_STATUS.OK_200).json(foundSortedPosts)
    })

    router.post('/', validationPost, authMiddleware, inputValidationMiddleware,
        async (req: ReqBodyType<PostDTO>, res: Response) => {
            const {title, shortDescription, content, blogId} = req.body
            const blog = await blogsService.findBlogById(blogId)
            const createdPost = await postsService.createPost(title, shortDescription, content, blog)
            res.status(HTTP_STATUS.CREATED_201).json(createdPost)
    })

    router.get('/:id', async (req: Request, res: Response<TPost>) => {
        const foundPost = await postsService.findPostById(req.params.id)
        if (!foundPost) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404)     // если не нашли блог по id, то выдаем ошибку и выходим из эндпоинта
        res.status(HTTP_STATUS.OK_200).json(foundPost)
    })

    router.put('/:id', validationPost, authMiddleware, inputValidationMiddleware,
        async (req: Request, res: Response) => {
            const {title, shortDescription, content} = req.body
            const result = await postsService.updatePostById(req.params.id, title, shortDescription, content)

            if (!result.data) return res.sendStatus(convertResultErrorCodeToHttp(result.code))

            const updatedPost = await postsService.findPostById(req.params.id)
            res.status(HTTP_STATUS.NO_CONTENT_204).json(updatedPost)
    })

    router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
        const postForDelete = await postsService.findPostById(req.params.id)
        if (!postForDelete) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404)

        await postsService.deletePostById(req.params.id)
        res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
    })

    return router
}