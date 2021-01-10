const MongoClient = require('mongodb').MongoClient
const {MONGO_HOST} = process.env
const log = require('debug')('repository');

const collection = "acs"

const execute = async operation => {
    const client =await  MongoClient.connect(MONGO_HOST);
    try {
        const result = await operation(client.db("ac-watcher"))
        return result
    } catch (error) {
        log(error)
        throw error
    } finally {
        client.close()
    }

}

exports.create = async (channelId, {name, coordinates, description} ) => {
    let r = await execute(db => db.collection(collection).insertOne({
        name,
        channelId,
        coordinates,
        description
    },{
        forceServerObjectId: true
      }));
    return r
}

exports.delete = async (channelId, acName ) => {
    let r = await execute(db => db.collection(collection).deleteOne({
        name: acName,
        channelId
    }));
    return r
}

exports.getAll = async (channelId ) => {
    let r = await execute(db => db.collection(collection).find({
        channelId
    }).toArray());
    return r
}

exports.get = async (channelId,acName ) => {
    let r = await execute(db => db.collection(collection).findOne({
        channelId,
        name: acName
    }));
    return r
}