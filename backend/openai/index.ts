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

interface Message {
  role: "system" | "user";
  content: string;
}

interface OpenAIRequest {
  model: string;
  messages: Message[];
  function: Function;
}
export interface CallOpenAIProps {
  system: string;
  user: string;
  functions: Function[];
}

export interface OpenAIResponse {
  system: string;
  user: string;
  functions: Function[];
}

function buildBody(props: CallOpenAIProps): string {
  return JSON.stringify({
    model: "gpt-3.5-turbo-0613",
    messages: [
      { role: "system", content: props.system },
      { role: "user", content: props.user },
    ],
    functions: props.functions.map((f) => ({
      ...f,
      fnName: undefined,
      name: f.fnName,
    })),
  });
}

export async function callOpenAI(props: CallOpenAIProps) {
  fetch("https://oai.hconeai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.OPENAI_API_KEY,
    },
    body: buildBody(props),
  });
}
