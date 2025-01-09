import { Step, StepType } from "./types";

import * as xml2js from "xml2js";

/*
 * Parse input XML and convert it into steps.
 * Eg: Input -
 * <boltArtifact id=\"project-import\" title=\"Project Files\">
 *  <boltAction type=\"file\" filePath=\"eslint.config.js\">
 *      import js from '@eslint/js';\nimport globals from 'globals';\n
 *  </boltAction>
 * <boltAction type="shell">
 *      node index.js
 * </boltAction>
 * </boltArtifact>
 *
 * Output -
 * [{
 *      title: "Project Files",
 *      status: "Pending"
 * }, {
 *      title: "Create eslint.config.js",
 *      type: StepType.CreateFile,
 *      code: "import js from '@eslint/js';\nimport globals from 'globals';\n"
 * }, {
 *      title: "Run command",
 *      code: "node index.js",
 *      type: StepType.RunScript
 * }]
 *
 * The input can have strings in the middle they need to be ignored
 */
// export async function parseXml(response: string): Step[] {
//   // Extract the XML content between <boltArtifact> tags
//   const xmlMatch = response.match(
//     /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/
//   );

//   if (!xmlMatch) {
//     return [];
//   }

//   const xmlContent = xmlMatch[1];
//   const steps: Step[] = [];
//   let stepId = 1;

//   const parser = new xml2js.Parser({
//     trim: true,
//     explicitArray: false,
//     mergeAttrs: true,
//   });
// try{
//   const result = parser.parseStringPromise(response);

//   const artifact = result.boltArtifact>
//   ;
//   if (!artifact) {
//     return steps;
//   }

//   // Extract artifact title
//   const titleMatch = response.match(/title="([^"]*)"/);
//   const artifactTitle = titleMatch ? titleMatch[1] : "Project Files";

//   // Add initial artifact step
//   steps.push({
//     id: stepId++,
//     title: artifactTitle,
//     description: "",
//     type: StepType.CreateFolder,
//     status: "pending",
//   });

//   // Regular expression to find boltAction elements
//   const actionRegex =
//     /<boltAction\s+type="([^"]*)"(?:\s+filePath="([^"]*)")?>([\s\S]*?)<\/boltAction>/g;

//   let match;
//   while ((match = actionRegex.exec(xmlContent)) !== null) {
//     const [, type, filePath, content] = match;

//     if (type === "file") {
//       // File creation step
//       steps.push({
//         id: stepId++,
//         title: `Create ${filePath || "file"}`,
//         description: "",
//         type: StepType.CreateFile,
//         status: "pending",
//         code: content.trim(),
//         path: filePath,
//       });
//     } else if (type === "shell") {
//       // Shell command step
//       steps.push({
//         id: stepId++,
//         title: "Run command",
//         description: "",
//         type: StepType.RunScript,
//         status: "pending",
//         code: content.trim(),
//       });
//     }
//   }

//   return steps;
// }
export async function parseXml(response: string): Promise<Step[]> {
  // Extract the XML content between <boltArtifact> tags
  const xmlMatch = response.match(
    /<boltArtifact[^>]*>([\s\S]*?)<\/boltArtifact>/
  );

  if (!xmlMatch) {
    return [];
  }

  const xmlContent = xmlMatch[0]; // Use the entire <boltArtifact> block
  const steps: Step[] = [];
  let stepId = 1;

  const parser = new xml2js.Parser({
    trim: true,
    explicitArray: false,
    mergeAttrs: true,
  });

  try {
    // Await the parsing result
    const result = await parser.parseStringPromise(xmlContent);

    const artifact = result.boltArtifact;
    if (!artifact) {
      return steps;
    }

    // Add initial artifact step
    steps.push({
      id: stepId++,
      title: artifact.title || "Project Files",
      description: "",
      type: StepType.CreateFolder,
      status: "pending",
    });

    // Handle boltAction elements
    const actions = Array.isArray(artifact.boltAction)
      ? artifact.boltAction
      : [artifact.boltAction];

    actions.forEach((action: any) => {
      const { type, filePath } = action;
      const content = action._ || "";

      if (type === "file") {
        // File creation step
        steps.push({
          id: stepId++,
          title: `Create ${filePath || "file"}`,
          description: "",
          type: StepType.CreateFile,
          status: "pending",
          code: content.trim(),
          path: filePath,
        });
      } else if (type === "shell") {
        // Shell command step
        steps.push({
          id: stepId++,
          title: "Run command",
          description: "",
          type: StepType.RunScript,
          status: "pending",
          code: content.trim(),
        });
      }
    });

    return steps;
  } catch (error) {
    console.error("Error parsing XML:", error);
    return [];
  }
}
