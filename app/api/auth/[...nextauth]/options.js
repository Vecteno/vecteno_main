import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import { downloadAndSaveImage } from "@/lib/imageUtils";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, user }) {
      if (account && user) {
        await connectToDatabase();

        let dbUser = await userModel.findOne({ email: user.email });

        if (!dbUser) {
          let localImageUrl = null;
          if (user.image) {
            try {
              localImageUrl = await downloadAndSaveImage(user.image);
            } catch {
              localImageUrl = null;
            }
          }

          dbUser = await userModel.create({
            name: user.name,
            email: user.email,
            isGoogleUser: true,
            role: "user",
            profileImage: localImageUrl,
          });
        }

        token.id = dbUser._id.toString();
        token.role = dbUser.role;
        token.picture = dbUser.profileImage;
        token.email = dbUser.email;
        token.name = dbUser.name;
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.image = token.picture;
      }
      return session;
    },
  },
};
