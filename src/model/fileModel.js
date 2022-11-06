const { Schema, model, Types } = require("mongoose");

const schema = new Schema({
  name: {
    type: String,
  },
  contentType: {
    type: String,
  },
  extension: {
    type: String,
  },
  orginalName: {
    type: String,
  },
  size: {
    type: Number,
  },
  url: {
    type: String,
  },
  path: {
    type: String,
  },
  createdById: {
    type: Types.ObjectId,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
  },
  deletedById: {
    type: Types.ObjectId,
  },
});

module.exports = {
  FileModel: model("Files", schema),
};
