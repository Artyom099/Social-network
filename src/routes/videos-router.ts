import express, {Request, Response} from "express";
import {
    RequestBodyType,
    RequestParamsBodyType,
    RequestParamsType,
    TBadRequestError,
    TVideo,
    VideoIdDTO,
    VideoPostDTO, VideoPutDTO
} from "../types";
import {HTTP_STATUS} from "../utils";
import {videosRepository} from "../repositories/videos-repository";

export const videoResolutions = ['P144', 'P240', 'P360', 'P480', 'P720', 'P1080', 'P1440', 'P2160']
export function checkArrayValues(existArray: string[], receivedArray: string[]): boolean {
    for (let i of receivedArray) {
        if (!existArray.includes(i)) return false
    }
    return true
}

export const getVideosRouter = () => {
    const router = express.Router()
    router.get('/', (req: Request, res: Response) => {
        const foundVideos = videosRepository.findVideos()
        res.status(HTTP_STATUS.OK_200).send(foundVideos)
    })
    router.post('/', (req: RequestBodyType<VideoPostDTO>, res: Response) => {
        const {title, author, availableResolutions} = req.body
        const errors: TBadRequestError[] = []

        // validation:
        if (!title || typeof title !== 'string' || !title.trim() || title.length > 40) {
            errors.push({
                message: 'should be a string',
                field: 'title'
            })
        }
        if (!author || typeof author !== 'string' || !author.trim() || author.length > 20) {
            errors.push({
                message: 'should be a string, max 40 symbols',
                field: 'author'
            })
        }
        // если availableResolutions НЕ существует ИЛИ (длина не равна нулю И данные НЕ савпадают с допустимыми значениями)
        if (!availableResolutions || (availableResolutions.length !== 0 && !checkArrayValues(videoResolutions, availableResolutions))) {
            errors.push({
                message: 'should be an array',
                field: 'availableResolutions'
            })
        }

        if (errors.length > 0) {
            res.status(HTTP_STATUS.BAD_REQUEST_400).send({errorsMessages: errors})
        } else {
            const createdVideo = videosRepository.createVideos(title, author, availableResolutions)
            res.status(HTTP_STATUS.CREATED_201).json(createdVideo)
        }
    })
    router.get('/:id', (req: RequestParamsType<VideoIdDTO>, res: Response<TVideo>) => {
        const foundVideo = videosRepository.findVideoById(req.params.id)
        if (!foundVideo) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404)
        res.status(HTTP_STATUS.OK_200).json(foundVideo)
    })
    router.put('/:id', (req: RequestParamsBodyType<VideoIdDTO, VideoPutDTO>, res: Response) => {
        const foundVideo = videosRepository.findVideoById(req.params.id)
        if (!foundVideo) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404)

        const {title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate} = req.body
        const errors: TBadRequestError[] = []

        // validation:
        if (!title || typeof title !== 'string' || !title.trim() || title.length > 40) {
            errors.push({
                message: 'should be a string',
                field: 'title'
            })
        }
        if (!author || typeof author !== 'string' || !author.trim() || author.length > 20) {         //  && typeof author !== 'string'
            errors.push({
                message: 'should be a string, max 40 symbols',
                field: 'author'
            })
        }
        if (!availableResolutions || (availableResolutions.length !== 0 && !checkArrayValues(videoResolutions, availableResolutions))) {
            errors.push({
                message: 'should be an array',
                field: 'availableResolutions'
            })
        }
        if (!canBeDownloaded || typeof canBeDownloaded !== 'boolean') {
            errors.push({
                message: 'required property',
                field: 'canBeDownloaded'
            })
        }
        if (!minAgeRestriction || typeof minAgeRestriction !== 'number' ||  minAgeRestriction > 18) {
            errors.push({
                message: 'should be a number <= 18 or null',
                field: 'minAgeRestriction'
            })
        }
        if (!publicationDate || typeof publicationDate !== 'string') {
            errors.push({
                message: 'should be a string',
                field: 'publicationDate'
            })
        }

        if (errors.length > 0) {
            res.status(HTTP_STATUS.BAD_REQUEST_400).send({errorsMessages: errors})
        } else {
            const updatedVideo = videosRepository.updateVideo(foundVideo, title, author, availableResolutions, canBeDownloaded, minAgeRestriction, publicationDate)
            res.status(HTTP_STATUS.NO_CONTENT_204).json(updatedVideo)
        }
    })
    router.delete('/:id', (req: RequestParamsType<VideoIdDTO>, res: Response) => {
        const videoForDelete = videosRepository.findVideoById(req.params.id)
        if (!videoForDelete) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404)

        videosRepository.deleteVideoById(req.params.id)
        res.sendStatus(HTTP_STATUS.NO_CONTENT_204)
    })
    return router
}