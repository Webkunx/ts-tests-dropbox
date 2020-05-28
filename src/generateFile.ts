import {writeFile} from "fs/promises"
import agent from "superagent"
import path from "path";

type fileType = "txt" | "img";

export interface GeneratedData {
    type: fileType,
    data: string | Buffer,
    generateData
}

export class GenerateFileFactory {
    static async generateFile(fileName: string, fileType: fileType) {

        if (fileType === "txt") {
            const generatedData = new GenerateTxt();
            await generatedData.generateData();
            const {data} = generatedData
            const filePath = path.join(__dirname, `../generated-files/${fileName}.txt`)
            await writeFile(filePath, data)
            return filePath
        }

        if (fileType === "img") {
            const generatedData = new GenerateImage();
            await generatedData.generateData();
            const {data} = generatedData

            const filePath = path.join(__dirname, `../generated-files/${fileName}.jpg`)
            await writeFile(filePath, data)
            return filePath

        } else throw new Error("Unknown file type")

    }
}

class GenerateTxt implements GeneratedData {
    public type: fileType = "txt"
    public data: string

    public async generateData() {
        this.data = Math.random().toString(36).substring(7);
    }
}

class GenerateImage implements GeneratedData {
    public type: fileType = "txt"
    public data: string

    public async generateData() {
        this.data = (await agent.get('https://picsum.photos/200/300?grayscale')).body
    }
}
