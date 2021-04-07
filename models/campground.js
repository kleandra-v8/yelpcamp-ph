const mongoose = require('mongoose');
const {Schema} = mongoose;
const Review = require('./review');

const ImageSchema = new Schema ({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get( function() {
    return this.url.replace( '/upload', '/upload/w_200' );
});

const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema({
    name: String,
    price: Number,
    description: String,
    location: String,
    images: [ ImageSchema ],
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }],
    geometry: {
        type: {
            type: String,
            enum: [ 'Point' ],
            required: true
        },
        coordinates: {
            type: [ Number ],
            required: true
        }
    }
}, opts);

CampgroundSchema.index({ name: "text", location: "text" });

CampgroundSchema.virtual('properties.popupText').get( function() {
    // return `<p><img src="${this.images[0].thumbnail}"></p>
    return `<h2 class="fs-6 mb-1">
        <a href="/campgrounds/${this._id}" class="text-success"
            >${this.name}</a></h2>
        <div>${this.description.substring(0, 75)}...</div>`
});

CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({ _id: { $in: doc.reviews }});
    }
});

module.exports = mongoose.model('Campground', CampgroundSchema);