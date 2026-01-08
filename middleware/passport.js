import passport from "passport";
import{ Strategy as  GoogleStrategy } from "passport-google-oauth20";

passport.use(new GoogleStrategy({
    clientID:process.env.Google_Client_Id,
    clientSecret:process.env.Google_Client_Secret,
    callbackURL:"http://localhost:3001/api/auth/google/callback"
}))