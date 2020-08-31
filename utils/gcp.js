const { Storage } = require("@google-cloud/storage");
const storage = new Storage();

exports.uploadFile = async (files) => {
    try{
    const data = await storage
        .bucket("sarvam_bucket_1")
        .upload(files.thumbnail.path, {
            gzip: true,
            metadata: {
                cacheControl: "no-cache",
            },
            resumable: false,
        })

    return data
    }
    catch(error){
        console.log(error)
        return error
    }
}


exports.uploadShopThumbnail = async (files) => {
    try{
    const data = await storage
        .bucket("sarvam_bucket_1")
        .upload(files.shop_thumbnail.path, {
            gzip: true,
            metadata: {
                cacheControl: "no-cache",
            },
            resumable: false,
        })

    return data
    }
    catch(error){
        console.log(error)
        return error
    }
}