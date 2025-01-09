"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const openai_1 = __importDefault(require("openai"));
const prompts_1 = require("./prompts");
const node_1 = require("./defaults/node");
const react_1 = require("./defaults/react");
const prompts_2 = require("./prompts");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/template", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_1, _b, _c;
    var _d, _e, _f;
    const prompt = req.body.prompt;
    // const systemPrompt: string = getSystemPrompt();
    const openai = new openai_1.default();
    const response = yield openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "Return either node or react based on what do you think this project should be. Only return a single word either 'node' or 'react'. Do not return anything extra", // Use the dynamic system prompt here
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
    try {
        for (var _g = true, response_1 = __asyncValues(response), response_1_1; response_1_1 = yield response_1.next(), _a = response_1_1.done, !_a; _g = true) {
            _c = response_1_1.value;
            _g = false;
            const chunk = _c;
            const content = ((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || "";
            result += content;
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (!_g && !_a && (_b = response_1.return)) yield _b.call(response_1);
        }
        finally { if (e_1) throw e_1.error; }
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
    const answer = (_f = result === null || result === void 0 ? void 0 : result.trim()) === null || _f === void 0 ? void 0 : _f.toLowerCase();
    if (answer === "react") {
        res.json({
            prompts: [
                prompts_2.BASE_PROMPT,
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [react_1.basePrompt],
        });
        return;
    }
    if (answer === "node") {
        res.json({
            prompts: [
                `Here is an artifact that contains all files of the project visible to you.\nConsider the contents of ALL files in the project.\n\n${react_1.basePrompt}\n\nHere is a list of files that exist on the file system but are not being shown to you:\n\n  - .gitignore\n  - package-lock.json\n`,
            ],
            uiPrompts: [node_1.basePrompt],
        });
        return;
    }
    // Default case if no condition matches
    res.status(403).json({ message: "You can't access this" });
    return;
}));
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
app.post("/chat", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, e_2, _b, _c;
    var _d, _e;
    try {
        const systemPrompt = (0, prompts_1.getSystemPrompt)();
        const openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY || "", // Replace with your OpenAI API key
        });
        const messages = req.body.messages;
        // Validate messages format
        if (!Array.isArray(messages) ||
            !messages.every((msg) => typeof msg.role === "string" && typeof msg.content === "string")) {
            res.status(400).json({
                message: "Invalid messages format. Each message must be an object with 'role' and 'content' as strings.",
            });
            return;
        }
        // Add the system prompt as the first message
        messages.unshift({
            role: "system",
            content: systemPrompt,
        });
        // Call OpenAI API
        const response = yield openai.chat.completions.create({
            model: "gpt-4", // Specify your desired model
            messages: messages,
            stream: true,
            // Set max tokens for the response
        });
        let result = "";
        try {
            // Handle streamed response
            for (var _f = true, _g = __asyncValues(response), _h; _h = yield _g.next(), _a = _h.done, !_a; _f = true) {
                _c = _h.value;
                _f = false;
                const chunk = _c;
                const content = ((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || "";
                result += content;
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_f && !_a && (_b = _g.return)) yield _b.call(_g);
            }
            finally { if (e_2) throw e_2.error; }
        }
        // Send the result back to the client
        res.json({ result });
    }
    catch (error) {
        console.error("Error:", error.message);
        // Handle errors gracefully
        res.status(500).json({
            error: "An error occurred while processing your request.",
            details: error.message,
        });
    }
}));
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
