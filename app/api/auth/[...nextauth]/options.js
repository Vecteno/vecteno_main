import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import { downloadAndSaveImage } from "@/lib/imageUtils";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account, user, req }) {
      // Handle Google OAuth login
      if (account && user) {
        await connectToDatabase();

        const existingUser = await userModel.findOne({ email: user.email });

        if (!existingUser) {
          // Download Google profile image and save locally
          let localImageUrl = null;
          if (user.image) {
            try {
              localImageUrl = await downloadAndSaveImage(user.image);
            } catch (error) {
              console.error('Failed to download Google profile image:', error);
              localImageUrl = null; // Fallback to no image
            }
          }

          const newUser = await userModel.create({
            name: user.name,
            email: user.email,
            isGoogleUser: true,
            role: "user",
            profileImage: localImageUrl,
          });
          token.id = newUser._id;
          token.role = newUser.role;
          token.picture = localImageUrl; // Set local image URL
        } else {
          token.id = existingUser._id;
          token.role = existingUser.role;
          token.picture = existingUser.profileImage; // Use existing local image
        }

        token.email = user.email;
        token.name = user.name;
        // token.picture is already set above based on local/existing image
      }
      
      // Check for custom JWT token if no NextAuth token exists
      if (!token.id) {
        try {
          const cookieStore = await cookies();
          const jwtToken = cookieStore.get("token")?.value;
          
          if (jwtToken) {
            const decoded = await verifyJWT(jwtToken);
            if (decoded && decoded.id) {
              await connectToDatabase();
              const user = await userModel.findById(decoded.id);
              if (user) {
                token.id = user._id;
                token.role = user.role;
                token.email = user.email;
                token.name = user.name;
                token.picture = user.profileImage;
              }
            }
          }
        } catch (error) {
          console.log("Error reading custom JWT:", error);
        }
      }
      
      return token;
    },

    async session({ session, token }) {
      // If no NextAuth session but we have custom JWT, create session
      if (!session?.user && token.id) {
        session = {
          user: {
            id: token.id,
            email: token.email,
            name: token.name,
            image: token.picture,
            role: token.role || "user"
          },
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };
      } else if (session?.user) {
        session.user.id = token.id;
        session.user.image = token.picture;
        session.user.role = token.role || "user";
      }
      
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
};
