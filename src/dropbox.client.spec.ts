import {GenerateFileFactory} from "./generateFile";

const {DropboxClientImpl} = require("./dropbox.client")

const dropboxClient = new DropboxClientImpl()
test("should be alive and return true", async () => {
    expect<boolean>(await dropboxClient.checkIsAlive()).toBe(true)
})
test("create folder and it's path should be equals to provided path", async () => {
    const folderName = `/leyn/${Math.random().toString(36).substring(7)}`

    const folder = (await dropboxClient.createFolder(folderName)).path
    expect<string>(folder).toBe(folderName)
})
test("generate txt file and get it path", async () => {
    const generatedFileName = Math.random().toString(36).substring(7)
    const filePath = await GenerateFileFactory.generateFile(generatedFileName, "txt")
})
test("generate img file and get it path", async () => {
    const generatedFileName = Math.random().toString(36).substring(7)
    const filePath = await GenerateFileFactory.generateFile(generatedFileName, "img")
})
test(`create folder,
            generate file,
            upload file to DropBox,
            get this file,
            get all files from folder 
            and delete folder`, async ()=>{
    const generatedFileName = Math.random().toString(36).substring(7)
    const fileName = Math.random().toString(36).substring(7)
    const folderName = `/leyn/${Math.random().toString(36).substring(7)}`


    const folder = (await dropboxClient.createFolder(folderName)).path
    expect<string>(folder).toBe(folderName)

    const filePath = await GenerateFileFactory.generateFile(generatedFileName, "txt")

    const createdFile = await dropboxClient.addFile(folder, fileName, filePath)

    expect(createdFile).toBeDefined()

    const fileFromDropBox = await dropboxClient.getFile(createdFile.id)
    expect<string>(fileFromDropBox.id).toBe(createdFile.id)

    const filesFromFolder = await dropboxClient.getAllFilesFromFolder(folderName)

    const deletedFolder = await dropboxClient.deleteFileOrFolder(folder)
    expect<string>(deletedFolder.path).toBe(folder)

})

