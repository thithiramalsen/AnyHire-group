import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Counter from "./counter.model.js";

const userSchema = new mongoose.Schema({
    _id: { type: Number },
    name:{
        type: String,
        required: [true, "Name is required"]
    },
    email:{
        type: String,
        required: [true, "email is required"],
        unique: true,
        lowercase: true,
        trim: true
    },
    password:{
        type: String,
        required: [true, "Password os required"],
        minlength: [6, "Password must be atleast 6 characters long",]
    },
    
    role:{
        type: String,
        enum: ["customer", "jobSeeker", "admin"],
        default: "customer"
    },

    image: {
        type: String,
        default: null, // Default to null if no image is provided
    },

    
}, {
     //createdAt, updatedAt
    timestamps: true 
}
)

// Add pre-save middleware to handle auto-incrementing
userSchema.pre('save', async function(next) {
    if (this.isNew) {
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'userId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this._id = counter.seq;
    }
    next();
});

//pre-save hook to hash password before saving to the database
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    try{
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch(error){
        next(error);
    }
});

//credential check
userSchema.methods.comparePassword = async function (password){
    return bcrypt.compare(password, this.password)
};

const User = mongoose.model("User", userSchema);

export default User;
