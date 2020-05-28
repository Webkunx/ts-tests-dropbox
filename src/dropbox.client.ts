import request from "superagent";
import dotenv from "dotenv";
import {readFile} from "fs/promises";

export type dropboxResponse = {
    id: string,
    path: string
}

export interface DropboxClient {
    checkIsAlive(): Promise<boolean>

    createFolder(path: string): Promise<dropboxResponse>

    addFile(path: string, fileName: string, filePath: string): Promise<dropboxResponse>

    getFile(id:string): Promise<dropboxResponse>

    getAllFilesFromFolder(folderPath: string): Promise<dropboxResponse[]>

    deleteFileOrFolder(filePath:string): Promise<dropboxResponse>
}

export class DropboxClientImpl implements DropboxClient {
    private _client: request.SuperAgentStatic

    constructor() {
        dotenv.config()
        const ACCESS_TOKEN: string = process.env.DROPBOX_KEY
        this._client = request.agent().auth(ACCESS_TOKEN, {type: "bearer"})
    }

    public async checkIsAlive(): Promise<boolean> {
        const response = await this._client
            .post('https://api.dropboxapi.com/2/users/get_current_account')

        if (response.status >= 400) throw new Error("Something went wrong")
        console.log(response.status + " dropbox is alive")
        return true
    }

    async createFolder(path: string): Promise<dropboxResponse> {
        try {
            const response = await this._client
                .post("https://api.dropboxapi.com/2/files/create_folder_v2")
                .send({"path": path, "autorename": false})
            return {id: response.body.metadata.id, path: response.body.metadata.path_display}
        } catch (e) {
            throw new Error("Something went wrong, check if provided path starts with /")
        }
    }

    async addFile(path: string, fileName: string, filePath: string): Promise<dropboxResponse> {
        const headersParams = {
            "path": `${path}/${fileName}`,
            "mode": "add",
            "autorename": true,
            "mute": false,
            "strict_conflict": false,
        }
        try {
            const file = await readFile(filePath)
            const response = await this._client
                .post("https://content.dropboxapi.com/2/files/upload")
                .set("Dropbox-API-Arg", JSON.stringify(headersParams))
                .set('Content-Type', "application/octet-stream"
                )
                .send(file)
            console.log(response.body)
            return {id: response.body.id, path: response.body.path_display}
        } catch (e) {
            throw new Error("Something went wrong on file upload")
        }
    }

    async deleteFileOrFolder(filePath:string): Promise<dropboxResponse> {
        try {
            const response = await this._client
                .post('https://api.dropboxapi.com/2/files/delete_v2')
                .set("Content-Type", "application/json")
                .send({
                    "path": filePath,
                })
            return {id: response.body.metadata.id, path: response.body.metadata.path_display}

        }catch (e) {
            console.log(e)
        }
    }

    async getAllFilesFromFolder(folderPath: string): Promise<dropboxResponse[]> {
        try{
            const response = await this._client
                .post('https://api.dropboxapi.com/2/files/list_folder')
                .set("Content-Type", "application/json")
                .send({
                    "path": folderPath,
                    "recursive": false,
                    "include_media_info": false,
                    "include_deleted": false,
                    "include_has_explicit_shared_members": false,
                    "include_mounted_folders": true,
                    "include_non_downloadable_files": true
                })
            return response.body.entries.map(el=> ({id:el.id, path: el.path_display}))
        }catch (e) {
            console.log(e)
            throw new Error("Something went wrong on getting files from folder")
        }
    }

    async getFile(id: string): Promise<dropboxResponse> {

        try {
            const response = await this._client
                .post("https://api.dropboxapi.com/2/sharing/get_file_metadata")
                .set("Content-Type","application/json")
                .send({"file": id, "actions": []})
            return {id: response.body.id, path: response.body.path_display}
        }catch (e) {
            console.log(e)
            throw new Error("Something went wrong on get file")
        }
    }


}
