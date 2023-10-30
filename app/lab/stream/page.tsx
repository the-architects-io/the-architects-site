"use client";
import { ContentWrapper } from "@/features/UI/content-wrapper";
import { useState } from "react";

export default function Index() {
  const [body, setBody] = useState("Test body huzzah!");
  const [streamedTexts, getStreamedTexts] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    getStreamedTexts("");
    setIsLoading(true);
    const response = await fetch("/api/get-stream", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = response.body;
    if (!data) {
      return;
    }
    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      getStreamedTexts((prev) => prev + chunkValue);
    }

    setIsLoading(false);
  };

  return (
    <ContentWrapper className="flex flex-col items-center">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder={
          "e.g. Lorem ipsum dolor sit amet, consectetur adipiscing elit."
        }
      />
      <button onClick={(e) => handleSubmit(e)}>Submit</button>
      <hr />
      <div>
        {streamedTexts && (
          <>
            <div>
              <h2 className="text-xl uppercase my-4 text-center">
                Streamed Text
              </h2>
            </div>
            <div>
              {streamedTexts
                .substring(streamedTexts.indexOf("1") + 3)
                .split("2.")
                .map((text: any) => {
                  return (
                    <div key={text}>
                      <p>{text}</p>
                    </div>
                  );
                })}
            </div>
          </>
        )}
      </div>
    </ContentWrapper>
  );
}
