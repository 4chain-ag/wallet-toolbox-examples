
import fetch from "node-fetch";
const API_BASE_URL = "http://localhost:3000";
const INTERNALIZE_ENDPOINT = `${API_BASE_URL}/api/internalize`;

export async function testInternalize(
    txid: string,
    identityKey: string,
    vout: number = 0
  ) {
    try {
      console.log("Testing Internalize Endpoint");
      console.log("================================");
      console.log(`TXID: ${txid}`);
      console.log(`Identity Key: ${identityKey}`);
      console.log(`VOUT: ${vout}`);
      console.log(`Endpoint: ${INTERNALIZE_ENDPOINT}`);
      console.log("");
  
      const requestBody = {
        txid,
        identityKey,
        vout,
      };
  
      console.log("Sending request...");
      const response = await fetch(INTERNALIZE_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
  
      const responseData = await response.json();
  
      console.log(`Response Status: ${response.status}`);
      console.log("Response Data:");
      console.log(JSON.stringify(responseData, null, 2));
  
      if (response.status === 200) {
        console.log("Internalize successful!");
      } else {
        console.log("Internalize failed!");
      }
  
      return responseData;
    } catch (error) {
      console.error("Error calling internalize endpoint:", error);
      throw error;
    }
  }


  const s = async () => {
    const r = await testInternalize(
        "05e04d360b3287ae3c8a9ed7eb2a3b534e81e5611467fc881a3b90f393be069a",
        "020c0ca23c75f7312bad0c5d81bff858bdcf468d3ad69a60b46ae90cafef557b03",
        0
    )
    console.log(r);
}

s();
