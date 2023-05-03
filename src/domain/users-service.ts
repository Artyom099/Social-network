import bcrypt from 'bcrypt'
import {TUser, UserAccountDBType, UserDBType} from "../types/types";
import {usersRepository} from "../repositories/users-repository";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";


export const usersService = {
    async createUser(login: string, password: string, email: string) {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)
        const newUser: UserAccountDBType = {
            id: uuidv4().toString(),
            accountData: {
                login,
                email,
                passwordHash,
                passwordSalt,
                createdAt: new Date().toISOString()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date, {minutes: 10}),
                isConfirmed: false
            }
        }
        return await usersRepository.createUser(newUser)
    },

    async checkCredentials(loginOrEmail: string, password: string) {
        const user = await usersRepository.findUserByLoginOrEmail(loginOrEmail)
        if (!user) return false
        const passwordHash = await this._generateHash(password, user.accountData.passwordSalt)
        if (user.accountData.passwordHash === passwordHash) return user
        // else return
    },

    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt)
    },

    async findUserById(userId: string): Promise<TUser | null> {    // get, put, delete
        return await usersRepository.findUserById(userId)
    },

    async deleteUser(userId: string) {
        return await usersRepository.deleteUser(userId)
    }
}