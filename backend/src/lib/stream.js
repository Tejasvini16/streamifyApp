import { StreamChat } from "stream-chat";

import dotenv from "dotenv";
dotenv.config();

const apikey=process.env.STREAM_API_KEY;
const secret=process.env.STREAM_SECRET_KEY;

if (!apikey || !secret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apikey, secret);

export const upsertStreamUser = async (userData) => {
  try {
    // Create/Update a user in Stream( update+insert=upsert )
    const streamUser = await streamClient.upsertUser(userData);
    return streamUser;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
}

export const generateStreamToken = (userId) => {
  try {
    // Generate a token for the user
    const token = streamClient.createToken(userId.toString());
    return token;
  } catch (error) {
    console.error("Error generating Stream token:", error);
  }
}