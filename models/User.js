import mongoose from 'mongoose';
const re =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        match: re,
    },
    password: { type: String, required: true, minLength: 8, maxLength: 16 },
});

const User = mongoose.model('User', userSchema);
export default User;
