const mongoose = require('mongoose');
const URLSlugs = require('mongoose-url-slugs');
const Schema = mongoose.Schema;

const PostSchema = new Schema({


user: {
    type: Schema.Types.ObjectId,
    ref: 'users'

},

category:{
    type: Schema.Types.ObjectId,
    ref: 'categories'

},

comments: [{
    type: Schema.Types.ObjectId,
    ref: 'comments'

}],

title:{
    type: String,
    require: true
},

file:{
    type: String,
},

status:{
    type: String,
    default: 'public'
},

allowComments:{
    type: Boolean,
    require: true
},

body:{
    type: String,
    require: true
},

date: {
    type: Date,
    default: Date.now()
},

slug: {
    type: String
}

}, {usePushEach: true});

PostSchema.plugin(URLSlugs('title', {field: 'slug'}));
module.exports = mongoose.model('posts', PostSchema);

