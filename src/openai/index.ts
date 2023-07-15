interface Function {
  fnName: string;
  description: string;
  parameters: {
    type: string;
    properties: {
      [key: string]: {
        type: string;
        description: string;
        enum?: string[];
      };
    };
    required: string[];
  };
}

interface OpenAIRequest {
  system: string;
  user: string;
  functions: Function[];
}

async function callOpenAI(prompt: string) {
  fetch("https://oai.hconeai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: JSON.stringify({}),
  });
}
