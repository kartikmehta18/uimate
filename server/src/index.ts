require("dotenv").config();
import cors from 'cors';
import express, { Request, Response } from "express";
import OpenAI from "openai";
import { getSystemPrompt } from "./prompts";
import { basePrompt as nodeBasePrompt } from "./defaults/node";
import { basePrompt as reactBasePrompt } from "./defaults/react";
import { BASE_PROMPT } from "./prompts";

import fs from "fs";
const app = express();
app.use(cors());
app.use(express.json());




app.post("/template", async (req, res) => {
  const prompt = req.body.prompt;

  // const systemPrompt: string = getSystemPrompt();

  const openai = new OpenAI();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra", // Use the dynamic system prompt here
      },
      {
        role: "user",
        content: prompt,
        // content: " give me the code of to do list",
      },
    ],
    stream: true,
  });
  let result = "";
  for await (const chunk of response) {
    const content = chunk.choices[0]?.delta?.content || "";
    result += content;
    // process.stdout.write(content);
  }
  // console.log(result);
  // Respond with the final accumulated result
  // res.json({ data: result });
  // for await (const chunk of response) {
  //   process.stdout.write(chunk.choices[0]?.delta?.content || ""); // Stream the response to the console
  // }

  // const answer = result;
  // const answer = result.trim().toLowerCase();
  // if (answer == "react") {
  //   res.json({ prompts: [BASE_PROMPT, reactBasePrompt] });
  //   return;
  // }
  // if (answer == "node") {
  //   res.json({ prompts: [nodeBasePrompt] });
  //   return;
  // } else {
  //   res.status(403).json({ message: "you cant access this" });
  //   return;
  // }
  const answer = result?.trim()?.toLowerCase();

  if (answer === "react") {
    res.json({
      prompts: [
        BASE_PROMPT,
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [reactBasePrompt],
    });
    return;
  }

  if (answer === "node") {
    res.json({
      prompts: [
        `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
      ],
      uiPrompts: [nodeBasePrompt],
    });
    return;
  }

  // Default case if no condition matches
  res.status(403).json({ message: "You can't access this" });
  return;
});

//   try {
//     const prompt = req.body.prompt;

//     if (!prompt) {
//       return res.status(400).json({ error: "Prompt is required" });
//     }

//     const openai = new OpenAI({
//       apiKey: process.env.OPENAI_API_KEY || "", // Ensure API key is provided
//     });

//     // Construct the OpenAI chat prompt
//     const response = await openai.chat.completions.create({
//       model: "gpt-4",
//       messages: [
//         {
//           role: "system",
//           content:
//             "Return either 'node' or 'react' based on what you think this project should be. Only return a single word, either 'node' or 'react'. Do not return anything extra.",
//         },
//         {
//           role: "user",
//           content: prompt,
//         },
//       ],
//       max_tokens: 50, // Limit the response to ensure brevity
//     });

//     // Extract the content from the response
//     const answer = response.choices[0]?.message?.content?.trim().toLowerCase() || "";

//     // Handle the response
//     if (answer === "react") {
//       res.json({
//         prompts: [BASE_PROMPT, reactBasePrompt],
//       });
//       return;
//     }

//     if (answer === "node") {
//       res.json({
//         prompts: [nodeBasePrompt],
//       });
//       return;
//     }

//     res.status(403).json({ message: "You can't access this" });
//   } catch (error: any) {
//     console.error("Error:", error.message);
//     res.status(500).json({ error: "An unexpected error occurred" });
//   }
// });

// app.post("/chat", async (req, res) => {
//   const systemPrompt: string = getSystemPrompt();
//   const openai = new OpenAI();
//   const messages = req.body.messages;
//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       messages,
//       {
//         role: "system",
//         content: systemPrompt,
//       },
//     ],
//     stream: true,
//   });

//   let result = "";
//   for await (const chunk of response) {
//     const content = chunk.choices[0]?.delta?.content || "";
//     result += content;
//     // process.stdout.write(content);
//     console.log(result)
//   }

// });

// app.post("/chat", async (req, res) => {
//   const systemPrompt = getSystemPrompt();
//   const openai = new OpenAI();

//   const messages = req.body.messages;

//   if (
//     !Array.isArray(messages) ||
//     !messages.every((msg) => msg.role && msg.content)
//   ) {
//     res
//       .status(400)
//       .json({
//         message:
//           "Invalid messages format. Each message must have 'role' and 'content'.",
//       });
//     return;
//   }

//   messages.push({
//     role: "system",
//     content: systemPrompt,
//   });

//   // Call OpenAI API
//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: messages,
//     stream: true,
//   });

//   let result = "";

//   for await (const chunk of response) {
//     const content = chunk.choices[0]?.delta?.content || "";
//     result += content;
//     console.log(result); // Debugging output
//   }

//   res.json({ result });
//   return;
// });

app.post("/chat", async (req, res) => {
  try {
    const systemPrompt = getSystemPrompt();
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || "", // Replace with your OpenAI API key
    });

    const messages = req.body.messages;

    // Validate messages format
    if (
      !Array.isArray(messages) ||
      !messages.every(
        (msg) => typeof msg.role === "string" && typeof msg.content === "string"
      )
    ) {
      res.status(400).json({
        message:
          "Invalid messages format. Each message must be an object with 'role' and 'content' as strings.",
      });
      return;
    }

    // Add the system prompt as the first message
    messages.unshift({
      role: "system",
      content: systemPrompt,
    });

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Specify your desired model
      messages: messages,
      stream: true,
      // Set max tokens for the response
    });

    let result = "";

    // Handle streamed response
    for await (const chunk of response as AsyncIterable<any>) {
      const content = chunk.choices[0]?.delta?.content || "";
      result += content;
    }

    // Send the result back to the client
    res.json({ result });
  } catch (error: any) {
    console.error("Error:", error.message);

    // Handle errors gracefully
    res.status(500).json({
      error: "An error occurred while processing your request.",
      details: error.message,
    });
  }
});

app.listen(3000);

// async function main() {
//   try {
//     // Get the system prompt dynamically
//     const systemPrompt: string = getSystemPrompt();

//     const openai = new OpenAI();

//     const stream = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content: systemPrompt, // Use the dynamic system prompt here
//         },
//         {
//           role: "user",
//           content:
//             "For all designs I ask you to make,have them be beautiful, not cookie cutter. Make webpages thatare fully featured and worthy for production.\n\nBy default,this template supports JSX syntax with Tailwind CSS classes,React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them. \n\nUse icons from lucide-react for logos.\n\nUse stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n\n",
//         },
//         {
//           role: "user",
//           content:
//             "Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${reactBasePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n",
//         },
//         {
//           role: "user",
//           content: "create a tic tak toi game",
//         },
//       ],
//       stream: true,
//     });

//     // Stream the response to the console
//     for await (const chunk of stream) {
//       process.stdout.write(chunk.choices[0]?.delta?.content || "");
//     }
//   } catch (error) {
//     console.error("Error:", (error as Error).message);
//   }
// }

// main();

// Get the system prompt dynamically

// Stream the response to the console
