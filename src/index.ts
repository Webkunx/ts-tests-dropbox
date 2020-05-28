import {DropboxClientImpl} from "./dropbox.client";
import {GenerateFileFactory} from "./generateFile";


const main = async (): Promise<void> => {
    try {
        const folderName = Math.random().toString(36).substring(7)
        const dropboxClient = new DropboxClientImpl()
        await GenerateFileFactory.generateFile("kek", "txt")
        const file = await GenerateFileFactory.generateFile("kek", "img")
        console.log(file)
        const fileName = file.split("\\",)[file.split("\\",).length - 1]
        console.log(fileName)
        const folder = (await dropboxClient.createFolder(`/leyn/${folderName}`)).path
        const createdFile = await dropboxClient.addFile(folder, fileName, file)
        console.log(createdFile)
        const fileFromDropBox = await dropboxClient.getFile(createdFile.id)
        console.log(fileFromDropBox)

        const filesFromFolder = await dropboxClient.getAllFilesFromFolder(`/leyn/${folderName}`)
        console.log(filesFromFolder)
        const deletedFile = await dropboxClient.deleteFileOrFolder(folder)
        console.log(deletedFile)
        const filesFromFolder2 = await dropboxClient.getAllFilesFromFolder(`/leyn/${folderName}`)
        console.log(filesFromFolder2)
    } catch (e) {
        console.log(e)
    }
}
main()
