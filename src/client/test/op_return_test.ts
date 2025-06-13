import fetch from "node-fetch";

const API_BASE_URL = "http://localhost:3000";
const OPRETURN_ENDPOINT = `${API_BASE_URL}/api/opreturn`;

export async function testOpReturn(text: string) {
  try {
    console.log("Testing OP_RETURN Endpoint");
    console.log("==============================");
    console.log(`Text: ${text}`);
    console.log(`Endpoint: ${OPRETURN_ENDPOINT}`);
    

    const requestBody = {
      text,
    };

    console.log("Sending request...");
    const response = await fetch(OPRETURN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseData = await response.json();

    if (response.status === 200) {
      console.log("OP_RETURN successful!");
    } else {
      console.log("OP_RETURN failed!");
    }

    return responseData;
  } catch (error) {
    console.error("Error calling OP_RETURN endpoint:", error);
    throw error;
  }
}

const s = async () => {
  const r = await testOpReturn("Hello, world 123!");
  console.log(r);
};

s();
