import {Request} from 'express'

export type TDataBase = {
    videos: TVideo[]
    blogs: TBlog[]
    posts: TPost[]
}
export type TVideo = {
    id: string
    title: string
    author: string
    canBeDownloaded: boolean
    minAgeRestriction: number | null
    createdAt: string
    publicationDate: string
    availableResolutions: string[]
}
export type TBlog = {
    id: string
    name: string
    description: string
    websiteUrl: string
}
export type TPost = {
    id: string
    title: string
    shortDescription: string
    content: string
    blogId: string
    blogName: string
}
export type TBadRequestError = {
    message: string
    field: string
}
export type TErrors = [
    field: "_error" | string,
    message: any
]

export type VideoPostDTO = {
    title: string
    author: string
    availableResolutions: string[]
}
export type VideoPutDTO = {
    title: string
    author: string
    availableResolutions: string[]
    canBeDownloaded: boolean
    minAgeRestriction: number | null
    publicationDate: string
}
export type VideoIdDTO = {
    id: string
}

export type PostDTO = {
    title: string
    shortDescription: string
    content: string
    blogId: string
}

export type RequestParamsType<T> = Request<T>
export type RequestBodyType<T> = Request<{},{},T>  //или так - Request<{},{},{},T> ? TODO проверить
export type RequestParamsBodyType<T, Y> = Request<T,{},Y>
