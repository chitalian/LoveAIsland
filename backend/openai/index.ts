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

/*
{
  "id": "chatcmpl-7cjSzD0Ig1hacKce4Mm574OxGVZUw",
  "object": "chat.completion",
  "created": 1689465593,
  "model": "gpt-3.5-turbo-0613",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": null,
        "function_call": {
          "name": "interact",
          "arguments": "{\n  \"agentId\": \"73cf3e2f-9631-4aa4-bc8f-48fd4fa9af12\",\n  \"chatText\": \"Hello, how are you?\"\n}"
        }
      },
      "finish_reason": "function_call"
    }
  ],
  "usage": {
    "prompt_tokens": 825,
    "completion_tokens": 52,
    "total_tokens": 877
  }
}
*/

interface MoveFunction {
  name: "move";
  arguments: {
    direction: "up" | "down" | "left" | "right";
  };
}

interface InteractFunction {
  name: "interact";
  arguments: {
    agentId: string;
    chatText: string;
  };
}
export interface OpenAIResponse {
  id: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: "assistant";
      content: null;
      function_call: InteractFunction | MoveFunction;
    };
  }[];
}

//TODO

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
  return fetch("https://oai.hconeai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + Deno.env.get("OPENAI_API_KEY"),
      "Helicone-Auth": "Bearer " + Deno.env.get("HELICONE_API_KEY"),
    },
    body: buildBody(props),
  }).then((r) => r.json() as Promise<OpenAIResponse>);
}
