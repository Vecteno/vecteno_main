import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/lib/db";
import userModel from "@/app/models/userModel";
import { downloadAndSaveImage } from "@/lib/imageUtils";
import { verifyJWT } from "@/lib/jwt";
import { cookies } from "next/headers";

const isProd = process.env.NODE_ENV === "production";
const usingIP = process.env.NEXTAUTH_URL?.includes("://31."); // crude check for IP usage

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
  cookies: {
    sessionToken: {
      name: `${isProd ? "__Secure-" : ""}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // ✅ since you're on http
        domain: ".test.godofgraphic.com", // ✅ force cookies to your test domain
      },
    },
    callbackUrl: {
      name: `${isProd ? "__Secure-" : ""}next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    csrfToken: {
      name: `${isProd ? "__Host-" : ""}next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  callbacks: {
    async jwt({ token, account, user }) {
      // Handle Google OAuth login
      if (account && user) {
        await connectToDatabase();

        const existingUser = await userModel.findOne({ email: user.email });

        if (!existingUser) {
          let localImageUrl = null;
          if (user.image) {
            try {
              localImageUrl = await downloadAndSaveImage(user.image);
            } catch (error) {
              console.error("Failed to download Google profile image:", error);
              localImageUrl = null;
            }
          }

          const newUser = await userModel.create({
            name: user.name,
            email: user.email,
            isGoogleUser: true,
            role: "user",
            profileImage: localImageUrl,
          });

          token.id = newUser._id.toString();
          token.role = newUser.role;
          token.picture = localImageUrl;
        } else {
          token.id = existingUser._id.toString();
          token.role = existingUser.role;
          token.picture = existingUser.profileImage;
        }

        token.email = user.email;
        token.name = user.name;
      }

      // Custom JWT fallback
      if (!token.id) {
        try {
          const cookieStore = await cookies();
          const jwtToken = cookieStore.get("token")?.value;

          if (jwtToken) {
            const decoded = await verifyJWT(jwtToken);
            if (decoded && decoded.id) {
              await connectToDatabase();
              const userDoc = await userModel.findById(decoded.id);
              if (userDoc) {
                token.id = userDoc._id.toString();
                token.role = userDoc.role;
                token.email = userDoc.email;
                token.name = userDoc.name;
                token.picture = userDoc.profileImage;
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
      if (!session?.user && token.id) {
        session = {
          user: {
            id: token.id,
            email: token.email,
            name: token.name,
            image: token.picture,
            role: token.role || "user",
          },
          expires: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
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
