import mongoose from "mongoose";

const CodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
  },fileName: {
    type: String,
    required: false,
  },
  language: {
    type: String,
    enum: [
      "Python",
      "PY",
      "py",
      "PYTHON",
      "python",
      "JavaScript",
      "JS",
      "Javascript",
      "js",
      "JAVASCRIPT",
      "javascript",
    ],
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  executionTime: {
    type: String, 
    required: true,
  },
  output: {
    type: String,
  },
     graph: {
        type: String, 
        default: null
    },
  error: {
    type: String,
  },
dateOfSubmission: {
  type: String,
  default: () =>
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
},
});
const Code = mongoose.model('code',CodeSchema) 
export default Code;