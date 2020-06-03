//https://stackoverflow.com/questions/44833817/mongodb-full-and-partial-text-search
import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    title: { type: String, default: '', trim: true },
    body: { type: String, default: '', trim: true },
});

PostSchema.index({ title: "text", body: "text",},
    { weights: { title: 5, body: 3, } })

PostSchema.statics = {
    searchPartial: function(q, callback) {
        return this.find({
            $or: [
                { "title": new RegExp(q, "gi") },
                { "body": new RegExp(q, "gi") },
            ]
        }, callback);
    },

    searchFull: function (q, callback) {
        return this.find({
            $text: { $search: q, $caseSensitive: false }
        }, callback)
    },

    search: function(q, callback) {
        this.searchFull(q, (err, data) => {
            if (err) return callback(err, data);
            if (!err && data.length) return callback(err, data);
            if (!err && data.length === 0) return this.searchPartial(q, callback);
        });
    },
}

export default mongoose.models.Post || mongoose.model('Post', PostSchema)

// How to use:

import Post from '../models/post'

Post.search('Firs', function(err, data) {
   console.log(data);
})